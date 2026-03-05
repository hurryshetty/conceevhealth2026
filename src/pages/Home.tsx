import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  CalendarCheck,
  BarChart3,
  CreditCard,
  ListTodo,
  Bell,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Lead Management",
    description: "Capture, track, and convert leads with a powerful CRM pipeline built for healthcare.",
  },
  {
    icon: CalendarCheck,
    title: "Appointment Scheduling",
    description: "Let patients book appointments online with provider availability and location management.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Real-time insights into your practice performance, patient metrics, and revenue trends.",
  },
  {
    icon: CreditCard,
    title: "Billing & Payments",
    description: "Integrated wallet, invoicing, and Razorpay-powered payment processing.",
  },
  {
    icon: ListTodo,
    title: "Task Management",
    description: "Organize your team's work with workspaces, task lists, and priority tracking.",
  },
  {
    icon: Bell,
    title: "Notifications",
    description: "Stay on top of everything with multi-channel alerts for appointments, leads, and tasks.",
  },
];

const benefits = [
  "HIPAA-conscious platform design",
  "Multi-organization support",
  "Role-based access control",
  "Razorpay payment integration",
  "WhatsApp (WATI) messaging",
  "Social media management",
];

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy to-navy-light text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-glow rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-primary rounded-full blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />
        </div>
        <div className="container relative py-24 md:py-32 lg:py-40">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif tracking-tight mb-6 animate-fade-in">
              Modern Healthcare Management, Simplified
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              Coneev Health is the all-in-one platform to manage leads, appointments, billing, and
              team collaboration for healthcare practices of any size.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <Link to="/login">
                <Button size="lg" className="text-base px-8">
                  Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/services">
                <Button size="lg" variant="outline" className="text-base px-8 border-white/30 text-white hover:bg-white/10">
                  View Services
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4">
              Everything You Need to Grow Your Practice
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From patient acquisition to billing, Coneev Health streamlines every aspect of your healthcare business.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="group hover:shadow-lg transition-shadow duration-300 border-border/50">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-blue-light">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold font-serif mb-6">
                Built for Healthcare Teams
              </h2>
              <p className="text-muted-foreground mb-8">
                Whether you're a solo practitioner or a multi-location clinic, Coneev Health adapts
                to your workflow with enterprise-grade features and intuitive design.
              </p>
              <ul className="space-y-3">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-success flex-shrink-0" />
                    <span className="font-medium">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8 border">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <CalendarCheck className="h-5 w-5 text-green-success" />
                  <span className="text-sm font-medium">15 appointments scheduled today</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">20 active leads in pipeline</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <ListTodo className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium">10 tasks across 3 workspaces</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                  <CreditCard className="h-5 w-5 text-orange-600" />
                  <span className="text-sm font-medium">5 wallet transactions processed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-navy text-white">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4">
            Ready to Transform Your Practice?
          </h2>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto">
            Join healthcare professionals who trust Coneev Health to manage and grow their business.
          </p>
          <Link to="/login">
            <Button size="lg" className="text-base px-8">
              Start Your Free Trial <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
