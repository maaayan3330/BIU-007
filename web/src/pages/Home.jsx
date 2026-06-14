import HeroCenter from "../components/Home/HeroCenter";
import CommunityImpact from "../components/Home/CommunityImpact";

export default function Home({ setOpenChat }) {
  return (
    <div className="min-h-screen bg-[#f6faf8] text-slate-900">
      <HeroCenter setOpenChat={setOpenChat} />
      <CommunityImpact />
    </div>
  );
}