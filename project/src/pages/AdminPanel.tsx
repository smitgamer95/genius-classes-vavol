import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase";
import { useAuth } from "@/context/AuthContext";
import {
  GraduationCap,
  FileText,
  Video,
  Trophy,
  LogOut,
  Loader2,
  LayoutDashboard,
} from "lucide-react";
import TeachersAdmin from "@/components/admin/TeachersAdmin";
import MaterialsAdmin from "@/components/admin/MaterialsAdmin";
import LecturesAdmin from "@/components/admin/LecturesAdmin";
import ResultsAdmin from "@/components/admin/ResultsAdmin";

const tabs = [
  { id: "teachers", label: "Teachers", icon: GraduationCap },
  { id: "materials", label: "Materials", icon: FileText },
  { id: "lectures", label: "Lectures", icon: Video },
  { id: "results", label: "Results", icon: Trophy },
];

export default function AdminPanel() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("teachers");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    navigate("/admin", { replace: true });
    return null;
  }

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/admin", { replace: true });
  };

  return (
    <div className="min-h-screen bg-secondary">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <LayoutDashboard className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
              Admin Panel
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:block">{user.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "teachers" && <TeachersAdmin />}
        {activeTab === "materials" && <MaterialsAdmin />}
        {activeTab === "lectures" && <LecturesAdmin />}
        {activeTab === "results" && <ResultsAdmin />}
      </div>
    </div>
  );
}
