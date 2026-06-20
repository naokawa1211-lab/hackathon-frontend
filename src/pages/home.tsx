import React, { useState, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { HomeSidebar } from '../components/sidebar/HomeSidebar';
import { ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';

// 🖼️ 画像読み込みに失敗したら確実にShoppingBagアイコンへフォールバックするサムネイル
// （onErrorでimgを非表示にするだけだとアイコンが再描画されず枠が真っ黒になるため、
//   失敗をstateで管理してアイコン側に切り替える）
const ProductThumbnail: React.FC<{ product: any }> = ({ product }) => {
  const [imgError, setImgError] = useState(false);
  const showImage = !!product.image_url_1 && !imgError;

  return (
    <div className="relative aspect-video w-full bg-slate-900 rounded-lg mb-3 overflow-hidden flex items-center justify-center border border-slate-800">
      {showImage ? (
        <img
          src={product.image_url_1}
          alt={product.title}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <ShoppingBag size={32} className="text-slate-700 group-hover:text-cyan-500 transition-colors" />
      )}
      {product.status === 'sold' && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
          <span className="text-red-500 font-mono font-bold tracking-widest text-lg border-2 border-red-500 px-3 py-1 rotate-[-12deg]">
            SOLD OUT
          </span>
        </div>
      )}
    </div>
  );
};

// 📦 商品カード（セクション共通で使い回す）
const ProductCard: React.FC<{ product: any; onClick: () => void }> = ({ product, onClick }) => (
  <div
    onClick={onClick}
    className="bg-[#0b1120] border border-cyan-950 hover:border-cyan-500/50 rounded-xl p-4 cursor-pointer transition-all duration-300 group hover:-translate-y-1 shadow-lg shadow-cyan-950/20"
  >
    <ProductThumbnail product={product} />
    <div className="space-y-1">
      <h3 className="font-bold text-gray-200 truncate group-hover:text-cyan-400 transition-colors">
        {product.title}
      </h3>
      <div className="flex justify-between items-center pt-2 font-mono">
        <span className="text-cyan-400 font-semibold">
          {product.price.toLocaleString()} 円
        </span>
        <span className={`text-xs px-2 py-0.5 rounded ${
          product.status === 'sold' ? 'bg-red-950/50 text-red-400' : 'bg-green-950/50 text-green-400'
        }`}>
          {product.status === 'sold' ? 'SOLD' : 'AVAILABLE'}
        </span>
      </div>
    </div>
  </div>
);

export const HomePage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    //バックエンドから本物の商品一覧を取得
    fetch(`${API_BASE_URL}/api/products`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setProducts(data || []);
        setLoading(false);
      })
      .catch(() => {
        setProducts([]);
        setLoading(false);
      });
  }, []);

  // 💡 サイドバーの検索・カテゴリーフィルターを実際に反映
  const isFiltering = searchQuery !== '' || selectedCategory !== 'all';
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // 🛰️ フィルタなし時の2部構成
  // ①最新の流通物資（AVAILABLE）：売り切れていない商品を新着順（配列の逆順）に3件
  const latestAvailable = products.filter((p) => p.status !== 'sold').reverse().slice(0, 3);
  const latestIds = new Set(latestAvailable.map((p) => p.id));
  // ②おすすめのディープスペースジャンク：①に選ばれなかった残り（SOLD OUT含む）から3件
  const recommendedJunk = products.filter((p) => !latestIds.has(p.id)).slice(0, 3);

  const goToSearch = () => navigate('/search');

  return (
    // 2. AppLayout で包み、sidebar に HomeSidebar を注入する
    <AppLayout
      sidebar={
        <HomeSidebar
          products={products}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      }
    >
      <div className="w-full text-slate-100 font-mono p-2 space-y-10">
        {loading ? (
          <div className="text-center font-mono text-cyan-600 animate-pulse py-12">
            商品を読み込み中...
          </div>
        ) : products.length === 0 ? (
          <div className="text-center font-mono text-gray-500 py-12 border border-dashed border-gray-800 rounded-xl">
            商品はまだ出品されていません。
          </div>
        ) : isFiltering ? (
          // 🔍 フィルタ中：セクション分けせず、絞り込み結果を1グリッドで全件表示
          filteredProducts.length === 0 ? (
            <div className="text-center font-mono text-gray-500 py-12 border border-dashed border-gray-800 rounded-xl">
              該当する物資は見つかりませんでした。
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} onClick={goToSearch} />
              ))}
            </div>
          )
        ) : (
          // 🌌 フィルタなし：2部構成セクション表示
          <>
            <section>
              <h2 className="text-sm mb-4 text-cyan-400 flex items-center gap-2 font-bold tracking-widest uppercase">
                <span className="inline-block w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
                最新の流通物資（AVAILABLE）
              </h2>
              {latestAvailable.length === 0 ? (
                <p className="text-xs text-slate-500 font-mono">現在、流通中の物資はありません。</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {latestAvailable.map((product) => (
                    <ProductCard key={product.id} product={product} onClick={goToSearch} />
                  ))}
                </div>
              )}
            </section>

            {recommendedJunk.length > 0 && (
              <section>
                <h2 className="text-sm mb-4 text-purple-400 flex items-center gap-2 font-bold tracking-widest uppercase">
                  <span className="inline-block w-2 h-2 bg-purple-500 rounded-full animate-ping" />
                  おすすめのディープスペースジャンク
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {recommendedJunk.map((product) => (
                    <ProductCard key={product.id} product={product} onClick={goToSearch} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
};
