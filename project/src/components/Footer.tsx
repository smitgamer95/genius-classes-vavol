import { useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Phone, MapPin } from "lucide-react";

export default function Footer() {
  const navigate = useNavigate();
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragStartY = useRef<number>(0);

  const handleTouchStart = useCallback(() => {
    longPressTimer.current = setTimeout(() => {
      navigate("/admin");
    }, 2000);
  }, [navigate]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    dragStartY.current = e.clientY;
  }, []);

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      const diff = dragStartY.current - e.clientY;
      if (diff > 80) {
        navigate("/admin");
      }
    },
    [navigate]
  );

  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                Genius Classes
              </span>
            </div>
            <p className="text-sm text-primary-foreground/70 leading-relaxed">
              Premier coaching institute providing quality education for Std 1-12 students in both English and Gujarati medium.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-primary-foreground/80">Quick Links</h3>
            <ul className="space-y-2">
              {["Lectures", "Notes", "Teachers", "Results", "Contact"].map((item) => (
                <li key={item}>
                  <a href={`/${item.toLowerCase()}`} className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-primary-foreground/80">Contact</h3>
            <div className="space-y-3">
              <a href="tel:+919712843679" className="flex items-center gap-2 text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                <Phone className="w-4 h-4" />
                +91 97128 43679
              </a>
              <a
                href="https://maps.app.goo.gl/89XHFo4mjbYdUJdq7"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors"
              >
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                Genius Classes, Vavol (near Jannat Residency)
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p
            className="text-sm text-primary-foreground/50 select-none cursor-default"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
          >
            &copy; Genius Classes
          </p>
          <p className="text-xs text-primary-foreground/40">
            Developed by Smit Patel
          </p>
        </div>
      </div>
    </footer>
  );
}
