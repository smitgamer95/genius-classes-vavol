import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/firebase";
import { Video, Loader2, ExternalLink, Play } from "lucide-react";

interface Lecture {
  id: string;
  title: string;
  description: string;
  subject: string;
  className: string;
  videoURL: string;
  thumbnailURL: string;
  createdAt: unknown;
}

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pat of patterns) {
    const m = url.match(pat);
    if (m) return m[1];
  }
  return null;
}

function LectureThumbnail({
  lecture,
}: {
  lecture: Lecture;
}) {
  const [imgError, setImgError] = useState(false);

  // Priority: uploaded thumbnail > YouTube auto-thumbnail > fallback icon
  const uploadedThumb = lecture.thumbnailURL;
  const ytId = extractYouTubeId(lecture.videoURL);
  const ytThumb = ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : null;
  const src = uploadedThumb || ytThumb;

  if (!src || imgError) {
    return (
      <div className="aspect-video bg-secondary flex items-center justify-center">
        <Video className="w-12 h-12 text-muted-foreground/30" />
      </div>
    );
  }

  return (
    <div className="aspect-video bg-secondary relative group overflow-hidden">
      <img
        src={src}
        alt={lecture.title}
        className="w-full h-full object-cover"
        crossOrigin="anonymous"
        onError={() => setImgError(true)}
      />
      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
          <Play className="w-5 h-5 text-foreground ml-0.5" />
        </div>
      </div>
    </div>
  );
}

export default function Lectures() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSubject, setFilterSubject] = useState("");
  const [filterClass, setFilterClass] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const q = query(
          collection(db, "lectures"),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        setLectures(
          snap.docs.map((d) => ({ id: d.id, ...d.data() } as Lecture))
        );
      } catch (err) {
        console.error("Error loading lectures:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = lectures.filter((l) => {
    if (filterSubject && l.subject !== filterSubject) return false;
    if (filterClass && l.className !== filterClass) return false;
    return true;
  });

  const subjects = [...new Set(lectures.map((l) => l.subject).filter(Boolean))];
  const classes = [...new Set(lectures.map((l) => l.className).filter(Boolean))];

  return (
    <div className="min-h-screen bg-background">
      <section
        className="py-16"
        style={{
          background:
            "linear-gradient(135deg, var(--hero-gradient-start), var(--hero-gradient-end))",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1
            className="text-3xl md:text-5xl font-bold text-white text-balance"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Video Lectures
          </h1>
          <p className="mt-4 text-lg text-white/70 max-w-2xl mx-auto">
            Watch recorded lectures and learn at your own pace, anytime,
            anywhere.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {lectures.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-8">
              <select
                className="px-3 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
              >
                <option value="">All Subjects</option>
                {subjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select
                className="px-3 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
              >
                <option value="">All Classes</option>
                {classes.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
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
              <Video className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {lectures.length === 0
                  ? "Lectures Coming Soon"
                  : "No Matching Lectures"}
              </h3>
              <p className="text-muted-foreground">
                {lectures.length === 0
                  ? "Video lectures will be uploaded shortly."
                  : "Try changing the filters."}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((l) => (
                <a
                  key={l.id}
                  href={l.videoURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow group block"
                >
                  <LectureThumbnail lecture={l} />
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      {l.subject && (
                        <span className="text-xs px-2 py-0.5 rounded-md bg-primary/10 text-primary font-medium">
                          {l.subject}
                        </span>
                      )}
                      {l.className && (
                        <span className="text-xs px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground">
                          {l.className}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      {l.title}
                    </h3>
                    {l.description && (
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                        {l.description}
                      </p>
                    )}
                    <span className="inline-flex items-center gap-1.5 mt-3 text-sm text-primary font-medium">
                      Watch Lecture{" "}
                      <ExternalLink className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
