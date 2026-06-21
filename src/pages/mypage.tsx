import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle2, Calendar, User, Globe, MessageSquare, Edit3, X, Loader2, Orbit, ShoppingBag, Star } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { MyPageSidebar, MyPageTab } from '../components/sidebar/MyPageSidebar';
import { PRIMARY_BUTTON_CLASS } from '../styles/buttonStyles';
import { fireAuth } from '../firebase';
import { onAuthStateChanged, updateProfile } from 'firebase/auth';
import { useNavigate } from 'react-router-dom'; // 🚀 画面遷移用に召喚
import { API_BASE_URL } from '../config/api';
import { ReviewModal } from '../components/Modal/ReviewModal';

export const MyPage = () => {
  const navigate = useNavigate();

  // 👥 ユーザー情報のステート
  const [userData, setUserData] = useState({
    username: '',
    spaceBase: '',
    bio: '',
    createdAt: '2026/06/01',
    photoURL: '' as string | null,
  });

  // 📦 【追加】バックエンドから取得するマイ商品ステート
  const [myProducts, setMyProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  // 🛒 購入した商品ステート
  const [purchasedProducts, setPurchasedProducts] = useState<any[]>([]);
  const [purchasedLoading, setPurchasedLoading] = useState(true);

  // ❤️ お気に入り商品ステート
  const [favoriteProducts, setFavoriteProducts] = useState<any[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(true);

  // ⭐ 受け取ったレビューステート
  const [receivedReviews, setReceivedReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  // ⭐ レビュー投稿モーダルの状態（nullなら非表示）
  const [reviewTarget, setReviewTarget] = useState<any | null>(null);

  // 🚀 サイドバー・タブ切り替え状態（出品した商品／購入した商品／お気に入り等）
  const [activeTab, setActiveTab] = useState<MyPageTab>('listings');

  // 🎬 各種UI状態管理
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // 📝 編集用フォームのステート
  const [editForm, setEditForm] = useState({ username: '', spaceBase: '', bio: '' });

  // 🛰️ 初期データ取得
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(fireAuth, (user) => {
      if (user) {
        // 1. LocalStorage から拡張プロフィールを取得
        const savedBase = localStorage.getItem(`space_base_${user.uid}`);
        const savedBio = localStorage.getItem(`space_bio_${user.uid}`);
        
        // 2. 登録年月パース
        const registrationDate = user.metadata.creationTime 
          ? new Date(user.metadata.creationTime).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })
          : '2026年06月';

        // 3. ユーザーデータのマッピング
        const currentData = {
          username: user.displayName || '',
          spaceBase: savedBase !== null ? savedBase : '太陽系第3惑星 地球',
          bio: savedBio !== null ? savedBio : '銀河系全域の希少な天体やテクノロジーを収集しています。迅速かつ丁寧な取引を心がけています。',
          createdAt: registrationDate,
          photoURL: user.photoURL, // 👈 Google/GitHub等の本物のアバター（無ければnull）
        };

        setUserData(currentData);
        setEditForm({
          username: currentData.username,
          spaceBase: currentData.spaceBase,
          bio: currentData.bio,
        });

        // 🚀 【Claude Code連携】ログイン完了フックで、バックエンドから本物の商品をフェッチ
        fetch(`${API_BASE_URL}/api/products`)
          .then((res) => (res.ok ? res.json() : []))
          .then((allProducts) => {
            // 自分の UID（seller_id）に一致するものだけをガチ抽出
            const filtered = allProducts.filter((p: any) => p.seller_id === user.uid);
            setMyProducts(filtered);
            setProductsLoading(false);
          })
          .catch(() => {
            setMyProducts([]);
            setProductsLoading(false);
          });

        // 🛒 購入した商品もバックエンドから取得
        fetch(`${API_BASE_URL}/api/products/purchased?buyer_id=${user.uid}`)
          .then((res) => (res.ok ? res.json() : []))
          .then((data) => {
            setPurchasedProducts(data || []);
            setPurchasedLoading(false);
          })
          .catch(() => {
            setPurchasedProducts([]);
            setPurchasedLoading(false);
          });

        // ❤️ お気に入り商品もバックエンドから取得
        fetch(`${API_BASE_URL}/api/favorites?user_id=${user.uid}`)
          .then((res) => (res.ok ? res.json() : []))
          .then((data) => {
            setFavoriteProducts(data || []);
            setFavoritesLoading(false);
          })
          .catch(() => {
            setFavoriteProducts([]);
            setFavoritesLoading(false);
          });

        // ⭐ 自分が受け取ったレビューもバックエンドから取得
        fetch(`${API_BASE_URL}/api/reviews?user_id=${user.uid}`)
          .then((res) => (res.ok ? res.json() : []))
          .then((data) => {
            setReceivedReviews(data || []);
            setReviewsLoading(false);
          })
          .catch(() => {
            setReceivedReviews([]);
            setReviewsLoading(false);
          });

      } else {
        console.log("宇宙通信途絶：ログインユーザーがいません");
        setProductsLoading(false);
        setPurchasedLoading(false);
        setFavoritesLoading(false);
        setReviewsLoading(false);
      }
      setFetching(false);
    });

    return () => unsubscribe();
  }, []);

  // ⭐ レビュー投稿処理（購入した商品カードの「レビューを書く」から呼ばれる）
  const handleSubmitReview = async (rating: number, comment: string) => {
    const buyer = fireAuth.currentUser;
    if (!buyer || !reviewTarget) return;

    const response = await fetch(`${API_BASE_URL}/api/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transaction_id: reviewTarget.transaction_id,
        reviewer_id: buyer.uid,
        reviewee_id: reviewTarget.seller_id,
        rating,
        comment,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      alert(errData.error || 'レビューの送信に失敗しました');
      return;
    }

    // 🔭 該当の取引を「レビュー投稿済み」にローカル更新
    setPurchasedProducts((prev) =>
      prev.map((p) =>
        p.transaction_id === reviewTarget.transaction_id ? { ...p, already_reviewed: true } : p
      )
    );
    setReviewTarget(null);
  };

  // 💾 プロフィール保存処理
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = fireAuth.currentUser;
      if (!user) throw new Error("ユーザーが検知できません");

      await updateProfile(user, {
        displayName: editForm.username,
      });

      localStorage.setItem(`space_base_${user.uid}`, editForm.spaceBase);
      localStorage.setItem(`space_bio_${user.uid}`, editForm.bio);
      
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
      loading && setLoading(false);
    }
  };

  const sidebar = (
    <MyPageSidebar
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onOpenMessages={() => navigate('/dm')}
    />
  );

  if (fetching) {
    return (
      <AppLayout sidebar={sidebar}>
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-cyan-400 font-mono gap-3">
          <Loader2 className="animate-spin text-cyan-400" size={32} />
          <p className="text-xs tracking-widest uppercase">QUANTUM DATA LINKING...</p>
        </div>
      </AppLayout>
    );
  }

  const currentUsername = userData.username.trim() || '名無しの宇宙飛行士';

  return (
    <AppLayout sidebar={sidebar}>
      <div className="max-w-6xl mx-auto space-y-8 relative">
        
        {/* 👤 プロフィールヘッダー（でかでか宇宙背景仕様） */}
        <section 
          className="relative rounded-3xl overflow-hidden border border-cyan-500/40 px-8 py-12 bg-cover bg-center bg-slate-950/45 bg-blend-overlay shadow-[0_0_30px_rgba(6,182,212,0.2)] transition-all"
          style={{ backgroundImage: "url('/utyuusen2.png')" }}
        >
          {/* 背景の宇宙をくっきり見せつつ、文字の視認性をしっかり守るグラデーションマスク */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/50 via-transparent to-slate-950/50 pointer-events-none z-0" />
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent z-10"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center md:items-start gap-6 w-full">
            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
              {/* アバター部分（背景から浮き出させるため背後を少し暗く補正） */}
              <div className="w-24 h-24 rounded-full border-2 border-cyan-500/50 p-1 relative shrink-0 bg-slate-950/60 backdrop-blur-sm shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                {userData.photoURL ? (
                  <img src={userData.photoURL} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-cyan-400">
                    <User size={36} />
                  </div>
                )}
                <div className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 rounded-full border-4 border-slate-950" />
              </div>

              {/* ユーザー基本情報（文字影を追加して視認性爆上げ） */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  <h1 className={`text-2xl font-black font-mono tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] ${!userData.username ? 'text-slate-500 italic' : 'text-white'}`}>
                    {currentUsername}
                  </h1>
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/40 font-mono font-bold shadow-[0_0_8px_rgba(6,182,212,0.4)]">
                    {!userData.username ? '未同期ユーザー' : '宇宙S級バイヤー'}
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-slate-200 font-mono drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] font-medium">
                  <p className="flex items-center gap-1.5">
                    <Calendar size={12} className="text-cyan-400" />
                    登録: {userData.createdAt}
                  </p>
                  {userData.spaceBase && (
                    <p className="flex items-center gap-1.5">
                      <Globe size={12} className="text-cyan-400" />
                      拠点: {userData.spaceBase}
                    </p>
                  )}
                </div>

                <p className="text-[11px] text-slate-100 max-w-xl font-mono leading-relaxed drop-shadow-[0_1px_5px_rgba(0,0,0,0.9)] bg-slate-950/40 p-3 rounded-lg border border-slate-800/40">
                  {userData.bio || '自己紹介プロトコルが未設定です。'}
                </p>

                <button 
                  onClick={() => {
                    setEditForm({ username: userData.username, spaceBase: userData.spaceBase, bio: userData.bio });
                    setIsEditing(true);
                  }}
                  className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-cyan-300 border border-cyan-500/50 bg-slate-950/60 backdrop-blur-sm px-3 py-1.5 rounded hover:bg-cyan-500/20 hover:text-cyan-200 shadow-md transition-all mt-3"
                >
                  <Edit3 size={12} />
                  プロフィールを同期・編集
                </button>
              </div>
            </div>

            {/* カウンター表示（右側パネルも背景に負けないよう微調整） */}
            <div className="flex gap-8 justify-center w-full md:w-auto text-center border-t border-slate-800/50 md:border-t-0 pt-4 md:pt-0 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
              <StatItem label="出品数" value={myProducts.length.toString()} />
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
                <button
                  onClick={() => setActiveTab('listings')}
                  className={`pb-3 transition-colors ${activeTab === 'listings' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  出品した商品
                </button>
                <button
                  onClick={() => setActiveTab('purchased')}
                  className={`pb-3 transition-colors ${activeTab === 'purchased' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  購入した商品
                </button>
                <button
                  onClick={() => setActiveTab('favorites')}
                  className={`pb-3 transition-colors ${activeTab === 'favorites' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  お気に入り
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`pb-3 transition-colors ${activeTab === 'reviews' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  レビュー
                </button>
              </div>

              <button 
                onClick={() => navigate('/sell')} 
                className={`flex items-center gap-2 text-[10px] px-4 py-1.5 rounded font-mono ${PRIMARY_BUTTON_CLASS}`}
              >
                <Plus size={14} />
                新しく出品する
              </button>
            </div>

            {activeTab === 'reviews' ? (
              renderReviewsSection(receivedReviews, reviewsLoading)
            ) : (
              renderProductSection(
                activeTab,
                { myProducts, productsLoading, purchasedProducts, purchasedLoading, favoriteProducts, favoritesLoading },
                setReviewTarget
              )
            )}
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
                    <div className="flex-grow space-y-0.5">
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

        {/* ⭐ レビュー投稿モーダル */}
        {reviewTarget && (
          <ReviewModal
            isOpen={!!reviewTarget}
            productTitle={reviewTarget.title}
            onClose={() => setReviewTarget(null)}
            onSubmit={handleSubmitReview}
          />
        )}

      </div>
    </AppLayout>
  );
};

// --- サブコンポーネント ---

const renderProductSection = (
  activeTab: MyPageTab,
  data: {
    myProducts: any[];
    productsLoading: boolean;
    purchasedProducts: any[];
    purchasedLoading: boolean;
    favoriteProducts: any[];
    favoritesLoading: boolean;
  },
  onReviewClick: (product: any) => void
) => {
  if (activeTab !== 'listings' && activeTab !== 'dashboard' && activeTab !== 'purchased' && activeTab !== 'favorites') {
    return (
      <div className="text-center font-mono text-gray-500 py-12 border border-dashed border-slate-800 rounded-xl">
        この機能は現在準備中です。
      </div>
    );
  }

  const isPurchasedView = activeTab === 'purchased';
  const isFavoritesView = activeTab === 'favorites';
  const list = isPurchasedView ? data.purchasedProducts : isFavoritesView ? data.favoriteProducts : data.myProducts;
  const isLoading = isPurchasedView ? data.purchasedLoading : isFavoritesView ? data.favoritesLoading : data.productsLoading;

  if (isLoading) {
    return (
      <div className="text-center font-mono text-cyan-600 py-12 animate-pulse">
        SCANNING CARGO BAY...
      </div>
    );
  }
  if (list.length === 0) {
    const emptyText = isPurchasedView
      ? 'まだ購入した宇宙物資はありません。'
      : isFavoritesView
      ? 'お気に入り登録した宇宙物資はまだありません。'
      : 'あなたが出品した宇宙物資は現在ありません。';
    return (
      <div className="text-center font-mono text-gray-500 py-12 border border-dashed border-slate-800 rounded-xl">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {list.map((product: any) => (
        <div
          key={isPurchasedView ? product.transaction_id : product.id}
          className="bg-[#0b1224]/10 border border-slate-800 rounded-xl overflow-hidden group hover:border-cyan-500/30 transition-all duration-300 shadow-md"
        >
          <div className="aspect-video relative bg-slate-900 flex items-center justify-center border-b border-slate-800">
            {product.image_url_1 ? (
              <img
                src={product.image_url_1}
                alt={product.title}
                className="w-full h-full object-cover group-hover:opacity-90 transition-opacity duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <ShoppingBag size={24} className="text-cyan-500/40 group-hover:text-cyan-400 transition-colors" />
            )}
            <span className={`absolute top-2 left-2 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${
              product.status === 'available' ? 'bg-cyan-500 text-slate-950' : 'bg-red-950 text-red-400 border border-red-900/40'
            }`}>
              {product.status === 'available' ? 'ON SALE' : 'SOLD OUT'}
            </span>
          </div>
          <div className="p-3 space-y-2 font-mono">
            <h4 className="text-[11px] font-bold text-slate-200 line-clamp-1 group-hover:text-cyan-400 transition-colors">
              {product.title}
            </h4>
            <p className="text-[13px] font-bold text-cyan-400">
              {product.price.toLocaleString()} 円
            </p>
            <div className="flex justify-between items-center text-[9px] text-slate-500">
              {isPurchasedView ? (
                <>
                  <span>購入日: {new Date(product.purchased_at).toLocaleDateString('ja-JP')}</span>
                  {product.already_reviewed ? (
                    <span className="text-emerald-400">レビュー投稿済み</span>
                  ) : (
                    <button
                      onClick={() => onReviewClick(product)}
                      className="text-amber-400 hover:text-amber-300 transition-colors font-bold"
                    >
                      レビューを書く
                    </button>
                  )}
                </>
              ) : isFavoritesView ? (
                <span>{product.category}</span>
              ) : (
                <>
                  <span>宇宙暦: 2026/06</span>
                  <div className="flex gap-2.5">
                    <button className="hover:text-cyan-400 transition-colors">再出品</button>
                    <button className="hover:text-cyan-400 transition-colors">編集</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const renderReviewsSection = (reviews: any[], isLoading: boolean) => {
  if (isLoading) {
    return (
      <div className="text-center font-mono text-cyan-600 py-12 animate-pulse">
        SCANNING CARGO BAY...
      </div>
    );
  }
  if (reviews.length === 0) {
    return (
      <div className="text-center font-mono text-gray-500 py-12 border border-dashed border-slate-800 rounded-xl">
        まだ受け取ったレビューはありません。
      </div>
    );
  }

  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 font-mono text-sm">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={16}
              className="text-amber-400"
              fill={star <= Math.round(average) ? 'currentColor' : 'none'}
            />
          ))}
        </div>
        <span className="text-slate-200 font-bold">{average.toFixed(2)}</span>
        <span className="text-slate-500 text-xs">({reviews.length}件のレビュー)</span>
      </div>

      <div className="space-y-3">
        {reviews.map((review) => (
          <div key={review.id} className="bg-[#0b1224]/10 border border-slate-800 rounded-xl p-4 font-mono">
            <div className="flex items-center justify-between mb-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={12}
                    className="text-amber-400"
                    fill={star <= review.rating ? 'currentColor' : 'none'}
                  />
                ))}
              </div>
              <span className="text-[9px] text-slate-500">
                {new Date(review.created_at).toLocaleDateString('ja-JP')}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {review.comment || '（コメントなし）'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

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

const STATS = [
  { label: '総資産額', value: '145,200 円', change: '+12.4%', subLabel: '今月の上昇率' },
  { label: 'マイシグナル', value: '99.4%', change: 'EXCELLENT', subLabel: '応答速度レート' },
  { label: '獲得評価', value: '4.95 / 5.0', change: '計184件', subLabel: '高評価バイヤー' },
  { label: '未読データ', value: '02 ch', change: 'ACTIVE', subLabel: 'メッセージ受信' },
];

const RECENT_TRANSACTIONS = [
  { id: 1, title: '反物質燃料カプセル (高純度)', user: 'US-9021', price: '12,000 円', img: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=80' },
  { id: 2, title: '未解読の量子メモリドライブ', user: 'JP-3341', price: '45,000 円', img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=80' },
  { id: 3, title: 'ワームホール安定化エフェクター', user: 'EU-7720', price: '88,000 円', img: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=80' },
];