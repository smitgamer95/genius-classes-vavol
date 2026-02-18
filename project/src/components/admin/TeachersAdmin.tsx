import { useEffect, useState, useCallback, useRef } from "react";
import {
  collection,
  addDoc,
  updateDoc,
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
  Pencil,
  Trash2,
  X,
  Upload,
  Loader2,
  GraduationCap,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";

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
  createdAt: unknown;
}

const ALL_CLASSES = Array.from({ length: 12 }, (_, i) => `Std ${i + 1}`);
const ALL_SUBJECTS = ["English", "Maths", "Science", "SS", "Gujarati"];

const emptyForm = {
  name: "",
  qualification: "",
  experience: "",
  description: "",
  medium: "English Medium",
  classes: [] as string[],
  subjects: [] as string[],
};

export default function TeachersAdmin() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const loadTeachers = useCallback(async () => {
    try {
      const q = query(collection(db, "teachers"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setTeachers(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Teacher)));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load teachers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTeachers();
  }, [loadTeachers]);

  const handlePhotoFile = (file: File) => {
    if (!file.type.match(/image\/(jpeg|png|jpg)/)) {
      toast.error("Only JPG/PNG images allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const uploadPhoto = async (file: File): Promise<string> => {
    const filename = `teachers/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, filename);
    const task = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      task.on(
        "state_changed",
        (snap) => {
          setUploadProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100));
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
    if (!form.name.trim()) {
      toast.error("Teacher name is required");
      return;
    }
    setSaving(true);
    try {
      let photoURL = "";
      if (photo) {
        setUploading(true);
        photoURL = await uploadPhoto(photo);
        setUploading(false);
      }

      if (editingId) {
        const docRef = doc(db, "teachers", editingId);
        const updateData: any = { ...form };
        if (photoURL) updateData.photoURL = photoURL;
        await updateDoc(docRef, updateData);
        toast.success("Teacher updated successfully");
      } else {
        await addDoc(collection(db, "teachers"), {
          ...form,
          photoURL,
          createdAt: Timestamp.now(),
        });
        toast.success("Teacher added successfully");
      }

      resetForm();
      loadTeachers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save teacher");
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const handleEdit = (t: Teacher) => {
    setEditingId(t.id);
    setForm({
      name: t.name,
      qualification: t.qualification,
      experience: t.experience,
      description: t.description,
      medium: t.medium,
      classes: t.classes || [],
      subjects: t.subjects || [],
    });
    setPhotoPreview(t.photoURL || null);
    setPhoto(null);
    setShowForm(true);
  };

  const handleDelete = async (t: Teacher) => {
    if (!confirm(`Delete teacher "${t.name}"?`)) return;
    try {
      await deleteDoc(doc(db, "teachers", t.id));
      if (t.photoURL) {
        try {
          const storageRef = ref(storage, t.photoURL);
          await deleteObject(storageRef);
        } catch {}
      }
      toast.success("Teacher deleted");
      loadTeachers();
    } catch (err) {
      toast.error("Failed to delete teacher");
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setPhoto(null);
    setPhotoPreview(null);
    setUploadProgress(0);
  };

  const toggleArrayItem = (
    key: "classes" | "subjects",
    item: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].includes(item)
        ? prev[key].filter((x) => x !== item)
        : [...prev[key], item],
    }));
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
          Teachers Management
        </h2>
        {!showForm && (
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> Add Teacher
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-xl p-6 mb-6 animate-fade-in">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-foreground">
              {editingId ? "Edit Teacher" : "Add New Teacher"}
            </h3>
            <button onClick={resetForm} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Teacher name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Qualification</label>
              <input
                type="text"
                value={form.qualification}
                onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="e.g. M.Sc., B.Ed."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Experience</label>
              <input
                type="text"
                value={form.experience}
                onChange={(e) => setForm({ ...form, experience: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="e.g. 5+ Years"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Medium</label>
              <select
                value={form.medium}
                onChange={(e) => setForm({ ...form, medium: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="English Medium">English Medium</option>
                <option value="Gujarati Medium">Gujarati Medium</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              rows={3}
              placeholder="Brief description about the teacher"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-foreground mb-2">Classes</label>
            <div className="flex flex-wrap gap-2">
              {ALL_CLASSES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleArrayItem("classes", c)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    form.classes.includes(c)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-foreground mb-2">Subjects</label>
            <div className="flex flex-wrap gap-2">
              {ALL_SUBJECTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleArrayItem("subjects", s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    form.subjects.includes(s)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Photo upload */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-foreground mb-2">Photo (JPG/PNG)</label>
            <div
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
                dragOver ? "border-primary bg-primary/5" : "border-input hover:border-primary/40"
              }`}
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handlePhotoFile(file);
              }}
            >
              {photoPreview ? (
                <div className="space-y-3">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-24 h-24 rounded-lg object-cover mx-auto"
                    crossOrigin="anonymous"
                  />
                  <p className="text-xs text-muted-foreground">Click or drop to change</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <ImageIcon className="w-10 h-10 text-muted-foreground/40 mx-auto" />
                  <p className="text-sm text-muted-foreground">Drag & drop or click to upload</p>
                  <p className="text-xs text-muted-foreground/60">JPG, PNG only. Max 5MB.</p>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handlePhotoFile(file);
              }}
            />
            {uploading && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Uploading...</span>
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
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {editingId ? "Update Teacher" : "Add Teacher"}
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

      {/* Teacher list */}
      {teachers.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <GraduationCap className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No teachers added yet.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teachers.map((t) => (
            <div key={t.id} className="bg-card border border-border rounded-xl overflow-hidden">
              {t.photoURL ? (
                <div className="aspect-[3/2] bg-secondary">
                  <img src={t.photoURL} alt={t.name} className="w-full h-full object-cover" crossOrigin="anonymous" />
                </div>
              ) : (
                <div className="aspect-[3/2] bg-secondary flex items-center justify-center">
                  <GraduationCap className="w-10 h-10 text-muted-foreground/20" />
                </div>
              )}
              <div className="p-4">
                <h4 className="font-semibold text-foreground">{t.name}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t.qualification} {t.experience ? `| ${t.experience}` : ""}
                </p>
                <p className="text-xs text-primary font-medium mt-1">{t.medium}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {t.subjects?.map((s) => (
                    <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">{s}</span>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => handleEdit(t)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-border hover:bg-secondary transition-colors"
                  >
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(t)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-destructive border border-destructive/20 hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
