import Header from "../Home/Header";
import { Check, Download } from "lucide-react";
import { benefits, steps } from "../../data/joinData";

export default function JoinUs() {
  return (
    <div className="min-h-screen bg-[#f6faf8] text-slate-900">
      <Header />

      <main>
        <section className="relative overflow-hidden">
          <div className="mx-auto grid min-h-[calc(100vh-81px)] max-w-7xl items-center gap-12 px-6 py-16 md:grid-cols-2">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_right,rgba(110,231,183,0.22),transparent_35%),radial-gradient(circle_at_left,rgba(255,255,255,0.95),transparent_45%)]" />

            <div className="max-w-2xl">
              <h1 className="leading-tight">
                <span className="block text-6xl font-bold tracking-tight text-slate-950 md:text-7xl">
                  Join Our
                </span>
                <span className="block text-6xl font-bold tracking-tight text-emerald-600 md:text-7xl">
                  Community
                </span>
              </h1>

              <p className="mt-8 max-w-xl text-2xl leading-relaxed text-slate-600">
                Download the Guardian agent and become part of our mission to
                create a safer online environment. Together, we protect each
                other from harmful content.
              </p>

              <div className="mt-10 space-y-7">
                {benefits.map((item) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100">
                      <Check size={24} className="text-emerald-600" />
                    </div>

                    <div>
                      <h3 className="text-2xl font-semibold text-slate-950">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-xl text-slate-600">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex max-w-[580px] flex-col gap-4">
                <button className="flex items-center justify-center gap-3 rounded-3xl bg-emerald-500 px-8 py-5 text-xl font-semibold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-600">
                  <Download size={22} />
                  Download Guardian Extension
                </button>

                <button className="rounded-3xl border-2 border-emerald-200 bg-white px-8 py-5 text-xl font-semibold text-slate-950 shadow-sm transition hover:bg-emerald-50">
                  See Demo Example
                </button>
              </div>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="absolute h-[420px] w-[420px] rounded-full bg-emerald-200/30 blur-3xl" />
              <img
                src="/guardian-bot.png"
                alt="Guardian bot"
                className="relative z-10 w-[240px] drop-shadow-[0_20px_40px_rgba(16,185,129,0.25)] md:w-[300px]"
              />
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden pb-20">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(209,250,229,0.35),transparent_30%)]" />

          <div className="mx-auto max-w-7xl px-6 py-8">
            <div className="mb-12 text-center">
              <h2 className="text-5xl font-bold tracking-tight text-slate-950">
                How It Works
              </h2>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="rounded-[28px] border border-slate-100 bg-white/90 p-8 shadow-[0_10px_30px_rgba(15,23,42,0.05)]"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600">
                    <span className="text-3xl font-bold">{step.number}</span>
                  </div>

                  <h3 className="mt-8 text-3xl font-bold text-slate-900">
                    {step.title}
                  </h3>

                  <p className="mt-4 text-2xl leading-relaxed text-slate-600">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}