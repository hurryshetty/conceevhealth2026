import { useState } from "react";
import { Star, Quote } from "lucide-react";
import testimonialPriya from "@/assets/testimonial-priya.jpg";
import testimonialAnanya from "@/assets/testimonial-ananya.jpg";
import testimonialDeepa from "@/assets/testimonial-deepa.jpg";
import testimonialKavitha from "@/assets/testimonial-kavitha.jpg";
import testimonialMeera from "@/assets/testimonial-meera.jpg";

const testimonials = [
  { quote: "Conceev Health made my IVF journey smooth and stress-free. The coordinator was amazing throughout!", name: "Priya S.", area: "Whitefield, Bangalore", rating: 4.8, image: testimonialPriya },
  { quote: "Transparent pricing and no surprises. I knew exactly what I was paying for my hysterectomy. The team was incredibly supportive.", name: "Ananya R.", area: "Kukatpally, Hyderabad", rating: 4.7, image: testimonialAnanya },
  { quote: "Found the best hospital near me within a day. The care manager was with me from consultation to discharge.", name: "Deepa M.", area: "HSR Layout, Bangalore", rating: 4.9, image: testimonialDeepa },
  { quote: "EMI option helped me afford my treatment without any financial stress. Highly recommend Conceev Health!", name: "Kavitha J.", area: "Gachibowli, Hyderabad", rating: 4.6, image: testimonialKavitha },
  { quote: "The dedicated coordinator made all the difference. From finding the right doctor to post-surgery follow-ups, everything was seamless.", name: "Meera L.", area: "Koramangala, Bangalore", rating: 4.8, image: testimonialMeera },
];

const Testimonials = () => {
  const [idx, setIdx] = useState(0);

  return (
    <section className="py-16 md:py-24 bg-secondary/30">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-12 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
            The Power of Conceev Health: Patients Speak
          </h2>
          <p className="text-muted-foreground mt-2">Real stories from women we've helped</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Quote cards */}
          <div className="space-y-4 order-2 md:order-1">
            {testimonials.slice(0, 3).map((t, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all duration-300 ${
                  idx === i ? "bg-card border-primary shadow-md" : "bg-card/50 border-border hover:border-primary/30"
                }`}
              >
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, s) => (
                    <Star key={s} className={`h-3.5 w-3.5 ${s < Math.floor(t.rating) ? "fill-amber-400 text-amber-400" : "text-border"}`} />
                  ))}
                  <span className="text-xs text-muted-foreground ml-1">{t.rating}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">"{t.quote}"</p>
                <p className="text-xs font-semibold text-foreground mt-2">{t.name} · <span className="text-muted-foreground font-normal">{t.area}</span></p>
              </button>
            ))}
          </div>

          {/* Active testimonial with image */}
          <div className="flex flex-col items-center text-center order-1 md:order-2">
            <div className="w-36 h-36 sm:w-48 sm:h-48 rounded-2xl overflow-hidden shadow-lg mb-6">
              <img src={testimonials[idx].image} alt={testimonials[idx].name} className="w-full h-full object-cover" />
            </div>
            <Quote className="h-6 w-6 text-primary/30 mb-3 rotate-180" />
            <p className="text-muted-foreground leading-relaxed max-w-sm mb-4">
              "{testimonials[idx].quote}"
            </p>
            <h3 className="font-serif font-bold text-foreground">{testimonials[idx].name}</h3>
            <p className="text-sm text-muted-foreground">{testimonials[idx].area}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
