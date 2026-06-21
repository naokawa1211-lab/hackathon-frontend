import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 💡 追加: 購入成功時にDMページへ飛ばすため
import { Rocket, Search, Heart, User, SatelliteDish } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { SearchSidebar } from '../components/sidebar/SearchSidebar';
import { ProductDetailModal } from '../components/Modal/ProductDetailModal'; // 💡 追加: 詳細モダル
import { API_BASE_URL } from '../config/api';
import { useAuth } from '../context/AuthContext';

export const SearchPage = () => {
  const navigate = useNavigate(); // 💡 追加
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  // 🛰️ 「本当に0件」と「通信失敗で0件になっただけ」を区別するためのフラグ
  const [fetchError, setFetchError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 💡 追加: 現在モダルで詳細を開いている商品を管理するState（nullのときは閉じている状態）
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  // ❤️ お気に入り登録済みの商品ID一覧
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());

  const [selectedCategory, setSelectedCategory] = useState('すべて');
  const [priceRange, setPriceRange] = useState(1000000000);
  const [sortOrder, setSortOrder] = useState('newest');

  const handleReset = () => {
    setSelectedCategory('すべて');
    setPriceRange(1000000000);
    setSortOrder('newest');
    setSearchQuery('');
  };

  // 🛰️ UIDごとの本名を一度だけ解決してキャッシュする（/api/users/:id を叩く）
  const resolveSellerName = async (id: string): Promise<string> => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${id}`);
      if (res.ok) {
        const userData = await res.json();
        return userData.username || `未知の生命体 (${id.slice(0, 5)})`;
      }
    } catch (err) {
      console.error(`UID: ${id} の名前解決に失敗しました:`, err);
    }
    return `未知の生命体 (${id.slice(0, 5)})`;
  };

  const fetchRealProducts = async () => {
    setProductsLoading(true);
    setFetchError(false);
    try {
      const response = await fetch(`${API_BASE_URL}/api/products`);
      if (!response.ok) throw new Error(`status ${response.status}`);

      const realData = await response.json();

      // 💡 出品者のUIDをユニーク化し、MySQLから本名を解決（ハードコードをやめる）
      const uniqueSellerIds: string[] = Array.from(new Set(realData.map((p: any) => p.seller_id)));
      const nameEntries = await Promise.all(
        uniqueSellerIds.map(async (id) => [id, await resolveSellerName(id)] as const)
      );
      const nameMap = Object.fromEntries(nameEntries);

      const formattedRealData = realData.map((p: any) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        price: p.price,
        category: p.category || '恒星・星',
        image_url_1: p.image_url_1 || 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=600',
        seller_id: p.seller_id, // 💡 修正: モダル側の自作自演ガードのために保持
        seller_name: nameMap[p.seller_id],
        rating: 5.0,
        status: p.status,
        isReal: true
      }));
      setProducts(formattedRealData);
    } catch (error) {
      console.log("Goサーバーへの通信に失敗しました:", error);
      setFetchError(true);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    fetchRealProducts();
  }, []);

  // ❤️ ログイン中ユーザーのお気に入り一覧を取得し、ハートの初期状態に反映
  useEffect(() => {
    if (!user) {
      setFavoriteIds(new Set());
      return;
    }
    fetch(`${API_BASE_URL}/api/favorites?user_id=${user.uid}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((favProducts) => {
        setFavoriteIds(new Set((favProducts || []).map((p: any) => p.id)));
      })
      .catch(() => setFavoriteIds(new Set()));
  }, [user]);

  // ❤️ お気に入りのトグル（追加/解除）
  const handleToggleFavorite = async (e: React.MouseEvent, productId: number) => {
    e.stopPropagation(); // カードのクリック（詳細モーダル表示）に伝播させない
    if (!user) {
      alert('お気に入り登録にはログインが必要です。');
      return;
    }

    // 🔭 楽観的更新：先にUIを切り替え、失敗したら戻す
    const wasFavorited = favoriteIds.has(productId);
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      wasFavorited ? next.delete(productId) : next.add(productId);
      return next;
    });

    try {
      const response = await fetch(`${API_BASE_URL}/api/favorites/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.uid, product_id: productId }),
      });
      if (!response.ok) throw new Error('お気に入りの更新に失敗しました');
    } catch (err) {
      console.error(err);
      // 失敗時は元に戻す
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        wasFavorited ? next.add(productId) : next.delete(productId);
        return next;
      });
    }
  };

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            product.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'すべて' || selectedCategory === 'all' || product.category === selectedCategory;
      const matchesPrice = product.price <= priceRange;

      return matchesSearch && matchesCategory && matchesPrice;
    })
    .sort((a, b) => {
      if (sortOrder === 'price_asc') return a.price - b.price;
      if (sortOrder === 'price_desc') return b.price - a.price;
      return 0; 
    });

  return (
    <AppLayout
      sidebar={
        <SearchSidebar
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          priceRange={priceRange}
          onPriceChange={setPriceRange}
          sortBy={sortOrder}
          onSortChange={setSortOrder}
          onReset={handleReset}
        />
      }
    >
      <div className="p-6 space-y-6 font-mono w-full max-w-7xl mx-auto">
        
        {/* 🔍 検索バー & 宇宙演出 */}
        <div 
          className="relative rounded-2xl overflow-hidden border border-cyan-500/40 px-6 py-20 md:py-28 bg-cover bg-center bg-slate-950/45 bg-blend-overlay shadow-[0_0_35px_rgba(6,182,212,0.2)] transition-all"
          style={{ backgroundImage: "url('/utyuusen.png')" }}
        >
          {/* 背景画像を引き立てつつ、文字の視認性を最低限守るための薄い上下グラデーション */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-slate-950/30 pointer-events-none z-0" />

          {/* コンテンツを中央寄せにして、より映画のタイトル風の配置に */}
          <div className="relative z-10 flex flex-col items-center text-center">
            <h1 className="text-2xl md:text-4xl font-black text-slate-100 mb-3 tracking-widest uppercase drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]">
              探す <span className="text-cyan-400 text-sm md:text-base block md:inline md:ml-2 font-mono">✦ MILKYWAY FLEA MARKET</span>
            </h1>
            <p className="text-xs md:text-sm text-cyan-100 mb-8 max-w-md drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] font-medium">
              宇宙のすべてが、あなたのマーケットに。
            </p>
            
            {/* 巨大化したエリアに合わせて、入力欄も max-w-3xl（少しワイド）に拡張 */}
            <div className="relative w-full max-w-3xl text-left">
              <input
                type="text"
                placeholder="キーワードで探す（例：スピカ、シリウス、ハビタブル...）"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#040714]/90 backdrop-blur-md border border-cyan-500/40 focus:border-cyan-400 rounded-xl pl-6 pr-12 py-4 text-base text-slate-200 focus:outline-none transition-all shadow-[0_0_20px_rgba(6,182,212,0.1)] focus:shadow-[0_0_25px_rgba(6,182,212,0.3)] placeholder-slate-600"
              />
              <Search size={20} className="absolute right-4 top-4 text-cyan-500/70" />
            </div>
          </div>
        </div>

        {/* 📊 検索結果ステータス */}
        <div className="flex justify-between items-center text-xs text-slate-400 px-1">
          <div>検索結果 : <span className="text-cyan-400 font-bold text-sm">{filteredProducts.length}</span> 件</div>
          <div className="text-[11px] text-slate-500">グリッド表示中 ⠿</div>
        </div>

        {/* ⚠️ 通信エラー時：0件と区別して再読み込みを促す */}
        {fetchError && (
          <div className="flex flex-col items-center gap-3 text-center py-12 border border-dashed border-amber-800/50 rounded-xl text-amber-500 text-xs">
            <p>⚠️ 通信エラー：商品データを取得できませんでした。</p>
            <button
              onClick={fetchRealProducts}
              className="text-xs px-4 py-1.5 rounded border border-amber-500/50 hover:bg-amber-500/10 transition-colors"
            >
              再読み込み
            </button>
          </div>
        )}

        {/* 📦 商品カードグリッド */}
        {!fetchError && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const isSoldOut = product.status === 'sold' || product.status === 'sold_out';
            return ( // 💡 修正点2: 明示的に return ( ) で囲む！
              <div 
                key={product.id} 
                onClick={() => setSelectedProduct(product)}
                className="group bg-[#060917]/80 border border-purple-500/40 hover:border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.15)] rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              >
                {/* 商品画像エリア */}
                <div className="aspect-[4/3] bg-slate-950 relative overflow-hidden">
                  <img 
                    src={product.image_url_1} 
                    alt={product.title} 
                    className={`w-full h-full object-cover transition-transform duration-500 opacity-90 group-hover:opacity-100 ${
                      isSoldOut ? 'scale-100' : 'group-hover:scale-105'
                    }`} 
                  />

                  {/* SOLD OUT の場合の黒ブラー ＆ ネオン赤文字スタンプ */}
                  {isSoldOut && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-[3px] flex items-center justify-center z-10">
                      <div className="text-center border-2 border-rose-500 text-rose-500 font-mono font-extrabold text-xl tracking-widest px-4 py-1.5 rotate-[-12deg] uppercase shadow-[0_0_15px_rgba(244,63,94,0.4)] bg-rose-950/20 rounded">
                        SOLD OUT
                      </div>
                    </div>
                  )}

                  {/* REAL TIMELINE バッジ */}
                  <span className={`absolute top-3 left-3 text-[9px] font-bold tracking-widest px-2 py-0.5 rounded shadow bg-purple-500 text-white z-20 ${
                    isSoldOut ? 'opacity-40' : 'animate-pulse'
                  }`}>
                    REAL TIMELINE
                  </span>
                  
                  {/* お気に入りボタン */}
                  {!isSoldOut && (
                    <button
                      onClick={(e) => handleToggleFavorite(e, product.id)}
                      className={`absolute top-3 right-3 w-7 h-7 rounded-full bg-slate-950/60 border flex items-center justify-center transition-colors z-20 ${
                        favoriteIds.has(product.id)
                          ? 'border-rose-500/60 text-rose-400'
                          : 'border-slate-800/50 text-slate-400 hover:text-rose-400 hover:bg-slate-950'
                      }`}
                    >
                      <Heart size={13} fill={favoriteIds.has(product.id) ? 'currentColor' : 'none'} />
                    </button>
                  )}
                </div>

                {/* カード詳細 */}
                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-500/20 px-2 py-0.5 rounded">
                      {product.category}
                    </span>
                    <span className="text-[10px] text-amber-400 font-bold">★ {product.rating.toFixed(1)}</span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-1">
                      {product.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 h-8 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-900 flex justify-between items-center">
                    <div className="text-sm font-bold text-slate-200">
                      {product.price.toLocaleString()}
                      <span className="text-[10px] text-slate-500 ml-1">円</span>
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center">
                        <User size={8} />
                      </div>
                      <span className="truncate max-w-[70px]">{product.seller_name}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        )}

        {/* 📭 該当なしの場合（読み込み中・通信エラー時は表示しない） */}
        {!fetchError && !productsLoading && filteredProducts.length === 0 && (
          <div className="flex flex-col items-center gap-2 text-center py-12 border border-dashed border-slate-900 rounded-xl text-slate-500 text-xs">
            <SatelliteDish size={20} />
            指定された座標に天体シグナルは見つかりませんでした。
          </div>
        )}

      </div>

      {/* ========================================================
          💡 追加: ステートにデータがある時だけ、最前面にモダル
         ======================================================== */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)} // 閉じる処理
          onBuySuccess={() => {
            const sellerId = selectedProduct.seller_id;
            const sellerName = selectedProduct.seller_name;
            setSelectedProduct(null); // モダルを閉じる
            navigate(`/dm/${sellerId}`, { state: { sellerName } }); // 取引相手とのDMに移動
          }}
        />
      )}
    </AppLayout>
  );
};