import {
  FileText,
  TrendingUp,
  Users,
  Shield,
  Heart,
  Scale,
  BookOpen,
  UserRound,
} from "lucide-react";

export const statsCards = [
  {
    title: "TOTAL REPORTS",
    value: "---",
    subtitle: "Pending data",
    icon: <FileText size={28} className="text-emerald-600" />,
  },
  {
    title: "REPORT RATE",
    value: "--%",
    subtitle: "Pending data",
    icon: <TrendingUp size={28} className="text-orange-500" />,
  },
  {
    title: "COMMUNITY MEMBERS",
    value: "---",
    subtitle: "Pending data",
    icon: <Users size={28} className="text-blue-500" />,
  },
  {
    title: "CONTENT PROTECTED",
    value: "---",
    subtitle: "Pending data",
    icon: <Shield size={28} className="text-violet-500" />,
  },
];

export const categories = [
  {
    label: "Category One",
    value: "---",
    width: "35%",
    color: "bg-pink-500",
    icon: <Heart size={20} className="text-slate-700" />,
    iconBg: "bg-pink-100",
  },
  {
    label: "Category Two",
    value: "---",
    width: "28%",
    color: "bg-amber-500",
    icon: <Scale size={20} className="text-slate-700" />,
    iconBg: "bg-amber-100",
  },
  {
    label: "Category Three",
    value: "---",
    width: "22%",
    color: "bg-violet-500",
    icon: <BookOpen size={20} className="text-slate-700" />,
    iconBg: "bg-violet-100",
  },
  {
    label: "Category Four",
    value: "---",
    width: "18%",
    color: "bg-sky-500",
    icon: <UserRound size={20} className="text-slate-700" />,
    iconBg: "bg-sky-100",
  },
];