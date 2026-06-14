import { Home, MessageCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function Header({ setOpenChat }) {
  const location = useLocation();

  const isHome = location.pathname === "/";
  const isJoin = location.pathname === "/join";

  return (
    <header className="sticky top-0 z-50 border-b border-emerald-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 shadow-sm">
            <img
              src="/guardian-bot.png"
              alt="Guardian logo"
              className="h-6 w-6 object-contain"
            />
          </div>
          <span className="text-3xl font-bold text-emerald-700">
            Guardian
          </span>
        </div>

        <nav className="flex items-center gap-3">
          {isHome && (
            <Link
              to="/join"
              className="flex items-center gap-2 rounded-2xl bg-emerald-100 px-5 py-3 font-medium text-emerald-800 transition hover:bg-emerald-200"
            >
              Join
            </Link>
          )}

          {isJoin && (
            <Link
              to="/"
              className="flex items-center gap-2 rounded-2xl bg-emerald-100 px-5 py-3 font-medium text-emerald-800 transition hover:bg-emerald-200"
            >
              <Home size={18} />
              Home
            </Link>
          )}

          <button
            onClick={() => setOpenChat(true)}
            className="flex items-center gap-2 rounded-2xl px-4 py-3 font-medium text-slate-600 transition hover:bg-slate-100"
          >
            <MessageCircle size={18} />
            Chat
          </button>
        </nav>
      </div>
    </header>
  );
}