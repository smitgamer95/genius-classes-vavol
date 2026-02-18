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
import {
  Plus,
  Trash2,
  X,
  Upload,
  Loader2,
  Trophy,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";

interface Result {
  id: string;
  studentName: string;
  className: string;
  percentage: string;
  year: string;
  achievement: string;
  photoURL: string;
  createdAt: unknown;
}

const CLASSES = Array.from({ length: 12 }, (_, i) => `Std ${i + 1}`);

export default function ResultsAdmin() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ studentName: "", className: "", percentage: "", year: "", achievement: "" });
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadResults = useCallback(async () => {
    try {
      const q = query(collection(db, "results"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setResults(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Result)));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load results");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  const handleSave = async () => {
    if (!form.studentName.trim()) { toast.error("Student name is required"); return; }

    setSaving(true);
    try {
      let photoURL = "";
      if (photo) {
        setUploading(true);
        const filename = `results/${Date.now()}_${photo.name}`;
        const storageRef = ref(storage, filename);
        const task = uploadBytesResumable(storageRef, photo);
        photoURL = await new Promise((resolve, reject) => {
          task.on(
            "state_changed",
            (snap) => setUploadProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
            reject,
            async () => {
              const url = await getDownloadURL(task.snapshot.ref);
              resolve(url);
            }
          );
        });
        setUploading(false);
      }

      await addDoc(collection(db, "results"), {
        ...form,
        photoURL,
        createdAt: Timestamp.now(),
      });

      toast.success("Result added successfully");
      setShowForm(false);
      setForm({ studentName: "", className: "", percentage: "", year: "", achievement: "" });
      setPhoto(null);
      setPhotoPreview(null);
      setUploadProgress(0);
      loadResults();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add result");
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const handleDelete = async (r: Result) => {
    if (!confirm(`Delete result for "${r.studentName}"?`)) return;
    try {
      await deleteDoc(doc(db, "results", r.id));
      if (r.photoURL) {
        try { await deleteObject(ref(storage, r.photoURL)); } catch {}
      }
      toast.success("Result deleted");
      loadResults();
    } catch {
      toast.error("Failed to delete");
    }
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
        <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
          Results Management
        </h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> Add Result
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-xl p-6 mb-6 animate-fade-in">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-foreground">Add Result</h3>
            <button onClick={() => { setShowForm(false); setPhoto(null); setPhotoPreview(null); }} className="p-1.5 rounded-lg hover:bg-secondary">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Student Name *</label>
              <input
                type="text"
                value={form.studentName}
                onChange={(e) => setForm({ ...form, studentName: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Student name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Class</label>
              <select
                value={form.className}
                onChange={(e) => setForm({ ...form, className: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select class</option>
                {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Percentage / Grade</label>
              <input
                type="text"
                value={form.percentage}
                onChange={(e) => setForm({ ...form, percentage: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="e.g. 95% or A+"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Year</label>
              <input
                type="text"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="e.g. 2025"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-foreground mb-1.5">Achievement</label>
            <input
              type="text"
              value={form.achievement}
              onChange={(e) => setForm({ ...form, achievement: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="e.g. School Topper"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-foreground mb-2">Photo (optional)</label>
            <div
              className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer border-input hover:border-primary/40 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              {photoPreview ? (
                <div className="space-y-2">
                  <img src={photoPreview} alt="Preview" className="w-20 h-20 rounded-lg object-cover mx-auto" crossOrigin="anonymous" />
                  <p className="text-xs text-muted-foreground">Click to change</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <ImageIcon className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                  <p className="text-sm text-muted-foreground">Click to upload photo</p>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setPhoto(f);
                  setPhotoPreview(URL.createObjectURL(f));
                }
              }}
            />
            {uploading && (
              <div className="mt-3">
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
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
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Add Result
            </button>
            <button
              onClick={() => { setShowForm(false); setPhoto(null); setPhotoPreview(null); }}
              className="px-5 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {results.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No results added yet.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((r) => (
            <div key={r.id} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-start gap-3">
                {r.photoURL ? (
                  <img src={r.photoURL} alt={r.studentName} className="w-12 h-12 rounded-lg object-cover" crossOrigin="anonymous" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-muted-foreground/30" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground text-sm">{r.studentName}</h4>
                  <div className="flex gap-2 mt-0.5">
                    {r.className && <span className="text-xs text-primary">{r.className}</span>}
                    {r.percentage && <span className="text-xs font-bold text-accent-foreground">{r.percentage}</span>}
                  </div>
                  {r.achievement && <p className="text-xs text-muted-foreground mt-1">{r.achievement}</p>}
                </div>
                <button
                  onClick={() => handleDelete(r)}
                  className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
