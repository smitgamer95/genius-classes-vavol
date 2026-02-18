import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/firebase";
import { GraduationCap, BookOpen, Briefcase, Loader2 } from "lucide-react";

interface Teacher {
  id: string;
  name: string;
  qualification: string;
  experience: string;
  description: string;
  medium: string;
  classes: string[];
  subjects: string[];
  photoURL: string;
}

export default function Teachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const q = query(collection(db, "teachers"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        setTeachers(
          snap.docs.map((d) => ({ id: d.id, ...d.data() } as Teacher))
        );
      } catch (err) {
        console.error("Error loading teachers:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <section className="py-16" style={{ background: "linear-gradient(135deg, var(--hero-gradient-start), var(--hero-gradient-end))" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white text-balance" style={{ fontFamily: "var(--font-heading)" }}>
            Our Teachers
          </h1>
          <p className="mt-4 text-lg text-white/70 max-w-2xl mx-auto">
            Meet the dedicated educators who make learning an enriching experience at Genius Classes.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : teachers.length === 0 ? (
            <div className="text-center py-20">
              <GraduationCap className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Teachers Coming Soon</h3>
              <p className="text-muted-foreground">Our faculty information will be updated shortly.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teachers.map((t) => (
                <div
                  key={t.id}
                  className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {t.photoURL ? (
                    <div className="aspect-[4/3] bg-secondary">
                      <img
                        src={t.photoURL}
                        alt={t.name}
                        className="w-full h-full object-cover"
                        crossOrigin="anonymous"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[4/3] bg-secondary flex items-center justify-center">
                      <GraduationCap className="w-16 h-16 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-foreground">{t.name}</h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <Briefcase className="w-3.5 h-3.5" />
                      {t.qualification} &middot; {t.experience}
                    </div>
                    {t.description && (
                      <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                        {t.description}
                      </p>
                    )}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-primary/10 text-primary font-medium">
                        <BookOpen className="w-3 h-3" />
                        {t.medium}
                      </span>
                      {t.subjects.map((s) => (
                        <span key={s} className="text-xs px-2 py-1 rounded-md bg-secondary text-secondary-foreground">
                          {s}
                        </span>
                      ))}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {t.classes.map((c) => (
                        <span key={c} className="text-xs px-1.5 py-0.5 rounded bg-accent/10 text-accent-foreground font-medium">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
