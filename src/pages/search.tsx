import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 💡 追加: 購入成功時にDMページへ飛ばすため
import { Rocket, Search, Heart, User, SatelliteDish } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { SearchSidebar } from '../components/sidebar/SearchSidebar';
import { ProductDetailModal } from '../components/Modal/ProductDetailModal'; // 💡 追加: 詳細モダル

export const SearchPage = () => {
  const navigate = useNavigate(); // 💡 追加
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // 💡 追加: 現在モダルで詳細を開いている商品を管理するState（nullのときは閉じている状態）
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  
  const [selectedCategory, setSelectedCategory] = useState('すべて');
  const [priceRange, setPriceRange] = useState(1000000000); 
  const [sortOrder, setSortOrder] = useState('newest');

  const handleReset = () => {
    setSelectedCategory('すべて');
    setPriceRange(1000000000);
    setSortOrder('newest');
    setSearchQuery('');
  };

  useEffect(() => {
    const fetchRealProducts = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/products');
        if (response.ok) {
          const realData = await response.json();
          const formattedRealData = realData.map((p: any) => ({
            id: p.id,
            title: p.title,
            description: p.description,
            price: p.price,
            category: p.category || '恒星・星',
            image_url_1: p.image_url_1 || 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=600',
            seller_id: p.seller_id, // 💡 修正: モダル側の自作自演ガードのために保持
            seller_name: p.seller_id === 'mock_uid_naoya' ? 'Naoya' : '未知の生命体',
            rating: 5.0,
            status: p.status,
            isReal: true
          }));
          setProducts(formattedRealData);
        }
      } catch (error) {
        console.log("Goサーバーがオフラインのため、モックデータのみで巡航します。");
      }
    };
    fetchRealProducts();
  }, []);

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
        <div className="relative rounded-2xl overflow-hidden border border-slate-800/50 p-6 bg-gradient-to-r from-[#070b1e] to-[#0d1536]">
          <Rocket className="absolute right-10 top-4 w-10 h-10 opacity-10 animate-pulse" />
          <h1 className="text-xl font-bold text-slate-100 mb-1 tracking-wide flex items-center gap-2">
            探す <span className="text-cyan-400 text-xs">✦ MILKYWAY FLEA MARKET</span>
          </h1>
          <p className="text-xs text-slate-400 mb-4">宇宙のすべてが、あなたのマーケットに。</p>
          
          <div className="relative">
            <input
              type="text"
              placeholder="キーワードで探す（例：スピカ、シリウス、ハビタブル...）"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#040714] border border-cyan-500/20 focus:border-cyan-400/60 rounded-xl pl-4 pr-12 py-3 text-sm text-slate-200 focus:outline-none transition-all shadow-inner placeholder-slate-600"
            />
            <Search size={16} className="absolute right-4 top-3.5 text-slate-500" />
          </div>
        </div>

        {/* 📊 検索結果ステータス */}
        <div className="flex justify-between items-center text-xs text-slate-400 px-1">
          <div>検索結果 : <span className="text-cyan-400 font-bold text-sm">{filteredProducts.length}</span> 件</div>
          <div className="text-[11px] text-slate-500">グリッド表示中 ⠿</div>
        </div>

        {/* 📦 商品カードグリッド */}
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
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-3 right-3 w-7 h-7 rounded-full bg-slate-950/60 border border-slate-800/50 flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-slate-950 transition-colors z-20"
                    >
                      <Heart size={13} />
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
                      <span className="text-[10px] text-slate-500 mr-1">円</span>
                      {product.price.toLocaleString()}
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

        {/* 📭 該当なしの場合 */}
        {filteredProducts.length === 0 && (
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