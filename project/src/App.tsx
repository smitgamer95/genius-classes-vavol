import { Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import Home from "@/pages/Home";
import Lectures from "@/pages/Lectures";
import Notes from "@/pages/Notes";
import Teachers from "@/pages/Teachers";
import Results from "@/pages/Results";
import Contact from "@/pages/Contact";
import Admin from "@/pages/Admin";
import AdminPanel from "@/pages/AdminPanel";

function Layout() {
  const location = useLocation();
  const isAdminRoute =
    location.pathname === "/admin" || location.pathname === "/admin-panel";

  return (
    <>
      {!isAdminRoute && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lectures" element={<Lectures />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/results" element={<Results />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin-panel" element={<AdminPanel />} />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ScrollToTop />
      <Layout />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "var(--card)",
            color: "var(--foreground)",
            border: "1px solid var(--border)",
          },
        }}
      />
    </AuthProvider>
  );
}
