import { Zap } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Page({ color = "white" }) {
  const router = useRouter();
  return (
    <div
      onClick={() => {
        router.push("/");
      }}
      className="cursor-pointer flex items-center gap-2 mb-12"
    >
      <div className="w-10 h-10 bg-[oklch(64%_0.24_274)] rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
        <Zap className="w-6 h-6 text-white fill-current" />
      </div>
      <span className={`text-2xl font-black tracking-tighter text-${color}`}>
        XP<span className="text-[oklch(64%_0.24_274)]">LOCAL</span>
      </span>
    </div>
  );
}
