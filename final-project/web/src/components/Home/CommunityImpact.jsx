import { Shield, Users, Sparkles } from "lucide-react";
import { statsCards, categories } from "../../data/homeData";

export default function CommunityImpact() {
  return (
    <section className="relative overflow-hidden pb-20">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(209,250,229,0.35),transparent_30%)]" />

      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center">
          <h2 className="text-5xl font-bold tracking-tight text-slate-950">
            Community Impact
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-2xl text-slate-600">
            Real-time statistics showing our collective effort to make the
            internet safer
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {statsCards.map((card) => (
            <div
              key={card.title}
              className="rounded-[28px] border border-slate-100 bg-white/90 p-8 shadow-[0_10px_30px_rgba(15,23,42,0.05)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                    {card.title}
                  </p>
                  <h3 className="mt-4 text-5xl font-bold text-slate-950">
                    {card.value}
                  </h3>
                  <p className="mt-4 text-2xl text-slate-400">
                    {card.subtitle}
                  </p>
                </div>

                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50">
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_1fr]">
          <div className="rounded-[30px] border border-slate-100 bg-white/90 p-8 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
            <h3 className="text-4xl font-bold text-slate-900">
              Content Categories Detected
            </h3>

            <div className="mt-10 space-y-10">
              {categories.map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.iconBg}`}
                      >
                        {item.icon}
                      </div>
                      <span className="text-2xl font-medium text-slate-700">
                        {item.label}
                      </span>
                    </div>

                    <span className="text-2xl font-semibold text-slate-900">
                      {item.value}
                    </span>
                  </div>

                  <div className="mt-4 h-3 w-full rounded-full bg-slate-100">
                    <div
                      className={`h-3 rounded-full ${item.color}`}
                      style={{ width: item.width }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[30px] bg-emerald-600 p-10 text-white shadow-[0_10px_30px_rgba(16,185,129,0.2)]">
            <h3 className="text-5xl font-bold">Our Mission</h3>

            <p className="mt-8 max-w-xl text-2xl leading-relaxed text-emerald-50">
              We believe everyone deserves a safe online experience. Our
              autonomous agent works tirelessly to identify and help you manage
              offensive content, while our community-driven approach ensures no
              one faces hate alone.
            </p>

            <div className="mt-10 space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                  <Shield size={22} />
                </div>
                <span className="text-2xl font-semibold">
                  Privacy-first protection
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                  <Users size={22} />
                </div>
                <span className="text-2xl font-semibold">
                  Community-powered reporting
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                  <Sparkles size={22} />
                </div>
                <span className="text-2xl font-semibold">
                  AI-assisted content detection
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
