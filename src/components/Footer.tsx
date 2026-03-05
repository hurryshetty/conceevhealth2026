import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

export default function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">C</span>
              </div>
              <span className="font-serif text-xl font-bold">Coneev Health</span>
            </div>
            <p className="text-sm text-gray-300">
              Empowering healthcare businesses with modern digital solutions for growth and patient engagement.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/services" className="hover:text-white transition-colors">Services</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Features</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>Lead Management</li>
              <li>Appointment Scheduling</li>
              <li>Task Management</li>
              <li>Billing & Invoicing</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>support@conceevdigital.com</li>
              <li>Hyderabad, India</li>
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-gray-700" />

        <p className="text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} Coneev Health by Conceev Digital. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
