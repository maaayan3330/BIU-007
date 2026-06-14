import { useEffect, useState } from "react";
import {
  Shield,
  Users,
  Sparkles,
  FileText,
  TrendingUp,
  UserRound,
  Heart,
  Scale,
  BookOpen,
  MessageCircle,
} from "lucide-react";

const API_BASE_URL = "http://localhost:8000";

const CATEGORY_META = {
  lgbtq: {
    label: "LGBTQ+ Hate",
    icon: <Heart size={22} />,
    iconBg: "bg-pink-100 text-pink-600",
    color: "bg-pink-500",
  },
  appearance_and_weight: {
    label: "Appearance & Weight",
    icon: <UserRound size={22} />,
    iconBg: "bg-blue-100 text-blue-600",
    color: "bg-blue-500",
  },
  religious_discrimination: {
    label: "Religious Discrimination",
    icon: <Scale size={22} />,
    iconBg: "bg-amber-100 text-amber-600",
    color: "bg-amber-500",
  },
  general: {
    label: "General Toxicity",
    icon: <MessageCircle size={22} />,
    iconBg: "bg-violet-100 text-violet-600",
    color: "bg-violet-500",
  },
};

function StatCard({ title, value, subtitle, icon }) {
  return (
    <div className="rounded-[28px] border border-slate-100 bg-white/90 p-8 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            {title}
          </p>
          <h3 className="mt-4 text-5xl font-bold text-slate-950">{value}</h3>
          <p className="mt-4 text-2xl text-slate-400">{subtitle}</p>
        </div>

        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50">
          {icon}
        </div>
      </div>
    </div>
  );
}

function CategoryRow({ item }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.iconBg}`}
          >
            {item.icon}
          </div>

          <div>
            <span className="block text-2xl font-medium text-slate-700">
              {item.label}
            </span>
            <span className="text-sm text-slate-400">
              {item.count} detected comments
            </span>
          </div>
        </div>

        <span className="text-2xl font-semibold text-slate-900">
          {item.percentage}%
        </span>
      </div>

      <div className="mt-4 h-3 w-full rounded-full bg-slate-100">
        <div
          className={`h-3 rounded-full ${item.color}`}
          style={{ width: `${item.percentage}%` }}
        />
      </div>
    </div>
  );
}

function MissionItem({ icon, text }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
        {icon}
      </div>
      <span className="text-2xl font-semibold">{text}</span>
    </div>
  );
}

export default function CommunityImpact() {
  const [stats, setStats] = useState(null);
  const [categoryStats, setCategoryStats] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [statsResponse, categoriesResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/stats`),
          fetch(`${API_BASE_URL}/stats/categories`),
        ]);

        if (!statsResponse.ok || !categoriesResponse.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        setStats(await statsResponse.json());
        setCategoryStats(await categoriesResponse.json());
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
        setError("Could not load live statistics");
      }
    }

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      title: "Total Reports",
      value: stats ? stats.total_reports : "---",
      subtitle: stats ? "Reports submitted" : "Loading data",
      icon: <FileText className="text-emerald-600" size={30} />,
    },
    {
      title: "Report Rate",
      value: stats ? `${stats.report_rate}%` : "--%",
      subtitle: stats ? "Reports per checked content" : "Loading data",
      icon: <TrendingUp className="text-orange-500" size={30} />,
    },
    {
      title: "Community Members",
      value: stats ? stats.community_members : "---",
      subtitle: stats ? "Protected users" : "Loading data",
      icon: <Users className="text-blue-500" size={30} />,
    },
    {
      title: "Content Protected",
      value: stats ? stats.total_comments : "---",
      subtitle: stats ? "Comments analyzed" : "Loading data",
      icon: <Shield className="text-violet-500" size={30} />,
    },
  ];

  const liveCategories = categoryStats
    .map((item) => ({
      ...CATEGORY_META[item.category],
      key: item.category,
      count: item.count,
      percentage: item.percentage,
    }))
    .filter((item) => item.key)
    .sort((a, b) => b.count - a.count);

  const missionItems = [
    { icon: <Shield size={22} />, text: "Privacy-first protection" },
    { icon: <Users size={22} />, text: "Community-powered reporting" },
    { icon: <Sparkles size={22} />, text: "AI-assisted content detection" },
  ];

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

          {error && <p className="mt-4 text-lg font-medium text-red-500">{error}</p>}
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => (
            <StatCard key={card.title} {...card} />
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_1fr]">
          <div className="rounded-[30px] border border-slate-100 bg-white/90 p-8 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-4xl font-bold text-slate-900">
                Content Categories Detected
              </h3>
              <BookOpen className="text-slate-300" size={34} />
            </div>

            <div className="mt-10 space-y-8">
              {liveCategories.length > 0 ? (
                liveCategories.map((item) => (
                  <CategoryRow key={item.key} item={item} />
                ))
              ) : (
                <p className="text-2xl text-slate-400">
                  No category data yet
                </p>
              )}
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
              {missionItems.map((item) => (
                <MissionItem key={item.text} {...item} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}