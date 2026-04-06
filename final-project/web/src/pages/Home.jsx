import HeroCenter from "../components/Home/HeroCenter";
import Header from "../components/Home/Header";
import CommunityImpact from "../components/Home/CommunityImpact";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f6faf8] text-slate-900">
      <Header />
      <HeroCenter />
      <CommunityImpact />
    </div>
  );
}
