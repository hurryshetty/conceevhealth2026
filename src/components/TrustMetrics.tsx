import { Users, Building2, Stethoscope, Award } from "lucide-react";

const metrics = [
  { icon: Users, value: "500+", label: "Women Assisted" },
  { icon: Building2, value: "10+", label: "Partner Hospitals" },
  { icon: Stethoscope, value: "50+", label: "Specialist Doctors" },
  { icon: Award, value: "4.8★", label: "Patient Rating" },
];

const TrustMetrics = () => (
  <section className="relative -mt-8 z-20 px-4">
    <div className="container mx-auto">
      <div className="bg-primary rounded-2xl shadow-xl shadow-primary/30 py-8 px-6 md:px-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {metrics.map(({ icon: Icon, value, label }, i) => (
            <div
              key={label}
              className={`flex flex-col items-center text-center space-y-2 ${
                i < metrics.length - 1 ? "md:border-r md:border-primary-foreground/15" : ""
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-primary-foreground/10 flex items-center justify-center">
                <Icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <p className="text-3xl md:text-4xl font-bold text-primary-foreground tracking-tight">{value}</p>
              <p className="text-sm text-primary-foreground/70 font-medium">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default TrustMetrics;
