import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function HeroCenter() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid min-h-[calc(100vh-81px)] max-w-7xl items-center gap-12 px-6 py-16 md:grid-cols-2">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_right,rgba(110,231,183,0.22),transparent_35%),radial-gradient(circle_at_left,rgba(255,255,255,0.95),transparent_45%)]" />

        <div className="max-w-xl">
          <h1 className="leading-tight">
            <span className="block text-6xl font-bold tracking-tight text-slate-950 md:text-7xl">
              Your Digital
            </span>
            <span className="block text-6xl font-bold tracking-tight text-emerald-600 md:text-7xl">
              Guardian
            </span>
          </h1>

          <p className="mt-8 text-2xl leading-relaxed text-slate-600">
            Protecting users from harmful online content with a cleaner, safer,
            and smarter browsing experience.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <button className="flex items-center gap-2 rounded-3xl bg-emerald-500 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-600">
              Talk to Guardian
              <ArrowRight size={20} />
            </button>

            <Link
            to="/join"
            className="rounded-3xl border border-slate-200 bg-white px-8 py-4 text-lg font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 inline-block text-center"
          >
            Join us
          </Link>
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="absolute h-[420px] w-[420px] rounded-full bg-emerald-200/30 blur-3xl" />
          <img
            src="/guardian-bot.png"
            alt="Guardian bot"
            className="relative z-10 w-[260px] drop-shadow-[0_20px_40px_rgba(16,185,129,0.25)] md:w-[320px]"
          />
        </div>

      </div>
    </section>
  );
}
