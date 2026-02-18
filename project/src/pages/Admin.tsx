import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase";
import { Loader2, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Admin() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [gate, setGate] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragStartY = useRef(0);

  // If already logged in, go to panel
  if (user) {
    navigate("/admin-panel", { replace: true });
    return null;
  }

  const advanceGate = useCallback(() => {
    if (gate < 3) {
      setGate((g) => g + 1);
    }
  }, [gate]);

  const handleTouchStart = useCallback(() => {
    longPressTimer.current = setTimeout(() => {
      advanceGate();
    }, 2000);
  }, [advanceGate]);

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
        advanceGate();
      }
    },
    [advanceGate]
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/admin-panel", { replace: true });
    } catch (err: any) {
      setError(err.message?.includes("invalid") ? "Invalid email or password" : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (gate < 3) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div
          className="text-center select-none cursor-default"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        >
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-6">
            <Lock className="w-7 h-7 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">
            Thank you for visiting Genius Classes
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We appreciate your interest in our institute.
          </p>
        </div>
      </div>
    );
  }

  // Gate 3: Login form
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
              Admin Login
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Authorized personnel only
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="admin-email" className="block text-sm font-medium text-foreground mb-1.5">
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-sm font-medium text-foreground mb-1.5">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Enter password"
              />
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
