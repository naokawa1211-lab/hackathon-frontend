import React from 'react';

// 4026年のダミー物質データ
const MOCK_PRODUCTS = [
  { id: 'TR-8092', title: '型落ちの小型探査艇（ジャンク）', price: 4500000, seller: 'シバタ大佐', status: '耐久度 34%', category: '宇宙船', image: '🚀' },
  { id: 'OX-1102', title: 'アルファ産 純度99.9% 圧縮酸素ボンベ', price: 1200, seller: 'エコアース社', status: '残量 80%', category: '生存物資', image: '💨' },
  { id: 'BH-0001', title: '卓上ミニ・ブラックホール（観賞用）', price: 85000, seller: 'Dr.マセ', status: '安定度：極めて安全', category: '天体ガジェット', image: '🕳️' },
];

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 font-mono p-6">
      
      {/* 📡 ヘッダーセクション */}
      <header className="flex justify-between items-center border-b border-cyan-500/30 pb-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-widest text-cyan-400 animate-pulse">
            MILKYWAY FLEA MARKET
          </h1>
          <p className="text-xs text-cyan-500/70 mt-1">CURRENT SECTOR: SOLAR-SYSTEM / YEAR: 4026</p>
        </div>
        <button className="bg-cyan-500/10 border border-cyan-400 text-cyan-400 px-4 py-2 rounded-sm text-sm hover:bg-cyan-500/30 transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)]">
          物質を射出（EJECT）
        </button>
      </header>

      {/* ☄️ メインコンテンツ：物資コンテナ一覧 */}
      <main>
        <h2 className="text-lg mb-6 text-purple-400 flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-purple-500 rounded-full animate-ping" />
          現在接近中の貨物一覧（INCOMING CARGO）
        </h2>

        {/* 📦 商品カードのグリッド配置 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MOCK_PRODUCTS.map((product) => (
            <div 
              key={product.id}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5 hover:border-cyan-500/50 transition-all duration-300 shadow-xl relative overflow-hidden group"
            >
              {/* 装飾用のホログラムコーナー線 */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-400 opacity-50 group-hover:opacity-100" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-400 opacity-50 group-hover:opacity-100" />

              {/* アイコン（本来は画像） */}
              <div className="h-40 bg-slate-950/50 rounded-lg flex items-center justify-center text-5xl mb-4 border border-white/5">
                {product.image}
              </div>

              {/* 商品情報 */}
              <span className="text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded">
                {product.category}
              </span>
              
              <h3 className="text-base font-bold mt-2 text-slate-200 group-hover:text-cyan-300 transition-colors">
                {product.title}
              </h3>

              <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/5 text-sm">
                <span className="text-xs text-slate-400">ID: #{product.id}</span>
                <span className="text-xs text-purple-400">{product.status}</span>
              </div>

              <div className="flex justify-between items-center mt-3">
                <span className="text-xs text-slate-500">TRADER: {product.seller}</span>
                <span className="text-lg font-bold text-amber-400">
                  {product.price.toLocaleString()} <span className="text-xs">cr</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>

    </div>
  );
};