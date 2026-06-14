import React from 'react';
import { Search, Rocket, ShieldAlert, Orbit, Layers } from 'lucide-react';

export const HomeSidebar = () => {
  return (
    <aside className="w-64 border-r border-slate-800/60 bg-[#060913]/80 p-6 flex flex-col gap-6 h-full font-mono">
      {/* 🔍 キーワード検索 */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">物資・シグナル検索</label>
        <div className="relative">
          <input 
            type="text" 
            placeholder="ID、物質名を入力..." 
            className="w-full bg-[#030611] border border-slate-800 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50 transition-colors"
          />
          <Search size={14} className="absolute left-2.5 top-3 text-slate-500" />
        </div>
      </div>

      {/* 🌌 セクターフィルター */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">索敵セクター（領域）</label>
        <select className="w-full bg-[#030611] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500/50">
          <option>SOLAR-SYSTEM（太陽系）</option>
          <option>ALPHA-CENTAURI（アルファ系）</option>
          <option>ORION-ARM（オリオン腕）</option>
          <option>DEEP-SPACE（深宇宙）</option>
        </select>
      </div>

      {/* 📦 物質カテゴリー */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">物質カテゴリー</label>
        <nav className="space-y-1">
          <FilterItem icon={<Layers size={14} />} label="全物質（ALL CARGO）" count="1,245" active />
          <FilterItem icon={<Rocket size={14} />} label="宇宙船・パーツ" count="84" />
          <FilterItem icon={<ShieldAlert size={14} />} label="生存物資・酸素" count="312" />
          <FilterItem icon={<Orbit size={14} />} label="天体ガジェット" count="19" />
        </nav>
      </div>

      {/* 💰 クレジットレンジ */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">取引価格（cr）</label>
        <div className="flex items-center gap-2">
          <input type="number" placeholder="MIN" className="w-full bg-[#030611] border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-300" />
          <span className="text-slate-600 text-xs">~</span>
          <input type="number" placeholder="MAX" className="w-full bg-[#030611] border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-300" />
        </div>
      </div>
    </aside>
  );
};

// フィルタ項目用パーツ
const FilterItem = ({ icon, label, count, active = false }: { icon: React.ReactNode, label: string, count: string, active?: boolean }) => (
  <button className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all ${
    active ? 'bg-purple-500/10 text-purple-400 font-bold border border-purple-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
  }`}>
    <div className="flex items-center gap-2">
      {icon}
      <span className="truncate">{label}</span>
    </div>
    <span className="text-[9px] text-slate-600 bg-slate-950 px-1.5 py-0.5 rounded-full">{count}</span>
  </button>
);