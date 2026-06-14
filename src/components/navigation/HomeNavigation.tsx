import React from "react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { label: "ホーム", path: "/", icon: "🚀" },
  { label: "探す", path: "/search", icon: "🌌" },
  { label: "出品", path: "/sell", icon: "💫" },
  { label: "お気に入り", path: "/like", icon: "⭐" },
  { label: "メッセージ", path: "/DM", icon: "📡" },
  { label: "マイページ", path: "/mypage", icon: "👨‍🚀" },
];

interface LayoutProps {
  children?: React.ReactNode;
}

export const HomeNavigation: React.FC<LayoutProps> = ({
  children,
}) => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-black text-cyan-100">

      {/* Sidebar */}
      <aside className="
        hidden lg:flex
        w-72
        flex-col
        border-r
        border-cyan-500/20
        bg-gradient-to-b
        from-slate-950
        via-slate-950
        to-black
        shadow-[0_0_30px_rgba(34,211,238,0.08)]
      ">

        {/* Logo */}
        <div className="p-6 border-b border-cyan-500/20">
          <h1 className="text-cyan-400 text-xl font-bold tracking-widest">
            ✦ MILKYWAY
          </h1>

          <p className="text-xs text-slate-500 mt-1">
            Galactic Exchange Network
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-2">

          <div className="text-xs text-cyan-500 mb-3 tracking-wider">
            COMMAND CENTER
          </div>

          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex
                  items-center
                  gap-3
                  px-4
                  py-3
                  rounded-lg
                  transition-all
                  border

                  ${
                    isActive
                      ? `
                        bg-cyan-500/10
                        border-cyan-400
                        text-cyan-300
                        shadow-[0_0_15px_rgba(34,211,238,0.2)]
                      `
                      : `
                        border-transparent
                        text-slate-400
                        hover:text-cyan-300
                        hover:bg-cyan-500/5
                      `
                  }
                `}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Panel */}
        <div className="
          border-t
          border-cyan-500/20
          p-5
          space-y-3
        ">

          <div>
            <div className="text-xs text-slate-500">
              CURRENT SECTOR
            </div>

            <div className="text-cyan-300">
              Orion Arm
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-500">
              GALACTIC CREDITS
            </div>

            <div className="text-cyan-300">
              1,240,000 GC
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-500">
              REPUTATION
            </div>

            <div className="text-yellow-400">
              ★★★★★
            </div>
          </div>

        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 bg-black">
        {children}
      </main>

    </div>
  );
};