import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import ChatBot from "../../chatBot/ChatBot";

export default function HeroCenter() {
  const [openChat, setOpenChat] = useState(false);

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid min-h-[calc(100vh-81px)] max-w-7xl items-center gap-12 px-6 py-16 md:grid-cols-2">
        
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_right,rgba(110,231,183,0.22),transparent_35%),radial-gradient(circle_at_left,rgba(255,255,255,0.95),transparent_45%)]" />

        <div className="max-w-xl">
          <h1 className="leading-tight">
            <span className="block text-6xl font-bold text-slate-950 md:text-7xl">
              Your Digital
            </span>
            <span className="block text-6xl font-bold text-emerald-600 md:text-7xl">
              Guardian
            </span>
          </h1>

          <p className="mt-8 text-2xl text-slate-600">
            Protecting users from harmful online content with a cleaner, safer,
            and smarter browsing experience.
          </p>

          <div className="mt-10 flex gap-4">
            <button
              onClick={() => setOpenChat(true)}
              className="flex items-center gap-2 rounded-3xl bg-emerald-500 px-8 py-4 text-lg font-semibold text-white hover:bg-emerald-600"
            >
              Talk to Guardian
              <ArrowRight size={20} />
            </button>

            <Link
              to="/join"
              className="rounded-3xl border px-8 py-4 text-lg"
            >
              Join us
            </Link>
          </div>
        </div>

        <div className="flex justify-center">
          <img src="/guardian-bot.png" className="w-[300px]" />
        </div>
      </div>

      {/* 👇 הבוט בפינה */}
      <ChatBot openChat={openChat} setOpenChat={setOpenChat} />
    </section>
  );
}