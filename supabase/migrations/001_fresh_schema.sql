-- ============================================
-- ConceevHealth - Fresh Supabase-Native Schema
-- Project: rjmuhomeqydszmerlqrh
-- Created: 2026-03-05
-- ============================================
-- Design decisions:
--   - UUID primary keys (gen_random_uuid)
--   - timestamptz for all timestamps
--   - snake_case column naming (Postgres convention)
--   - Profiles table linked to auth.users (Supabase native auth)
--   - Auto-create profile trigger on signup
--   - Auto-update updated_at triggers
--   - Proper RLS policies (org-scoped access)
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================
-- ENUM TYPES
-- =====================
CREATE TYPE user_role AS ENUM ('SUPERADMIN', 'ADMIN', 'USER');
CREATE TYPE lead_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE lead_rating AS ENUM ('HOT', 'WARM', 'COLD');
CREATE TYPE appointment_status AS ENUM ('PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED', 'NO_SHOW');
CREATE TYPE transaction_type AS ENUM ('CREDIT', 'DEBIT', 'REFUND');
CREATE TYPE subscription_status AS ENUM ('ACTIVE', 'PAUSED', 'CANCELLED', 'EXPIRED', 'PENDING');
CREATE TYPE task_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE social_platform AS ENUM ('INSTAGRAM', 'FACEBOOK', 'LINKEDIN', 'YOUTUBE', 'GOOGLE', 'TIKTOK');
CREATE TYPE post_status AS ENUM ('DRAFT', 'SCHEDULED', 'PUBLISHED', 'FAILED');

-- =====================
-- HELPER FUNCTIONS
-- =====================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================
-- 1. PROFILES (extends auth.users)
-- =====================
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text,
  image text,
  role user_role NOT NULL DEFAULT 'USER',
  is_two_factor_enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================
-- 2. SECTORS
-- =====================
CREATE TABLE sectors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER sectors_updated_at BEFORE UPDATE ON sectors FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================
-- 3. ORGANIZATIONS
-- =====================
CREATE TABLE organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  logo text,
  email text,
  phone text,
  website text,
  address text,
  city text,
  state text,
  zip_code text,
  country text,
  primary_color text,
  secondary_color text,
  industry text,
  size text,
  business_category text,
  business_description text,
  time_zone text NOT NULL DEFAULT 'Asia/Kolkata',
  gst_number text,
  pan_number text,
  interested_services text[],
  primary_objectives text[],
  product_access_types text[],
  referral_source text,
  marketing_updates boolean NOT NULL DEFAULT false,
  accepted_terms boolean NOT NULL DEFAULT false,
  wati_api_token text,
  wati_url text,
  wati_appointment_template text,
  wati_appointment_id text,
  razorpay_key text,
  razorpay_secret text,
  is_active boolean NOT NULL DEFAULT true,
  sector_id uuid REFERENCES sectors(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_organizations_sector ON organizations(sector_id);
CREATE TRIGGER organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================
-- 4. ORGANIZATION MEMBERS
-- =====================
CREATE TABLE organization_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  is_owner boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, organization_id)
);
CREATE INDEX idx_org_members_user ON organization_members(user_id);
CREATE INDEX idx_org_members_org ON organization_members(organization_id);
CREATE TRIGGER org_members_updated_at BEFORE UPDATE ON organization_members FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================
-- 5. ROLES & PERMISSIONS
-- =====================
CREATE TABLE org_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id, name)
);
CREATE INDEX idx_org_roles_org ON org_roles(organization_id);
CREATE TRIGGER org_roles_updated_at BEFORE UPDATE ON org_roles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE org_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  description text NOT NULL,
  module text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_org_permissions_module ON org_permissions(module);

CREATE TABLE org_role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES org_permissions(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(role_id, permission_id)
);
CREATE INDEX idx_role_perms_role ON org_role_permissions(role_id);
CREATE INDEX idx_role_perms_perm ON org_role_permissions(permission_id);

CREATE TABLE org_member_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES organization_members(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(member_id, role_id)
);
CREATE INDEX idx_member_roles_member ON org_member_roles(member_id);
CREATE INDEX idx_member_roles_role ON org_member_roles(role_id);

-- =====================
-- 6. INVITATIONS
-- =====================
CREATE TABLE invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  name text,
  invitation_code text NOT NULL UNIQUE,
  invitation_link text,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role_id uuid REFERENCES org_roles(id) ON DELETE SET NULL,
  invited_by_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  accepted_by_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'PENDING',
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_invitations_org ON invitations(organization_id);
CREATE INDEX idx_invitations_email ON invitations(email);
CREATE TRIGGER invitations_updated_at BEFORE UPDATE ON invitations FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================
-- 7. AUDIT LOGS
-- =====================
CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource text NOT NULL,
  resource_id text,
  changes jsonb,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_logs_org ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- =====================
-- 8. WALLETS & TRANSACTIONS
-- =====================
CREATE TABLE wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  balance decimal(12,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'INR',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_wallets_owner ON wallets(owner_id);
CREATE TRIGGER wallets_updated_at BEFORE UPDATE ON wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  amount decimal(12,2) NOT NULL,
  balance_after decimal(12,2) NOT NULL,
  description text,
  reference text,
  idempotency_key text UNIQUE,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_wallet_txn_wallet ON wallet_transactions(wallet_id);
CREATE INDEX idx_wallet_txn_created ON wallet_transactions(created_at DESC);

-- =====================
-- 9. PAYMENT ORDERS
-- =====================
CREATE TABLE payment_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  razorpay_order_id text UNIQUE,
  razorpay_payment_id text,
  razorpay_signature text,
  amount decimal(12,2) NOT NULL,
  currency text NOT NULL DEFAULT 'INR',
  status text NOT NULL DEFAULT 'CREATED',
  purpose text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_payment_orders_org ON payment_orders(organization_id);
CREATE TRIGGER payment_orders_updated_at BEFORE UPDATE ON payment_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================
-- 10. INVOICES
-- =====================
CREATE TABLE invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  invoice_number text NOT NULL UNIQUE,
  invoice_type text,
  amount decimal(12,2) NOT NULL,
  currency text NOT NULL DEFAULT 'INR',
  status text NOT NULL DEFAULT 'DRAFT',
  razorpay_invoice_id text,
  razorpay_payment_id text,
  billing_period_start timestamptz,
  billing_period_end timestamptz,
  due_date timestamptz,
  paid_at timestamptz,
  items jsonb,
  invoice_pdf_url text,
  billing_name text,
  billing_email text,
  billing_address text,
  billing_city text,
  billing_country text,
  billing_gst text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_invoices_org ON invoices(organization_id);
CREATE TRIGGER invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================
-- 11. PLANS & SUBSCRIPTIONS
-- =====================
CREATE TABLE plan_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  icon text,
  type text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER plan_services_updated_at BEFORE UPDATE ON plan_services FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES plan_services(id) ON DELETE CASCADE,
  name text NOT NULL,
  price decimal(10,2) NOT NULL,
  billing_cycle text NOT NULL DEFAULT 'MONTHLY',
  is_popular boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  razorpay_plan_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_plans_service ON plans(service_id);
CREATE TRIGGER plans_updated_at BEFORE UPDATE ON plans FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE plan_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  feature text NOT NULL,
  feature_slug text,
  is_included boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_plan_features_plan ON plan_features(plan_id);

CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
  status subscription_status NOT NULL DEFAULT 'PENDING',
  razorpay_subscription_id text,
  razorpay_customer_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  next_billing_date timestamptz,
  activated_at timestamptz,
  paused_at timestamptz,
  cancelled_at timestamptz,
  expires_at timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  billing_name text,
  billing_email text,
  billing_gst text,
  billing_address text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_subscriptions_org ON subscriptions(organization_id);
CREATE INDEX idx_subscriptions_plan ON subscriptions(plan_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE TRIGGER subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================
-- 12. LEAD MANAGEMENT
-- =====================
CREATE TABLE lead_statuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text,
  "order" int NOT NULL DEFAULT 0,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id, name)
);
CREATE INDEX idx_lead_statuses_org ON lead_statuses(organization_id);
CREATE TRIGGER lead_statuses_updated_at BEFORE UPDATE ON lead_statuses FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE lead_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id, name)
);
CREATE INDEX idx_lead_sources_org ON lead_sources(organization_id);
CREATE TRIGGER lead_sources_updated_at BEFORE UPDATE ON lead_sources FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  mobile text,
  gender text,
  dob date,
  company text,
  industry text,
  annual_revenue decimal(14,2),
  no_of_employees int,
  website_url text,
  type text,
  priority lead_priority DEFAULT 'MEDIUM',
  rating lead_rating,
  score int DEFAULT 0,
  status_id uuid REFERENCES lead_statuses(id) ON DELETE SET NULL,
  source_id uuid REFERENCES lead_sources(id) ON DELETE SET NULL,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  owner_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  socials jsonb,
  tag_names text[],
  custom_fields jsonb,
  is_converted boolean NOT NULL DEFAULT false,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_leads_org ON leads(organization_id);
CREATE INDEX idx_leads_status ON leads(status_id);
CREATE INDEX idx_leads_source ON leads(source_id);
CREATE INDEX idx_leads_owner ON leads(owner_id);
CREATE INDEX idx_leads_created ON leads(created_at DESC);
CREATE INDEX idx_leads_not_deleted ON leads(organization_id) WHERE deleted_at IS NULL;
CREATE TRIGGER leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE lead_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  type text NOT NULL,
  content text,
  changes jsonb,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_lead_activities_lead ON lead_activities(lead_id);
CREATE INDEX idx_lead_activities_created ON lead_activities(created_at DESC);

CREATE TABLE tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id, name)
);
CREATE INDEX idx_tags_org ON tags(organization_id);
CREATE TRIGGER tags_updated_at BEFORE UPDATE ON tags FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE lead_tags (
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (lead_id, tag_id)
);
CREATE INDEX idx_lead_tags_tag ON lead_tags(tag_id);

CREATE TABLE lead_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  fields jsonb NOT NULL DEFAULT '[]',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_lead_forms_org ON lead_forms(organization_id);
CREATE TRIGGER lead_forms_updated_at BEFORE UPDATE ON lead_forms FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE lead_form_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid NOT NULL REFERENCES lead_forms(id) ON DELETE CASCADE,
  data jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_lead_form_subs_form ON lead_form_submissions(form_id);

CREATE TABLE lead_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES organization_members(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  columns jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(member_id, organization_id)
);
CREATE TRIGGER lead_views_updated_at BEFORE UPDATE ON lead_views FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE export_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'PENDING',
  file_url text,
  filters jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_export_jobs_org ON export_jobs(organization_id);
CREATE TRIGGER export_jobs_updated_at BEFORE UPDATE ON export_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================
-- 13. APPOINTMENTS & SCHEDULING
-- =====================
CREATE TABLE providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  image text,
  designation text,
  bio text,
  consultation_fee decimal(10,2),
  consultation_duration int DEFAULT 30,
  buffer_before int DEFAULT 0,
  buffer_after int DEFAULT 0,
  working_hours jsonb DEFAULT '{}',
  special_working_hours jsonb DEFAULT '{}',
  unavailability jsonb DEFAULT '[]',
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_providers_org ON providers(organization_id);
CREATE INDEX idx_providers_user ON providers(user_id);
CREATE TRIGGER providers_updated_at BEFORE UPDATE ON providers FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_locations_org ON locations(organization_id);
CREATE TRIGGER locations_updated_at BEFORE UPDATE ON locations FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE appointment_service_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  duration int,
  price decimal(10,2),
  is_active boolean NOT NULL DEFAULT true,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_appt_svc_cat_org ON appointment_service_categories(organization_id);
CREATE TRIGGER appt_svc_cat_updated_at BEFORE UPDATE ON appointment_service_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE availabilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week int NOT NULL,
  start_time text NOT NULL,
  end_time text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  provider_id uuid NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  location_id uuid REFERENCES locations(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_availabilities_provider ON availabilities(provider_id);
CREATE TRIGGER availabilities_updated_at BEFORE UPDATE ON availabilities FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  provider_id uuid REFERENCES providers(id) ON DELETE SET NULL,
  location_id uuid REFERENCES locations(id) ON DELETE SET NULL,
  service_category_id uuid REFERENCES appointment_service_categories(id) ON DELETE SET NULL,
  lead_id uuid REFERENCES leads(id) ON DELETE SET NULL,
  status appointment_status NOT NULL DEFAULT 'PENDING',
  note text,
  google_calendar_event_id text,
  meeting_link text,
  custom_fields jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_appointments_org ON appointments(organization_id);
CREATE INDEX idx_appointments_provider ON appointments(provider_id);
CREATE INDEX idx_appointments_lead ON appointments(lead_id);
CREATE INDEX idx_appointments_start ON appointments(start_time);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE TRIGGER appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================
-- 14. SOCIAL MEDIA
-- =====================
CREATE TABLE social_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  platform social_platform NOT NULL,
  access_token text,
  refresh_token text,
  page_access_token text,
  page_id text,
  expires_at timestamptz,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_social_conn_org ON social_connections(organization_id);
CREATE TRIGGER social_connections_updated_at BEFORE UPDATE ON social_connections FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE social_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  platform social_platform NOT NULL,
  content text,
  media jsonb,
  status post_status NOT NULL DEFAULT 'DRAFT',
  scheduled_at timestamptz,
  published_at timestamptz,
  platform_post_id text,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_social_posts_org ON social_posts(organization_id);
CREATE INDEX idx_social_posts_status ON social_posts(status);
CREATE TRIGGER social_posts_updated_at BEFORE UPDATE ON social_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE social_automations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  is_active boolean NOT NULL DEFAULT false,
  triggers jsonb,
  listener jsonb,
  keywords jsonb,
  dm_count int NOT NULL DEFAULT 0,
  comment_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_social_auto_org ON social_automations(organization_id);
CREATE TRIGGER social_automations_updated_at BEFORE UPDATE ON social_automations FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================
-- 15. ADVERTISING
-- =====================
CREATE TABLE ad_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  platform text NOT NULL,
  account_id text NOT NULL,
  access_token text,
  is_active boolean NOT NULL DEFAULT true,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_ad_accounts_org ON ad_accounts(organization_id);
CREATE TRIGGER ad_accounts_updated_at BEFORE UPDATE ON ad_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE ad_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_account_id uuid NOT NULL REFERENCES ad_accounts(id) ON DELETE CASCADE,
  external_campaign_id text,
  name text NOT NULL,
  status text,
  daily_budget decimal(10,2),
  total_budget decimal(10,2),
  total_spend decimal(10,2) DEFAULT 0,
  total_impressions int DEFAULT 0,
  total_clicks int DEFAULT 0,
  total_conversions int DEFAULT 0,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_ad_campaigns_account ON ad_campaigns(ad_account_id);
CREATE TRIGGER ad_campaigns_updated_at BEFORE UPDATE ON ad_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================
-- 16. NOTIFICATIONS
-- =====================
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  channel text NOT NULL DEFAULT 'IN_APP',
  title text NOT NULL,
  message text,
  is_read boolean NOT NULL DEFAULT false,
  read_at timestamptz,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_org ON notifications(organization_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE is_read = false;

-- =====================
-- 17. DASHBOARDS
-- =====================
CREATE TABLE dashboard_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text,
  "order" int DEFAULT 0,
  widgets jsonb NOT NULL DEFAULT '[]',
  layouts jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_dashboard_configs_org ON dashboard_configs(organization_id);
CREATE TRIGGER dashboard_configs_updated_at BEFORE UPDATE ON dashboard_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================
-- 18. TASKS & WORKSPACES
-- =====================
CREATE TABLE workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  is_private boolean NOT NULL DEFAULT false,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_workspaces_org ON workspaces(organization_id);
CREATE TRIGGER workspaces_updated_at BEFORE UPDATE ON workspaces FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE workspace_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  is_favorite boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, workspace_id)
);
CREATE INDEX idx_workspace_members_workspace ON workspace_members(workspace_id);

CREATE TABLE task_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_task_lists_workspace ON task_lists(workspace_id);
CREATE TRIGGER task_lists_updated_at BEFORE UPDATE ON task_lists FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'TODO',
  priority task_priority NOT NULL DEFAULT 'MEDIUM',
  start_date timestamptz,
  due_date timestamptz,
  list_id uuid NOT NULL REFERENCES task_lists(id) ON DELETE CASCADE,
  creator_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  assignee_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  subtasks jsonb DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_tasks_list ON tasks(list_id);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due ON tasks(due_date);
CREATE TRIGGER tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE task_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_task_comments_task ON task_comments(task_id);
CREATE TRIGGER task_comments_updated_at BEFORE UPDATE ON task_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================
-- 19. SERVICE CATALOG
-- =====================
CREATE TABLE service_catalog_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  label text NOT NULL,
  "order" int DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER svc_cat_categories_updated_at BEFORE UPDATE ON service_catalog_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE service_catalog_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  short_description text,
  detailed_description text,
  deliverables text[],
  ideal_for text,
  is_paid_marketing boolean NOT NULL DEFAULT false,
  monthly_price decimal(10,2),
  yearly_price decimal(10,2),
  is_active boolean NOT NULL DEFAULT true,
  is_recommended boolean NOT NULL DEFAULT false,
  category_id uuid NOT NULL REFERENCES service_catalog_categories(id) ON DELETE CASCADE,
  variants jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_svc_items_category ON service_catalog_items(category_id);
CREATE TRIGGER svc_items_updated_at BEFORE UPDATE ON service_catalog_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE service_catalog_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  billing_frequency text NOT NULL DEFAULT 'MONTHLY',
  total_amount decimal(12,2) NOT NULL,
  currency text NOT NULL DEFAULT 'INR',
  status text NOT NULL DEFAULT 'PENDING',
  razorpay_order_id text,
  razorpay_payment_id text,
  razorpay_subscription_id text,
  billing_name text,
  billing_email text,
  billing_gst text,
  billing_address text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz,
  cancelled_at timestamptz
);
CREATE INDEX idx_svc_orders_org ON service_catalog_orders(organization_id);
CREATE TRIGGER svc_orders_updated_at BEFORE UPDATE ON service_catalog_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE service_catalog_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES service_catalog_orders(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES service_catalog_items(id) ON DELETE RESTRICT,
  variant_name text,
  monthly_price decimal(10,2),
  is_paid_marketing boolean NOT NULL DEFAULT false,
  marketing_config jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_svc_order_items_order ON service_catalog_order_items(order_id);
CREATE TRIGGER svc_order_items_updated_at BEFORE UPDATE ON service_catalog_order_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE service_briefs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  order_item_id uuid UNIQUE NOT NULL REFERENCES service_catalog_order_items(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'PENDING',
  progress_percent int NOT NULL DEFAULT 0,
  template_fields jsonb,
  responses jsonb,
  updates jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_svc_briefs_org ON service_briefs(organization_id);
CREATE TRIGGER svc_briefs_updated_at BEFORE UPDATE ON service_briefs FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================
-- 20. SYSTEM TEMPLATES & CONFIG
-- =====================
CREATE TABLE system_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  sector_id uuid REFERENCES sectors(id) ON DELETE SET NULL,
  content jsonb NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_system_templates_sector ON system_templates(sector_id);
CREATE TRIGGER system_templates_updated_at BEFORE UPDATE ON system_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE platform_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER platform_configs_updated_at BEFORE UPDATE ON platform_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
