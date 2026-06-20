import React from 'react';
import { Search, Rocket, ShieldAlert, Orbit, Layers } from 'lucide-react';

// 💡 物質カテゴリーは sell.tsx の出品フォームの値と完全一致させる（一致しないと絞り込みが0件になる）
const CATEGORIES = [
  { label: '宇宙船・パーツ', icon: <Rocket size={14} /> },
  { label: '生存物資・酸素', icon: <ShieldAlert size={14} /> },
  { label: '天体ガジェット・インテリア', icon: <Orbit size={14} /> },
];

interface HomeSidebarProps {
  products: any[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export const HomeSidebar: React.FC<HomeSidebarProps> = ({
  products,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
}) => {
  return (
    <aside className="w-80 border-r border-slate-800/60 bg-[#060913]/80 p-6 flex flex-col gap-6 h-full font-mono">
      {/* 🔍 キーワード検索 */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">物資・シグナル検索</label>
        <div className="relative">
          <input
            type="text"
            placeholder="ID、物質名を入力..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[#030611] border border-slate-800 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50 transition-colors"
          />
          <Search size={14} className="absolute left-2.5 top-3 text-slate-500" />
        </div>
      </div>

      {/* 📦 物質カテゴリー */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">物質カテゴリー</label>
        <nav className="space-y-1">
          <FilterItem
            icon={<Layers size={14} />}
            label="全物質（ALL CARGO）"
            count={String(products.length)}
            active={selectedCategory === 'all'}
            onClick={() => onCategoryChange('all')}
          />
          {CATEGORIES.map((cat) => (
            <FilterItem
              key={cat.label}
              icon={cat.icon}
              label={cat.label}
              count={String(products.filter((p) => p.category === cat.label).length)}
              active={selectedCategory === cat.label}
              onClick={() => onCategoryChange(cat.label)}
            />
          ))}
        </nav>
      </div>
    </aside>
  );
};

// フィルタ項目用パーツ
const FilterItem = ({ icon, label, count, active = false, onClick }: { icon: React.ReactNode, label: string, count: string, active?: boolean, onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all ${
    active ? 'bg-purple-500/10 text-purple-400 font-bold border border-purple-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
  }`}>
    <div className="flex items-center gap-2">
      {icon}
      <span className="truncate">{label}</span>
    </div>
    <span className="text-[9px] text-slate-600 bg-slate-950 px-1.5 py-0.5 rounded-full">{count}</span>
  </button>
);