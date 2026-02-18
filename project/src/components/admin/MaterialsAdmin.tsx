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
  FileText,
  File,
} from "lucide-react";
import { toast } from "sonner";

interface Material {
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

const SUBJECTS = ["English", "Maths", "Science", "SS", "Gujarati"];
const CLASSES = Array.from({ length: 12 }, (_, i) => `Std ${i + 1}`);

export default function MaterialsAdmin() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", subject: "", className: "" });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const loadMaterials = useCallback(async () => {
    try {
      const q = query(collection(db, "materials"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setMaterials(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Material)));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load materials");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMaterials();
  }, [loadMaterials]);

  const ACCEPTED_TYPES = [
    "application/pdf",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
    "image/jpg",
  ];

  const handleFile = (f: File) => {
    if (!ACCEPTED_TYPES.includes(f.type)) {
      toast.error("Only PDF, PPT, DOC, and images are accepted");
      return;
    }
    if (f.size > 25 * 1024 * 1024) {
      toast.error("File must be under 25MB");
      return;
    }
    setFile(f);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    if (!file) { toast.error("Please select a file"); return; }
    if (!form.subject) { toast.error("Please select a subject"); return; }

    setSaving(true);
    setUploading(true);

    try {
      const filename = `materials/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, filename);
      const task = uploadBytesResumable(storageRef, file);

      const fileURL: string = await new Promise((resolve, reject) => {
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

      await addDoc(collection(db, "materials"), {
        ...form,
        fileURL,
        fileName: file.name,
        fileType: file.type,
        createdAt: Timestamp.now(),
      });

      toast.success("Material uploaded successfully");
      setShowForm(false);
      setForm({ title: "", description: "", subject: "", className: "" });
      setFile(null);
      setUploadProgress(0);
      loadMaterials();
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload material");
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const handleDelete = async (m: Material) => {
    if (!confirm(`Delete "${m.title}"?`)) return;
    try {
      await deleteDoc(doc(db, "materials", m.id));
      if (m.fileURL) {
        try {
          const storageRef = ref(storage, m.fileURL);
          await deleteObject(storageRef);
        } catch {}
      }
      toast.success("Material deleted");
      loadMaterials();
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
          Study Materials
        </h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> Upload Material
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-xl p-6 mb-6 animate-fade-in">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-foreground">Upload Material</h3>
            <button onClick={() => { setShowForm(false); setFile(null); }} className="p-1.5 rounded-lg hover:bg-secondary">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Material title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Subject *</label>
              <select
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select subject</option>
                {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
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
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              rows={2}
              placeholder="Brief description"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-foreground mb-2">File (PDF, PPT, DOC, Image) *</label>
            <div
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                dragOver ? "border-primary bg-primary/5" : "border-input hover:border-primary/40"
              }`}
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const f = e.dataTransfer.files?.[0];
                if (f) handleFile(f);
              }}
            >
              {file ? (
                <div className="space-y-2">
                  <File className="w-8 h-8 text-primary mx-auto" />
                  <p className="text-sm font-medium text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                  <p className="text-sm text-muted-foreground">Drag & drop or click to select</p>
                  <p className="text-xs text-muted-foreground/60">PDF, PPT, DOC, Images. Max 25MB.</p>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.ppt,.pptx,.doc,.docx,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
            {uploading && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
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
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Upload
            </button>
            <button
              onClick={() => { setShowForm(false); setFile(null); }}
              className="px-5 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {materials.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No materials uploaded yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {materials.map((m) => (
            <div key={m.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground text-sm truncate">{m.title}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-primary font-medium">{m.subject}</span>
                  {m.className && <span className="text-xs text-muted-foreground">{m.className}</span>}
                  <span className="text-xs text-muted-foreground">{m.fileName}</span>
                </div>
              </div>
              <button
                onClick={() => handleDelete(m)}
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
