import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle2, Calendar, User, Globe, MessageSquare, Edit3, X, Loader2, Orbit, KeyRound } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { MyPageSidebar } from '../components/sidebar/MyPageSidebar';
import { PRIMARY_BUTTON_CLASS } from '../styles/buttonStyles';
import { fireAuth } from '../firebase'; // 👈 パスは環境に合わせて調整してください
import { onAuthStateChanged, updateProfile } from 'firebase/auth';

// 🪐 静的なモックデータ（API連携するまではこれを表示）
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
  // 👥 ユーザー情報のステート
  const [userData, setUserData] = useState({
    username: '',
    spaceBase: '',
    bio: '',
    createdAt: '2026/06/01', // デフォルト値
  });

  // 🎬 各種UI状態管理
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // 📝 編集用フォームのステート
  const [editForm, setEditForm] = useState({ username: '', spaceBase: '', bio: '' });

  // 🛰️ 初期データ取得 (Firebase UID を元に MySQL 等から引っ張ってくる想定)
  useEffect(() => {
    // ログイン状態の変化を検知するリスナー
    const unsubscribe = onAuthStateChanged(fireAuth, (user) => {
      if (user) {
        // 1. 新規登録時、または過去の保存時に UID を鍵にして LocalStorage に隠したデータを取得
        const savedBase = localStorage.getItem(`space_base_${user.uid}`);
        const savedBio = localStorage.getItem(`space_bio_${user.uid}`);
        
        // 2. Firebaseのアカウント作成時刻から「宇宙暦（登録年月）」を自動パース
        const registrationDate = user.metadata.creationTime 
          ? new Date(user.metadata.creationTime).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })
          : '2026年06月';

        // 3. データ一式を構築（LocalStorageになければ初期モックテキストを割り当て）
        const currentData = {
          username: user.displayName || '', // 👈 Firebaseのガチのユーザー名
          spaceBase: savedBase !== null ? savedBase : '太陽系第3惑星 地球',
          bio: savedBio !== null ? savedBio : '銀河系全域の希少な天体やテクノロジーを収集しています。迅速かつ丁寧な取引を心がけています。',
          createdAt: registrationDate,
        };

        setUserData(currentData);
        setEditForm({
          username: currentData.username,
          spaceBase: currentData.spaceBase,
          bio: currentData.bio,
        });
      } else {
        console.log("宇宙通信途絶：ログインユーザーがいません");
      }
      setFetching(false);
    });

    // コンポーネントがアンマウントされたら監視リスナーを解除してメモリを守る
    return () => unsubscribe();
  }, []);
  // 💾 プロフィール保存処理
// 💾 修正箇所②: プロフィール保存処理 (Firebase & LocalStorage 永続化)
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = fireAuth.currentUser;
      if (!user) throw new Error("ユーザーが検知できません");

      // 1. Firebase Auth側のプロフィール（displayName）を完全更新
      await updateProfile(user, {
        displayName: editForm.username,
      });

      // 2. ユーザー固有の「UID」をキーにしてLocalStorageに完全永続化
      localStorage.setItem(`space_base_${user.uid}`, editForm.spaceBase);
      localStorage.setItem(`space_bio_${user.uid}`, editForm.bio);
      
      // 3. フロントエンドの描画用Stateも瞬時に同期
      setUserData({
        ...userData,
        username: editForm.username,
        spaceBase: editForm.spaceBase,
        bio: editForm.bio,
      });
      
      setIsEditing(false);
    } catch (err) {
      console.error("Profile Sync Error:", err);
      alert('通信エラーが発生しました。通信チャネルを確認してください。');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <AppLayout sidebar={<MyPageSidebar />}>
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-cyan-400 font-mono gap-3">
          <Loader2 className="animate-spin text-cyan-400" size={32} />
          <p className="text-xs tracking-widest uppercase">QUANTUM DATA LINKING...</p>
        </div>
      </AppLayout>
    );
  }
  // 名前がない場合の救済表示
  const currentUsername = userData.username.trim() || '名無しの宇宙飛行士';

  return (
    <AppLayout sidebar={<MyPageSidebar />}>
      <div className="max-w-6xl mx-auto space-y-8 relative">
        
        {/* 👤 プロフィールヘッダー */}
        <section className="relative rounded-3xl overflow-hidden border border-cyan-500/20 bg-[#0b1224]/30 backdrop-blur-md p-8 shadow-xl">
          {/* サイバー上部デコライン */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
              {/* アバター */}
              <div className="w-24 h-24 rounded-full border-2 border-cyan-500/40 p-1 relative shrink-0">
                <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200" alt="Avatar" className="w-full h-full rounded-full object-cover" />
                <div className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 rounded-full border-4 border-[#0b1224]" />
              </div>

              {/* ユーザー基本情報 */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  <h1 className={`text-2xl font-bold font-mono tracking-wide ${!userData.username ? 'text-slate-500 italic' : 'text-white'}`}>
                    {currentUsername}
                  </h1>
                  <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20 font-mono">
                    {!userData.username ? '未同期ユーザー' : '宇宙S級バイヤー'}
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-slate-400 font-mono">
                  <p className="flex items-center gap-1.5">
                    <Calendar size={12} className="text-cyan-500/70" />
                    登録: {userData.createdAt}
                  </p>
                  {userData.spaceBase && (
                    <p className="flex items-center gap-1.5">
                      <Globe size={12} className="text-cyan-500/70" />
                      拠点: {userData.spaceBase}
                    </p>
                  )}
                </div>

                <p className="text-[11px] text-slate-300 max-w-md font-mono leading-relaxed">
                  {userData.bio || '自己紹介プロトコルが未設定です。'}
                </p>

                <button 
                  onClick={() => {
                    setEditForm({ username: userData.username, spaceBase: userData.spaceBase, bio: userData.bio });
                    setIsEditing(true);
                  }}
                  className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-cyan-400/80 border border-cyan-500/30 bg-cyan-500/5 px-3 py-1.5 rounded hover:bg-cyan-500/20 hover:text-cyan-300 transition-all mt-2"
                >
                  <Edit3 size={12} />
                  プロフィールを同期・編集
                </button>
              </div>
            </div>

            {/* カウンター表示 */}
            <div className="flex gap-8 justify-center w-full md:w-auto text-center border-t border-slate-800 md:border-t-0 pt-4 md:pt-0">
              <StatItem label="取引総数" value="42" />
              <StatItem label="フォロワー" value="4.8k" />
              <StatItem label="フォロー" value="156" />
            </div>
          </div>
        </section>

        {/* 📊 サマリー統計 */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((stat, i) => (
            <div key={i} className="bg-[#0b1224]/20 border border-cyan-500/10 p-5 rounded-2xl backdrop-blur-xl shadow-lg">
              <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase mb-2">{stat.label}</p>
              <h3 className="text-xl font-bold font-mono text-slate-100">{stat.value}</h3>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-[10px] text-emerald-400 font-mono font-bold">{stat.change}</span>
                <span className="text-[9px] text-slate-600 font-mono">{stat.subLabel}</span>
              </div>
            </div>
          ))}
        </section>

        {/* 📦 メイングリッド */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左側: 商品タブリスト */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-1">
              <div className="flex gap-6 md:gap-8 text-xs font-mono font-bold">
                <button className="text-cyan-400 border-b-2 border-cyan-400 pb-3">出品した商品</button>
                <button className="text-slate-500 hover:text-slate-300 pb-3 transition-colors">購入した商品</button>
                <button className="text-slate-500 hover:text-slate-300 pb-3 transition-colors">お気に入り</button>
              </div>

              <button className={`flex items-center gap-2 text-[10px] px-4 py-1.5 rounded font-mono ${PRIMARY_BUTTON_CLASS}`}>
                <Plus size={14} />
                新しく出品する
              </button>
            </div>

            {/* 商品カード一覧 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {MY_PRODUCTS.map(product => (
                <div key={product.id} className="bg-[#0b1224]/10 border border-slate-800 rounded-xl overflow-hidden group hover:border-cyan-500/30 transition-all duration-300 shadow-md">
                  <div className="aspect-video relative">
                    <img src={product.img} alt={product.title} className="w-full h-full object-cover opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className={`absolute top-2 left-2 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${product.status === '出品中' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-700 text-slate-400'}`}>
                      {product.status}
                    </span>
                  </div>
                  <div className="p-3 space-y-2 font-mono">
                    <h4 className="text-[11px] font-bold text-slate-200 line-clamp-1">{product.title}</h4>
                    <p className="text-[13px] font-bold text-cyan-400">{product.price}</p>
                    <div className="flex justify-between items-center text-[9px] text-slate-500">
                      <span>宇宙暦: {product.date}</span>
                      <div className="flex gap-2.5">
                        <button className="hover:text-cyan-400 transition-colors">再出品</button>
                        <button className="hover:text-cyan-400 transition-colors">編集</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 右側サイドパネル */}
          <div className="space-y-6">
            {/* 取引履歴 */}
            <div className="bg-[#0b1224]/20 border border-cyan-500/10 rounded-2xl p-5 space-y-4 shadow-lg backdrop-blur-xl">
              <div className="flex justify-between items-center font-mono">
                <h3 className="text-xs font-bold tracking-wider">最近のデータ通信</h3>
                <button className="text-[10px] text-cyan-400 hover:underline">LOGS &gt;</button>
              </div>
              <div className="space-y-4 font-mono">
                {RECENT_TRANSACTIONS.map(tx => (
                  <div key={tx.id} className="flex gap-3 group cursor-pointer">
                    <div className="w-10 h-10 rounded border border-slate-800 overflow-hidden shrink-0">
                      <img src={tx.img} alt={tx.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow space-y-0.5等">
                      <p className="text-[10px] font-bold text-slate-300 line-clamp-1 group-hover:text-cyan-400 transition-colors">{tx.title}</p>
                      <div className="flex justify-between text-[9px] text-slate-500">
                        <span>ID: {tx.user}</span>
                        <span className="text-slate-400">{tx.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 完成度チェック */}
            <div className="bg-[#0b1224]/20 border border-cyan-500/10 rounded-2xl p-5 space-y-4 shadow-lg backdrop-blur-xl">
              <h3 className="text-xs font-bold font-mono tracking-wider">プロフィール同期状況</h3>
              <div className="space-y-3 font-mono">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className={userData.username ? "text-emerald-400" : "text-amber-400"}>
                    {userData.username ? "100%" : "60%"}
                  </span>
                  <span className="text-slate-500">
                    {userData.username ? "同期完了" : "ユーザー名が未同期です"}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${userData.username ? 'w-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'w-[60%] bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'}`} 
                  />
                </div>
                <ul className="space-y-2 pt-2">
                  <ProfileCheck label="暗号化通信の確立 (Auth)" checked />
                  <ProfileCheck label="宇宙拠点の記録 (Base)" checked />
                  <ProfileCheck label="アイデンティティの設定 (Name)" checked={!!userData.username} />
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 🌌 プロフィール編集用サイバーモーダル */}
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <div className="bg-[#0b1224]/90 backdrop-blur-xl border border-cyan-500/40 p-6 rounded-xl max-w-md w-full shadow-2xl shadow-cyan-500/20 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {/* 装飾デコライン */}
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
              
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-sm font-bold font-mono text-cyan-400 tracking-widest uppercase flex items-center gap-2">
                  <Orbit size={16} /> PROFILE SYNCHRONIZER
                </h3>
                <button 
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 font-mono text-xs">
                <div>
                  <label className="flex items-center gap-1.5 text-cyan-400/80 tracking-widest uppercase mb-1">
                    <User size={12} /> ユーザー名（識別ネーム）
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    placeholder="例：地球 花子 (空欄不可)"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/50 text-white rounded p-2.5 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-cyan-400/80 tracking-widest uppercase mb-1">
                    <Globe size={12} /> 宇宙での拠点
                  </label>
                  <input
                    type="text"
                    value={editForm.spaceBase}
                    onChange={(e) => setEditForm({ ...editForm, spaceBase: e.target.value })}
                    placeholder="例：オリオン腕ネオ東京"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/50 text-white rounded p-2.5 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-cyan-400/80 tracking-widest uppercase mb-1">
                    <MessageSquare size={12} /> 自己紹介プロトコル
                  </label>
                  <textarea
                    rows={4}
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    placeholder="通信ログに表示するステートメントを入力してください..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/50 text-white rounded p-2.5 outline-none transition-all resize-none leading-relaxed"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="w-1/3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 py-2.5 rounded tracking-widest uppercase transition-all"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded tracking-widest uppercase active:scale-[0.98] ${PRIMARY_BUTTON_CLASS}`}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        UPDATING...
                      </>
                    ) : (
                      'SAVE PROFILE'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
};

// --- サブコンポーネント ---
const StatItem = ({ label, value }: { label: string, value: string }) => (
  <div className="space-y-1 font-mono">
    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{label}</p>
    <p className="text-xl font-bold text-slate-200">{value}</p>
  </div>
);

const ProfileCheck = ({ label, checked = false }: { label: string, checked?: boolean }) => (
  <li className="flex items-center gap-2 text-[10px]">
    <CheckCircle2 size={12} className={checked ? 'text-emerald-500' : 'text-slate-800'} />
    <span className={checked ? 'text-slate-300' : 'text-slate-600'}>{label}</span>
  </li>
);