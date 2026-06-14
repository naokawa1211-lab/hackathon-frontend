import { Link, useLocation } from "react-router-dom";

const navItems = [
  { label: "HOME", path: "/" },
  { label: "SEARCH", path: "/search" },
  { label: "SELL", path: "/sell" },
  { label: "LIKE", path: "/like" },
  { label: "DM", path: "/DM" },
  { label: "PROFILE", path: "/mypage" },
];

export default function HeaderNavigation() {

  const location = useLocation();

  return (
    <header
      className="
      sticky
      top-0
      z-50
      h-16
      border-b
      border-cyan-500/20
      bg-[#030611]/90
      backdrop-blur-md
    "
    >
      <div
        className="
        max-w-7xl
        mx-auto
        h-full
        flex
        items-center
        justify-between
        px-6
      "
      >
        <div
          className="
          text-cyan-400
          font-bold
          tracking-widest
        "
        >
          ✦ MILKYWAY MARKET
        </div>

        <nav className="flex gap-6">

          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                text-xs
                tracking-widest
                transition-colors

                ${
                  location.pathname === item.path
                    ? "text-cyan-400"
                    : "text-slate-500 hover:text-slate-300"
                }
              `}
            >
              {item.label}
            </Link>
          ))}

        </nav>
      </div>
    </header>
  );
}