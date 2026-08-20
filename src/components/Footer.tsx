import SiteFooter from "@/components/homepage/SiteFooter";

/**
 * Public site footer.
 *
 * Delegates to the 2026 SiteFooter so every public page shares one footer,
 * including the brand lockup and the official tagline. Kept as `Footer` with
 * the same default export so the pages already rendering `<Footer />` need no
 * change.
 */
const Footer = () => <SiteFooter />;

export default Footer;
