);
CREATE UNIQUE INDEX "service_briefs_orderItemId_key" ON "service_briefs"("orderItemId");
CREATE INDEX "service_briefs_userId_idx" ON "service_briefs"("userId");
CREATE INDEX "service_briefs_organizationId_idx" ON "service_briefs"("organizationId");
CREATE INDEX "service_briefs_status_idx" ON "service_briefs"("status");

-- =====================
-- 18. PLATFORM & TEMPLATES
-- =====================

CREATE TABLE "system_templates" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "sectorId" TEXT,
  "content" JSONB NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "system_templates_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "system_templates_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "sectors"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "system_templates_sectorId_idx" ON "system_templates"("sectorId");
CREATE INDEX "system_templates_type_idx" ON "system_templates"("type");

CREATE TABLE "platform_configs" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "value" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "platform_configs_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "platform_configs_key_key" ON "platform_configs"("key");

-- =====================
-- 19. ENABLE RLS ON ALL TABLES
-- =====================

ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "accounts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "verification_tokens" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "password_reset_tokens" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "two_factor_tokens" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "two_factor_confirmations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "organizations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "organization_members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "org_roles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "org_permissions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "org_role_permissions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "org_member_roles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "invitations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "wallets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "wallet_transactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payment_orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "invoices" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "plan_services" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "plans" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "plan_features" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "subscriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "lead_statuses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "lead_sources" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "leads" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "lead_activities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tags" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "_LeadToTag" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "lead_forms" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "lead_form_submissions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "lead_views" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "export_jobs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "providers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "locations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "appointment_service_categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "availabilities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "appointments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "social_connections" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "social_posts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "social_automations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ad_accounts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ad_campaigns" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "dashboard_configs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "workspaces" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "workspace_members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "task_lists" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tasks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "task_comments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "service_catalog_categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "service_catalog_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "service_catalog_orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "service_catalog_order_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "service_briefs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sectors" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "system_templates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "platform_configs" ENABLE ROW LEVEL SECURITY;

-- =====================
-- 20. RLS POLICIES (permissive for development)
-- =====================

DO $$
DECLARE
  tbl TEXT;
  tbls TEXT[] := ARRAY[
    'users', 'accounts', 'sessions', 'verification_tokens', 'password_reset_tokens',
    'two_factor_tokens', 'two_factor_confirmations', 'organizations', 'organization_members',
    'org_roles', 'org_permissions', 'org_role_permissions', 'org_member_roles',
    'invitations', 'audit_logs', 'wallets', 'wallet_transactions', 'payment_orders',
    'invoices', 'plan_services', 'plans', 'plan_features', 'subscriptions',
    'lead_statuses', 'lead_sources', 'leads', 'lead_activities', 'tags',
    '_LeadToTag', 'lead_forms', 'lead_form_submissions', 'lead_views', 'export_jobs',
    'providers', 'locations', 'appointment_service_categories', 'availabilities',
    'appointments', 'social_connections', 'social_posts', 'social_automations',
    'ad_accounts', 'ad_campaigns', 'notifications', 'dashboard_configs',
    'workspaces', 'workspace_members', 'task_lists', 'tasks', 'task_comments',
    'service_catalog_categories', 'service_catalog_items', 'service_catalog_orders',
    'service_catalog_order_items', 'service_briefs', 'sectors', 'system_templates',
    'platform_configs'
  ];
BEGIN
  FOREACH tbl IN ARRAY tbls
  LOOP
    EXECUTE format('CREATE POLICY "allow_select_%s" ON %I FOR SELECT USING (true)', tbl, tbl);
    EXECUTE format('CREATE POLICY "allow_insert_%s" ON %I FOR INSERT WITH CHECK (true)', tbl, tbl);
    EXECUTE format('CREATE POLICY "allow_update_%s" ON %I FOR UPDATE USING (true) WITH CHECK (true)', tbl, tbl);
    EXECUTE format('CREATE POLICY "allow_delete_%s" ON %I FOR DELETE USING (true)', tbl, tbl);
  END LOOP;
END $$;
