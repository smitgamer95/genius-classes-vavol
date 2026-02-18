import { useEffect, useState, useCallback, useRef } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "@/firebase";
import { Plus, Trash2, X, Loader2, Video, ImageIcon, Upload } from "lucide-react";
import { toast } from "sonner";

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

const SUBJECTS = ["English", "Maths", "Science", "SS", "Gujarati"];
const CLASSES = Array.from({ length: 12 }, (_, i) => `Std ${i + 1}`);

export default function LecturesAdmin() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    subject: "",
    className: "",
    videoURL: "",
  });
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadLectures = useCallback(async () => {
    try {
      const q = query(collection(db, "lectures"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setLectures(
        snap.docs.map((d) => ({ id: d.id, ...d.data() } as Lecture))
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to load lectures");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLectures();
  }, [loadLectures]);

  const handleThumbnailFile = (file: File) => {
    if (!file.type.match(/image\/(jpeg|png|jpg|webp)/)) {
      toast.error("Only JPG, PNG, or WebP images allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setThumbnail(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const uploadThumbnail = async (file: File): Promise<string> => {
    const filename = `lecture-thumbnails/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, filename);
    const task = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      task.on(
        "state_changed",
        (snap) => {
          setUploadProgress(
            Math.round((snap.bytesTransferred / snap.totalBytes) * 100)
          );
        },
        (err) => reject(err),
        async () => {
          const url = await getDownloadURL(task.snapshot.ref);
          resolve(url);
        }
      );
    });
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!form.videoURL.trim()) {
      toast.error("Video URL is required");
      return;
    }

    setSaving(true);
    try {
      let thumbnailURL = "";
      if (thumbnail) {
        setUploading(true);
        thumbnailURL = await uploadThumbnail(thumbnail);
        setUploading(false);
      }

      await addDoc(collection(db, "lectures"), {
        ...form,
        thumbnailURL,
        createdAt: Timestamp.now(),
      });
      toast.success("Lecture added successfully");
      resetForm();
      loadLectures();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add lecture");
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const handleDelete = async (l: Lecture) => {
    if (!confirm(`Delete "${l.title}"?`)) return;
    try {
      await deleteDoc(doc(db, "lectures", l.id));
      if (l.thumbnailURL) {
        try {
          const storageRef = ref(storage, l.thumbnailURL);
          await deleteObject(storageRef);
        } catch {}
      }
      toast.success("Lecture deleted");
      loadLectures();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setForm({ title: "", description: "", subject: "", className: "", videoURL: "" });
    setThumbnail(null);
    setThumbnailPreview(null);
    setUploadProgress(0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2
          className="text-xl font-bold text-foreground"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Lectures Management
        </h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> Add Lecture
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-xl p-6 mb-6 animate-fade-in">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-foreground">
              Add Lecture
            </h3>
            <button
              onClick={resetForm}
              className="p-1.5 rounded-lg hover:bg-secondary"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Title *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Lecture title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Video URL *
              </label>
              <input
                type="url"
                value={form.videoURL}
                onChange={(e) => setForm({ ...form, videoURL: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="https://youtube.com/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Subject
              </label>
              <select
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select subject</option>
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Class
              </label>
              <select
                value={form.className}
                onChange={(e) =>
                  setForm({ ...form, className: e.target.value })
                }
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select class</option>
                {CLASSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              rows={2}
              placeholder="Brief description"
            />
          </div>

          {/* Thumbnail Upload - drag & drop */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              Thumbnail Image (JPG / PNG / WebP)
            </label>
            <div
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
                dragOver
                  ? "border-primary bg-primary/5"
                  : "border-input hover:border-primary/40"
              }`}
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleThumbnailFile(file);
              }}
            >
              {thumbnailPreview ? (
                <div className="space-y-3">
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    className="max-w-[240px] max-h-[140px] rounded-lg object-cover mx-auto"
                    crossOrigin="anonymous"
                  />
                  <p className="text-xs text-muted-foreground">
                    Click or drop to change thumbnail
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <ImageIcon className="w-10 h-10 text-muted-foreground/40 mx-auto" />
                  <p className="text-sm text-muted-foreground">
                    Drag & drop or click to upload thumbnail
                  </p>
                  <p className="text-xs text-muted-foreground/60">
                    JPG, PNG, or WebP. Max 5MB. Recommended 16:9 ratio.
                  </p>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleThumbnailFile(file);
              }}
            />
            {uploading && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Uploading thumbnail...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              Add Lecture
            </button>
            <button
              onClick={resetForm}
              className="px-5 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {lectures.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <Video className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No lectures added yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {lectures.map((l) => (
            <div
              key={l.id}
              className="bg-card border border-border rounded-xl p-3 flex items-center gap-4"
            >
              {/* Thumbnail preview in list */}
              <div className="w-20 h-14 sm:w-28 sm:h-16 rounded-lg bg-secondary overflow-hidden shrink-0">
                {l.thumbnailURL ? (
                  <img
                    src={l.thumbnailURL}
                    alt={l.title}
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video className="w-5 h-5 text-muted-foreground/30" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground text-sm truncate">
                  {l.title}
                </h4>
                <div className="flex items-center gap-2 mt-0.5">
                  {l.subject && (
                    <span className="text-xs text-primary font-medium">
                      {l.subject}
                    </span>
                  )}
                  {l.className && (
                    <span className="text-xs text-muted-foreground">
                      {l.className}
                    </span>
                  )}
                </div>
              </div>
              <a
                href={l.videoURL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary font-medium hover:underline hidden sm:block"
              >
                Open
              </a>
              <button
                onClick={() => handleDelete(l)}
                className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
