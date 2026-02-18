import { Phone, MapPin, Clock, ArrowRight } from "lucide-react";

export default function Contact() {
  return (
    <div className="min-h-screen bg-background">
      <section className="py-16" style={{ background: "linear-gradient(135deg, var(--hero-gradient-start), var(--hero-gradient-end))" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white text-balance" style={{ fontFamily: "var(--font-heading)" }}>
            Contact Us
          </h1>
          <p className="mt-4 text-lg text-white/70 max-w-2xl mx-auto">
            Get in touch with us for admissions, enquiries, or any questions.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">Call Us</h3>
                    <p className="text-sm text-muted-foreground mt-1">Available during working hours</p>
                    <a
                      href="tel:+919712843679"
                      className="inline-flex items-center gap-1.5 mt-3 text-primary font-semibold text-lg hover:underline"
                    >
                      +91 97128 43679
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">Visit Us</h3>
                    <p className="text-sm text-muted-foreground mt-1">Genius Classes, Vavol (near Jannat Residency)</p>
                    <a
                      href="https://maps.app.goo.gl/89XHFo4mjbYdUJdq7"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-3 text-sm text-primary font-medium hover:underline"
                    >
                      Open in Google Maps <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">Working Hours</h3>
                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <p>Monday - Saturday: 8:00 AM - 8:00 PM</p>
                      <p>Sunday: Closed</p>
                    </div>
                  </div>
                </div>
              </div>

              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLScyuQ7WdPgahcyX5yKFwGvg9CFgJckSq6_gFOtUY25YUXIExA/viewform?usp=header"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-lg bg-accent text-accent-foreground font-semibold hover:opacity-90 transition-opacity"
              >
                Apply Now <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <div className="rounded-xl overflow-hidden border border-border shadow-sm">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3670.036!2d72.597!3d23.108!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDA2JzI5LjAiTiA3MsKwMzUnNDkuMiJF!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "400px" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Genius Classes Location"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
