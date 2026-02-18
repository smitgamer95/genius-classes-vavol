import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/firebase";
import { Trophy, Loader2, Star } from "lucide-react";

interface Result {
  id: string;
  studentName: string;
  className: string;
  percentage: string;
  year: string;
  achievement: string;
  photoURL: string;
}

export default function Results() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const q = query(collection(db, "results"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        setResults(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Result)));
      } catch (err) {
        console.error("Error loading results:", err);
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
            Our Results
          </h1>
          <p className="mt-4 text-lg text-white/70 max-w-2xl mx-auto">
            Celebrating the achievements of our students. Their success is our pride.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-20">
              <Trophy className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Results Coming Soon</h3>
              <p className="text-muted-foreground">Student results will be published here shortly.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((r) => (
                <div key={r.id} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                  {r.photoURL ? (
                    <div className="aspect-square bg-secondary">
                      <img src={r.photoURL} alt={r.studentName} className="w-full h-full object-cover" crossOrigin="anonymous" />
                    </div>
                  ) : (
                    <div className="aspect-square bg-secondary flex items-center justify-center">
                      <Trophy className="w-16 h-16 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-foreground">{r.studentName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded-md bg-primary/10 text-primary font-medium">{r.className}</span>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-accent/20 text-accent-foreground font-bold">{r.percentage}</span>
                    </div>
                    {r.achievement && (
                      <div className="mt-3 flex items-start gap-1.5">
                        <Star className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />
                        <p className="text-sm text-muted-foreground">{r.achievement}</p>
                      </div>
                    )}
                    {r.year && (
                      <p className="mt-2 text-xs text-muted-foreground">Year: {r.year}</p>
                    )}
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
