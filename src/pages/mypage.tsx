import React from 'react';
import { Plus, CheckCircle2 } from 'lucide-react';
// 1. AppLayout と新しく作った Sidebar をインポート
import  AppLayout  from '../components/layout/AppLayout'; 
import { MyPageSidebar } from '../components/sidebar/MyPageSidebar';

// 🪐 モックデータ
const STATS = [
  { label: '総取引数', value: '42', change: '+3', subLabel: '直近30日間' },
  { label: '総売上金額', value: '¥1,245,000', change: '+¥12,000', subLabel: '直近30日間' },
  { label: '購入総額', value: '¥780,500', change: '+¥20,000', subLabel: '直近30日間' },
  { label: '評価', value: '4.8', change: '5.0', subLabel: '(127件)' },
];

const MY_PRODUCTS = [
  { id: 1, title: 'シリウスの完熟サンプ', price: '¥ 120,000,000', date: '2024/05/20', status: '出品中', img: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=300' },
  { id: 2, title: 'ベテルギウスの散光片', price: '¥ 85,000,000', date: '2024/04/15', status: '出品中', img: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=300' },
  { id: 3, title: 'エクロパの氷晶石', price: '¥ 18,000,000', date: '2024/03/10', status: '売却済', img: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=300' },
  { id: 4, title: 'オリオン座散光スター', price: '¥ 12,000,000', date: '2024/02/05', status: '再出品', img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=300' },
];

const RECENT_TRANSACTIONS = [
  { id: 1, title: 'シリウスの完熟サンプ', price: '¥120,000,000', user: 'PlanetTrader', date: '2024/05/15', img: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=100' },
  { id: 2, title: '星屑のエンジンパーツ', price: '¥75,000,000', user: 'SpaceMech', date: '2024/05/12', img: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=100' },
  { id: 3, title: 'ベテルギウスの散光片', price: '¥85,000,000', user: 'CosmicHunter', date: '2024/05/08', img: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=100' },
];

export const MyPage = () => {
  return (
    // 2. AppLayoutで包み、サイドバーをPropで渡す（または共通レイアウトのルールに合わせる）
    <AppLayout sidebar={<MyPageSidebar />}>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* 👤 プロフィールヘッダー */}
        <section className="relative rounded-3xl overflow-hidden border border-slate-800/60 bg-gradient-to-br from-[#0d1536] to-[#070b1e] p-8">
          <div className="flex justify-between items-start">
            <div className="flex gap-6">
              <div className="w-24 h-24 rounded-full border-2 border-cyan-500/50 p-1 relative">
                <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200" alt="Avatar" className="w-full h-full rounded-full object-cover" />
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 rounded-full border-4 border-[#0d1536]" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">NovaCollector</h1>
                  <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20">宇宙S級バイヤー</span>
                </div>
                <p className="text-xs text-slate-400">📅 登録日 : 2022年10月から利用中</p>
                <p className="text-[11px] text-slate-300 max-w-md">銀河系全域の希少な天体やテクノロジーを収集しています。迅速かつ丁寧な取引を心がけています。</p>
                <button className="text-[10px] font-bold text-slate-400 border border-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors">
                  プロフィールを編集
                </button>
              </div>
            </div>
            <div className="flex gap-8 text-center">
              <StatItem label="取引総数" value="42" />
              <StatItem label="フォロワー" value="4.8k" />
              <StatItem label="フォロー" value="156" />
            </div>
          </div>
        </section>

        {/* 📊 サマリー統計 */}
        <section className="grid grid-cols-4 gap-4">
          {STATS.map((stat, i) => (
            <div key={i} className="bg-[#070b1e]/60 border border-slate-800/60 p-5 rounded-2xl backdrop-blur-sm">
              <p className="text-[10px] text-slate-500 font-bold mb-3">{stat.label}</p>
              <h3 className="text-xl font-bold text-slate-100">{stat.value}</h3>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-[10px] text-emerald-400 font-bold">{stat.change}</span>
                <span className="text-[9px] text-slate-600">{stat.subLabel}</span>
              </div>
            </div>
          ))}
        </section>

        {/* 📦 商品タブ & リスト */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800/60 pb-1">
              <div className="flex gap-8 text-xs font-bold">
                <button className="text-cyan-400 border-b-2 border-cyan-400 pb-3">出品した商品</button>
                <button className="text-slate-500 hover:text-slate-300 pb-3 transition-colors">購入した商品</button>
                <button className="text-slate-500 hover:text-slate-300 pb-3 transition-colors">お気に入り</button>
                <button className="text-slate-500 hover:text-slate-300 pb-3 transition-colors">レビュー</button>
              </div>

              <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold px-4 py-1.5 rounded-lg transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                <Plus size={14} />
                新しく出品する
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {MY_PRODUCTS.map(product => (
                <div key={product.id} className="bg-[#070b1e]/40 border border-slate-800/50 rounded-xl overflow-hidden group">
                  <div className="aspect-video relative">
                    <img src={product.img} alt={product.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    <span className={`absolute top-2 left-2 text-[8px] font-bold px-1.5 py-0.5 rounded ${product.status === '出品中' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-700 text-slate-400'}`}>
                      {product.status}
                    </span>
                  </div>
                  <div className="p-3 space-y-2">
                    <h4 className="text-[11px] font-bold text-slate-200 line-clamp-1">{product.title}</h4>
                    <p className="text-[13px] font-bold text-slate-100">{product.price}</p>
                    <div className="flex justify-between items-center text-[9px] text-slate-500">
                      <span>出品日: {product.date}</span>
                      <div className="flex gap-2">
                        <button className="hover:text-cyan-400">再出品</button>
                        <button className="hover:text-cyan-400">編集</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 📈 サイドパネル: 取引履歴 & プロフィール完成度 */}
          <div className="space-y-6">
            <div className="bg-[#070b1e]/60 border border-slate-800/60 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold tracking-wider">最近の取引</h3>
                <button className="text-[10px] text-cyan-400">すべて見る &gt;</button>
              </div>
              <div className="space-y-4">
                {RECENT_TRANSACTIONS.map(tx => (
                  <div key={tx.id} className="flex gap-3 group cursor-pointer">
                    <div className="w-10 h-10 rounded border border-slate-800 overflow-hidden shrink-0">
                      <img src={tx.img} alt={tx.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow space-y-1">
                      <p className="text-[10px] font-bold line-clamp-1 group-hover:text-cyan-400 transition-colors">{tx.title}</p>
                      <div className="flex justify-between text-[9px] text-slate-500">
                        <span>{tx.user}</span>
                        <span>{tx.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#070b1e]/60 border border-slate-800/60 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold tracking-wider">プロフィール完成度</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-emerald-400">85%</span>
                  <span className="text-slate-500">あと少しで完了です！</span>
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div className="w-[85%] h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                </div>
                <ul className="space-y-2 pt-2">
                  <ProfileCheck label="プロフィール写真を設定" checked />
                  <ProfileCheck label="自己紹介文を充実させる" checked />
                  <ProfileCheck label="宇宙銀行口座を連携" checked />
                  <ProfileCheck label="本人確認を完了" />
                </ul>
              </div>
            </div>
          </div>
        </div>

      </div>
    </AppLayout>
  );
};

// --- 小規模コンポーネント ---
const StatItem = ({ label, value }: { label: string, value: string }) => (
  <div className="space-y-1">
    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{label}</p>
    <p className="text-xl font-bold">{value}</p>
  </div>
);

const ProfileCheck = ({ label, checked = false }: { label: string, checked?: boolean }) => (
  <li className="flex items-center gap-2 text-[10px]">
    <CheckCircle2 size={12} className={checked ? 'text-emerald-500' : 'text-slate-800'} />
    <span className={checked ? 'text-slate-400' : 'text-slate-600'}>{label}</span>
  </li>
);