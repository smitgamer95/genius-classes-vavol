import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  GraduationCap,
  BookOpen,
  Users,
  Award,
  ArrowRight,
  Clock,
  Target,
  Star,
} from "lucide-react";

function useInView(ref: React.RefObject<HTMLElement | null>) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setInView(true);
      },
      { threshold: 0.15 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref]);
  return inView;
}

function Counter({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1500;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, end]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

export default function Home() {
  const featuresRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const featuresInView = useInView(featuresRef);
  const statsInView = useInView(statsRef);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, var(--hero-gradient-start), var(--hero-gradient-end))" }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full border border-white/20" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full border border-white/20" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/10" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36">
          <div className="max-w-3xl">
            <div className="animate-fade-in-up">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase bg-white/10 text-white/90 mb-6">
                <Star className="w-3.5 h-3.5" />
                Premier Coaching Institute
              </span>
            </div>

            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight animate-fade-in-up animation-delay-100 text-balance"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Unlock Your <br />
              <span className="text-[var(--accent)]">Academic Potential</span>
            </h1>

            <p className="mt-6 text-lg md:text-xl text-white/70 leading-relaxed max-w-2xl animate-fade-in-up animation-delay-200">
              Genius Classes provides quality coaching for Std 1-12 in both English and Gujarati medium. Join 100+ students already on the path to excellence.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 animate-fade-in-up animation-delay-300">
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLScyuQ7WdPgahcyX5yKFwGvg9CFgJckSq6_gFOtUY25YUXIExA/viewform?usp=header"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-accent text-accent-foreground font-semibold hover:opacity-90 transition-opacity"
              >
                Apply Now
                <ArrowRight className="w-4 h-4" />
              </a>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-white/20 text-white font-medium hover:bg-white/10 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section ref={statsRef} className="bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
          <div
            className={`grid grid-cols-2 md:grid-cols-4 gap-4 transition-all duration-700 ${
              statsInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {[
              { icon: Users, value: 100, suffix: "+", label: "Students" },
              { icon: Clock, value: 3, suffix: "+", label: "Years Experience" },
              { icon: BookOpen, value: 12, suffix: "", label: "Classes Covered" },
              { icon: Award, value: 95, suffix: "%", label: "Satisfaction" },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-xl p-5 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <p className="text-2xl md:text-3xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
                  {statsInView ? <Counter end={stat.value} suffix={stat.suffix} /> : "0"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section ref={featuresRef} className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Why choose us</span>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold text-foreground text-balance" style={{ fontFamily: "var(--font-heading)" }}>
              Everything You Need to Succeed
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              We provide comprehensive coaching with modern teaching methods, personal attention, and a focus on building strong fundamentals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: GraduationCap,
                title: "Expert Teachers",
                desc: "Experienced faculty with deep subject knowledge and modern teaching methods.",
              },
              {
                icon: BookOpen,
                title: "Study Materials",
                desc: "Access comprehensive notes, lectures, and practice materials anytime.",
              },
              {
                icon: Target,
                title: "Focused Learning",
                desc: "Structured curriculum designed for Std 1-12 in English & Gujarati medium.",
              },
              {
                icon: Users,
                title: "Small Batches",
                desc: "Personal attention with limited batch sizes ensuring every student grows.",
              },
              {
                icon: Award,
                title: "Proven Results",
                desc: "Track record of excellent results and student satisfaction.",
              },
              {
                icon: Clock,
                title: "Flexible Timings",
                desc: "Morning and evening batches to suit every student's schedule.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className={`group bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300 ${
                  featuresInView ? "animate-fade-in-up" : "opacity-0"
                }`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20" style={{ background: "linear-gradient(135deg, var(--hero-gradient-start), var(--hero-gradient-end))" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-balance" style={{ fontFamily: "var(--font-heading)" }}>
            Ready to Start Your Journey?
          </h2>
          <p className="mt-4 text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
            Join Genius Classes today and take the first step towards academic excellence. Admissions are now open for all classes.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLScyuQ7WdPgahcyX5yKFwGvg9CFgJckSq6_gFOtUY25YUXIExA/viewform?usp=header"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-accent text-accent-foreground font-semibold hover:opacity-90 transition-opacity"
            >
              Apply Now
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="tel:+919712843679"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-white/20 text-white font-medium hover:bg-white/10 transition-colors"
            >
              Call Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
