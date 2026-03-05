import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Users,
  CalendarCheck,
  CreditCard,
  ListTodo,
  BarChart3,
  Share2,
  Megaphone,
  FileText,
  ArrowRight,
} from "lucide-react";

const services = [
  {
    icon: Users,
    title: "Lead Management & CRM",
    description:
      "Full pipeline management with custom statuses, lead scoring, activity tracking, form submissions, and bulk import/export capabilities.",
    highlights: ["Custom lead statuses & sources", "Lead scoring & prioritization", "Web form capture", "Bulk import/export"],
  },
  {
    icon: CalendarCheck,
    title: "Appointment Scheduling",
    description:
      "Online booking with provider management, location support, service categories, Google Calendar sync, and automated reminders via WhatsApp.",
    highlights: ["Provider availability management", "Multi-location support", "Google Calendar sync", "WhatsApp reminders"],
  },
  {
    icon: CreditCard,
    title: "Billing & Payments",
    description:
      "Razorpay-integrated billing with digital wallets, invoice generation, subscription management, and payment order tracking.",
    highlights: ["Razorpay integration", "Digital wallet system", "Automated invoicing", "Subscription plans"],
  },
  {
    icon: ListTodo,
    title: "Task & Project Management",
    description:
      "Organize work across workspaces with task lists, assignments, priorities, due dates, subtasks, and team comments.",
    highlights: ["Workspaces & task lists", "Assignees & priorities", "Subtask tracking", "Team comments"],
  },
  {
    icon: BarChart3,
    title: "Analytics & Dashboards",
    description:
      "Customizable dashboards with real-time widgets for tracking practice performance, revenue, patient flow, and team productivity.",
    highlights: ["Custom dashboard layouts", "Real-time widgets", "Performance metrics", "Export reports"],
  },
  {
    icon: Share2,
    title: "Social Media Management",
    description:
      "Connect social accounts, schedule posts, manage automations with keyword triggers, and track engagement metrics.",
    highlights: ["Multi-platform posting", "Content scheduling", "Keyword automations", "Engagement tracking"],
  },
  {
    icon: Megaphone,
    title: "Ad Campaign Management",
    description:
      "Link ad accounts, monitor campaigns across platforms, and track spend, impressions, clicks, and conversions in one place.",
    highlights: ["Multi-platform ads", "Budget tracking", "Conversion metrics", "ROI analysis"],
  },
  {
    icon: FileText,
    title: "Service Catalog & Orders",
    description:
      "Publish a digital service catalog with pricing variants, accept orders, and manage service briefs with progress tracking.",
    highlights: ["Service catalog builder", "Pricing variants", "Order management", "Brief & progress tracking"],
  },
];

export default function Services() {
  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-br from-navy to-navy-light text-white py-20">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4">Our Services</h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            A comprehensive suite of tools designed specifically for healthcare practices to digitize,
            automate, and grow.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service) => (
              <Card key={service.title} className="group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <service.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                  </div>
                  <CardDescription className="mt-2">{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="grid grid-cols-2 gap-2">
                    {service.highlights.map((h) => (
                      <li key={h} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-blue-light">
        <div className="container text-center">
          <h2 className="text-2xl font-bold font-serif mb-4">Need a Custom Solution?</h2>
          <p className="text-muted-foreground mb-6">
            Contact us to discuss tailored integrations and features for your practice.
          </p>
          <Link to="/contact">
            <Button size="lg">
              Contact Us <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
