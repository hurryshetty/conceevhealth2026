import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import SiteHeader from "@/components/homepage/SiteHeader";
import LeadFormModal from "@/components/LeadFormModal";

/**
 * Public site header.
 *
 * Delegates to the 2026 SiteHeader so every public page shares one piece of
 * chrome. Kept as `Navbar` with the same default export and no props, so the
 * 21 pages that already render `<Navbar />` pick up the new design without a
 * single edit.
 *
 * The previous implementation carried its own Supabase typeahead. That search
 * now lives in the homepage's HealthcareSearch module; from an internal page
 * the header's search control opens the doctor directory instead.
 */
const Navbar = () => {
  const navigate = useNavigate();
  const [leadOpen, setLeadOpen] = useState(false);

  const handleSearch = useCallback(() => navigate("/doctors"), [navigate]);

  return (
    <>
      <SiteHeader onOpenSearch={handleSearch} onBook={() => setLeadOpen(true)} />
      <LeadFormModal open={leadOpen} onOpenChange={setLeadOpen} sourcePage="header" />
    </>
  );
};

export default Navbar;
