import React, { useState, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { SearchSidebar } from '../components/sidebar/SearchSidebar';

const MOCK_PRODUCTS = [
  { id: 'm1', title: 'シリウス', description: 'おおいぬ座の最も明るい恒星', price: 120000000, category: '恒星・星', image_url_1: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=600', seller_name: 'StarTrader_7', rating: 4.9, status: 'available' },
  { id: 'm2', title: 'ベテルギウス', description: 'オリオン座の赤色超巨星', price: 95000000, category: '恒星・星', image_url_1: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=600', seller_name: 'RedGiant_Lover', rating: 4.8, status: 'available' },
  { id: 'm3', title: 'ケプラー-22b', description: 'ハビタブルゾーンの系外惑星', price: 530000000, category: '惑星・衛星', image_url_1: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=600', seller_name: 'ExoPlanet_Hunter', rating: 5.0, status: 'available' },
  { id: 'm4', title: 'オリオン大星雲', description: 'M42・美しい散光星雲', price: 28000000, category: '銀河・星雲', image_url_1: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600', seller_name: 'Nebula_Traveler', rating: 4.7, status: 'available' },
  { id: 'm5', title: '土星', description: '美しい環を持つガス惑星', price: 75000000, category: '惑星・衛星', image_url_1: 'https://images.unsplash.com/photo-1614313913007-2b4ae8ce32d6?q=80&w=600', seller_name: 'Ring_Collector', rating: 4.6, status: 'available' },
  { id: 'm6', title: 'いて座A*', description: '銀河中心の超巨大質量ブラックホール', price: 999000000, category: 'ブラックホール', image_url_1: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=600', seller_name: 'DarkMatter_Inc', rating: 5.0, status: 'available' },
];

export const SearchPage = () => {
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  
  // 💡 サイドバーと連動させるためのState群
  const [selectedCategory, setSelectedCategory] = useState('すべて');
  const [priceRange, setPriceRange] = useState(1000000000); // 初期値は最大値（10億μCr）
  const [sortOrder, setSortOrder] = useState('newest');

  // 💡 リセットボタンが押された時の処理
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
            seller_name: p.seller_id === 'mock_uid_naoya' ? 'Naoya' : '未知の生命体',
            rating: 5.0,
            status: p.status,
            isReal: true
          }));
          setProducts([...formattedRealData, ...MOCK_PRODUCTS]);
        }
      } catch (error) {
        console.log("Goサーバーがオフラインのため、モックデータのみで巡航します。");
      }
    };
    fetchRealProducts();
  }, []);

  // 💡 絞り込みと並び替えのロジック（価格帯も追加！）
  const filteredProducts = products
    .filter((product) => {
      const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            product.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // サイドバーの「すべて」は、SearchSidebar側でidを 'all' にしていれば 'all'、
      // 画面上の表記に合わせて 'すべて' に統一するなら以下のように判定します
      const matchesCategory = selectedCategory === 'すべて' || selectedCategory === 'all' || product.category === selectedCategory;
      
      // 価格が指定範囲内かどうかの判定
      const matchesPrice = product.price <= priceRange;

      return matchesSearch && matchesCategory && matchesPrice;
    })
    .sort((a, b) => {
      if (sortOrder === 'price_asc') return a.price - b.price;
      if (sortOrder === 'price_desc') return b.price - a.price;
      return 0; // 'newest' の場合は現状維持（あるいはID等でソート）
    });

  return (
    <AppLayout
      // 🛠️ 正しいPropsの渡し方: sidebar={ <コンポーネント /> } とする
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
      {/* 🌌 ここからメインコンテンツ (children) */}
      <div className="p-6 space-y-6 font-mono w-full max-w-7xl mx-auto">
        
        {/* 🔍 検索バー & 宇宙演出 */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-800/50 p-6 bg-gradient-to-r from-[#070b1e] to-[#0d1536]">
          <div className="absolute right-10 top-4 text-4xl opacity-10 animate-pulse">🚀</div>
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
            <span className="absolute right-4 top-3.5 text-slate-500">🔍</span>
          </div>
        </div>

        {/* 📊 検索結果ステータス */}
        <div className="flex justify-between items-center text-xs text-slate-400 px-1">
          <div>検索結果 : <span className="text-cyan-400 font-bold text-sm">{filteredProducts.length}</span> 件</div>
          <div className="text-[11px] text-slate-500">グリッド表示中 ⠿</div>
        </div>

        {/* 📦 商品カードグリッド */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div 
              key={product.id} 
              className={`group bg-[#060917]/80 border rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
                (product as any).isReal 
                  ? 'border-purple-500/40 hover:border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.15)]' 
                  : 'border-slate-900 hover:border-slate-700'
              }`}
            >
              {/* 商品画像 */}
              <div className="aspect-[4/3] bg-slate-950 relative overflow-hidden">
                <img 
                  src={product.image_url_1} 
                  alt={product.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100" 
                />
                <span className={`absolute top-3 left-3 text-[9px] font-bold tracking-widest px-2 py-0.5 rounded shadow ${
                  (product as any).isReal ? 'bg-purple-500 text-white animate-pulse' : 'bg-cyan-500 text-slate-950'
                }`}>
                  {(product as any).isReal ? 'REAL TIMELINE' : 'NEW'}
                </span>
                <button className="absolute top-3 right-3 w-7 h-7 rounded-full bg-slate-950/60 border border-slate-800/50 flex items-center justify-center text-xs text-slate-400 hover:text-rose-400 hover:bg-slate-950 transition-colors">
                  🤍
                </button>
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
                    <span className="text-[10px] text-slate-500 mr-1">µCr</span>
                    {product.price.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center text-[8px]">👤</div>
                    <span className="truncate max-w-[70px]">{product.seller_name}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 📭 該当なしの場合 */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12 border border-dashed border-slate-900 rounded-xl text-slate-500 text-xs">
            🛰️ 指定された座標に天体シグナルは見つかりませんでした。
          </div>
        )}

      </div>
    </AppLayout>
  );
};