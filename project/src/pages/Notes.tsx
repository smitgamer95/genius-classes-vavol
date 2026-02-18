import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/firebase";
import { FileText, Download, Eye, Loader2 } from "lucide-react";

interface Note {
  id: string;
  title: string;
  description: string;
  subject: string;
  className: string;
  fileURL: string;
  fileName: string;
  fileType: string;
  createdAt: unknown;
}

function getFileIcon(type: string) {
  const t = type.toLowerCase();
  if (t.includes("pdf")) return "PDF";
  if (t.includes("ppt") || t.includes("presentation")) return "PPT";
  if (t.includes("doc") || t.includes("word")) return "DOC";
  if (t.includes("image") || t.includes("png") || t.includes("jpg")) return "IMG";
  return "FILE";
}

function getFileColor(type: string) {
  const t = type.toLowerCase();
  if (t.includes("pdf")) return "bg-red-100 text-red-700";
  if (t.includes("ppt") || t.includes("presentation")) return "bg-orange-100 text-orange-700";
  if (t.includes("doc") || t.includes("word")) return "bg-blue-100 text-blue-700";
  if (t.includes("image") || t.includes("png") || t.includes("jpg")) return "bg-green-100 text-green-700";
  return "bg-secondary text-secondary-foreground";
}

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSubject, setFilterSubject] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const q = query(collection(db, "materials"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        setNotes(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Note)));
      } catch (err) {
        console.error("Error loading notes:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = notes.filter((n) => !filterSubject || n.subject === filterSubject);
  const subjects = [...new Set(notes.map((n) => n.subject))];

  return (
    <div className="min-h-screen bg-background">
      <section className="py-16" style={{ background: "linear-gradient(135deg, var(--hero-gradient-start), var(--hero-gradient-end))" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white text-balance" style={{ fontFamily: "var(--font-heading)" }}>
            Study Materials
          </h1>
          <p className="mt-4 text-lg text-white/70 max-w-2xl mx-auto">
            Download notes, presentations, and study materials for all subjects.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {notes.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-8">
              <select
                className="px-3 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
              >
                <option value="">All Subjects</option>
                {subjects.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <FileText className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {notes.length === 0 ? "Notes Coming Soon" : "No Matching Notes"}
              </h3>
              <p className="text-muted-foreground">
                {notes.length === 0 ? "Study materials will be uploaded shortly." : "Try changing the filters."}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((n) => (
                <div key={n.id} className="bg-card border border-border rounded-xl p-5 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className={`shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-xs font-bold ${getFileColor(n.fileType)}`}>
                      {getFileIcon(n.fileType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-foreground truncate">{n.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 rounded-md bg-primary/10 text-primary font-medium">{n.subject}</span>
                        {n.className && (
                          <span className="text-xs px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground">{n.className}</span>
                        )}
                      </div>
                      {n.description && (
                        <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2">{n.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <a
                      href={n.fileURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </a>
                    <a
                      href={n.fileURL}
                      download
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </a>
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
