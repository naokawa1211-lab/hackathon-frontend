import React from 'react';

// 1. 親から受け取るPropsの型定義
interface SearchSidebarProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  priceRange: number;
  onPriceChange: (price: number) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  onReset: () => void;
}

// 2. 宇宙仕様のカテゴリデータ
const CATEGORIES = [
  { id: 'all', label: 'すべて', icon: '🚀' },
  { id: 'stars', label: '恒星・星', icon: '✨' },
  { id: 'planets', label: '惑星・衛星', icon: '🪐' },
  { id: 'blackhole', label: 'ブラックホール', icon: '🕳️' },
  { id: 'galaxies', label: '銀河・星雲', icon: '🌌' },
  { id: 'others', label: 'その他', icon: '☄️' },
];

export const SearchSidebar: React.FC<SearchSidebarProps> = ({
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceChange,
  sortBy,
  onSortChange,
  onReset,
}) => {
  return (
    <aside className="
      h-full w-72
      flex flex-col gap-8 p-6
      bg-slate-950/40 backdrop-blur-md
      border-r border-cyan-500/20
      text-slate-200 overflow-y-auto
    ">
      {/* 絞り込みタイトル & リセットボタン */}
      <div className="flex justify-between items-center border-b border-cyan-500/20 pb-4">
        <h2 className="text-base font-bold tracking-widest text-cyan-400 flex items-center gap-2">
          絞り込み
        </h2>
        <button
          onClick={onReset}
          className="text-xs text-slate-400 hover:text-cyan-400 transition-colors bg-cyan-500/5 hover:bg-cyan-500/10 px-2 py-1 rounded border border-cyan-500/10"
        >
          リセット
        </button>
      </div>

      {/* カテゴリセクション */}
      <div>
        <h3 className="text-xs font-bold text-cyan-500/60 uppercase tracking-wider mb-3">
          カテゴリ
        </h3>
        <div className="flex flex-col gap-1">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={`
                  flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${isSelected 
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.1)]' 
                    : 'hover:bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-transparent'
                  }
                `}
              >
                <span className="text-base">{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 価格帯セクション */}
      <div>
        <h3 className="text-xs font-bold text-cyan-500/60 uppercase tracking-wider mb-3">
          価格帯
        </h3>
        <div className="flex flex-col gap-2">
          <input
            type="range"
            min={0}
            max={1000000000}
            step={1000000}
            value={priceRange}
            onChange={(e) => onPriceChange(Number(e.target.value))}
            className="w-full accent-cyan-400 bg-slate-900 h-1.5 rounded-lg appearance-none cursor-pointer border border-cyan-500/10"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>μCr 0</span>
            <span>1,000,000,000+</span>
          </div>
          <div className="mt-2 px-3 py-1.5 bg-slate-900/80 border border-cyan-500/10 rounded-md text-right">
            <span className="text-xs text-slate-500 font-mono mr-1">μCr</span>
            <span className="text-sm font-bold font-mono text-cyan-400">
              {priceRange === 0 ? '0' : priceRange.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* 並び替えセクション */}
      <div>
        <h3 className="text-xs font-bold text-cyan-500/60 uppercase tracking-wider mb-3">
          並び替え
        </h3>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="
            w-full px-3 py-2 text-sm
            bg-slate-900/80 border border-cyan-500/20 rounded-lg text-slate-300
            focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400
            cursor-pointer transition-colors
          "
        >
          <option value="newest">新着順</option>
          <option value="price_asc">価格の安い順</option>
          <option value="price_desc">価格の高い順</option>
        </select>
      </div>
    </aside>
  );
};