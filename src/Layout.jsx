import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { createPageUrl } from "./utils";
import { useAuth } from './lib/AuthContext';
import { Camera, History, Salad, Activity, ChevronLeft, Moon, Sun, Trash2, LayoutDashboard, User, Dumbbell, ScanLine } from "lucide-react";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { name: "FoodScanner", icon: ScanLine, label: "Scanner" },
  { name: "CalorieTracker", icon: Activity, label: "Calories" },
  { name: "ExerciseEngine", icon: Dumbbell, label: "Exercise" },
  { name: "Profile", icon: User, label: "Profile" },
];

function useDarkMode() {
  const [dark, setDark] = React.useState(() => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem("nutriscan_dark");
    if (stored !== null) return stored === "true";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("nutriscan_dark", String(dark));
  }, [dark]);

  return [dark, setDark];
}


export default function Layout({ children, currentPageName }) {
  const { user } = useAuth();
  const [dark, setDark] = useDarkMode();

  const navigate = useNavigate();
  const isRoot = currentPageName === "FoodScanner";

  React.useEffect(() => {
    async function load() {
      try {
        const u = (await api.auth.me()) || {};
        const profiles = await api.entities.UserProfile.filter({ created_by: u.email });
        if (profiles && profiles.length) setProfile(profiles[0]);
      } catch (e) {
        // ignore
      }
    }
    load();
  }, []);

  return (
    <div
      className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200"
      style={{ overscrollBehavior: "none" }}
    >
      <style>{`
        :root {
          --primary: #f59e0b;
          --primary-dark: #d97706;
          --safe-top: env(safe-area-inset-top, 0px);
          --safe-bottom: env(safe-area-inset-bottom, 0px);
        }
        html.dark {
          color-scheme: dark;
        }
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          overscroll-behavior: none;
          -webkit-overflow-scrolling: touch;
        }
        button, a, [role="button"] {
          min-height: 44px;
          min-width: 44px;
          -webkit-user-select: none;
          user-select: none;
        }
        .no-select {
          -webkit-user-select: none;
          user-select: none;
        }
      `}</style>

      {/* Desktop Nav */}
      <nav className="hidden md:flex items-center justify-between px-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50"
        style={{ paddingTop: "calc(1rem + var(--safe-top))", paddingBottom: "1rem" }}>
        <Link to={createPageUrl("FoodScanner")} className="flex items-center gap-2.5 no-select">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <Camera className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Bealth<span className="text-amber-500">AI</span>
          </span>
        </Link>
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPageName === item.name;
            return (
              <Link
                key={item.name}
                to={createPageUrl(item.name)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all no-select ${isActive
                  ? "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
          {/* Admin link visible only to owner/developer */}
          {user && (user.role === 'owner' || user.role === 'developer') && (
            <Link
              key="Admin"
              to={createPageUrl('Admin')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all no-select ${currentPageName === 'Admin'
                ? "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Admin
            </Link>
          )}
          <button
            onClick={() => setDark(d => !d)}
            className="ml-2 p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle dark mode"
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </nav>

      {/* Mobile Header */}
      <header
        className="md:hidden flex items-center justify-between px-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50"
        style={{ paddingTop: "calc(0.75rem + var(--safe-top))", paddingBottom: "0.75rem" }}
      >
        {!isRoot ? (
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium text-sm no-select"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
        ) : (
          <Link to={createPageUrl("FoodScanner")} className="flex items-center gap-2 no-select">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Camera className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-gray-900 dark:text-white">
              Bealth<span className="text-amber-500">AI</span>
            </span>
          </Link>
        )}

        <div className="flex items-center gap-1">
          {!isRoot && (
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {navItems.find(n => n.name === currentPageName)?.label || ""}
            </span>
          )}
          <button
            onClick={() => setDark(d => !d)}
            className="p-2 rounded-xl text-gray-500 dark:text-gray-400"
            aria-label="Toggle dark mode"
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Page Content with slide transitions */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={currentPageName}
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -40, opacity: 0 }}
          transition={{ duration: 0.22, ease: "easeInOut" }}
          className="pb-24 md:pb-8 dark:text-white"
        >
          {children}
        </motion.main>
      </AnimatePresence>

      {/* Mobile Bottom Nav */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 z-50 px-2"
        style={{ paddingBottom: "calc(0.5rem + var(--safe-bottom))", paddingTop: "0.5rem" }}
      >
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPageName === item.name;
            return (
              <Link
                key={item.name}
                to={createPageUrl(item.name)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all no-select min-h-[44px] justify-center ${isActive ? "text-amber-600 dark:text-amber-400" : "text-gray-400 dark:text-gray-500"
                  }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-amber-500" : ""}`} />
                <span className="text-[10px] font-medium">{item.label}</span>
                {isActive && <div className="w-1 h-1 rounded-full bg-amber-500" />}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}