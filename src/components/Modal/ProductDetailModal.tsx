import React, { useState } from "react";
// ※ authContextのパスはプロジェクトに合わせて調整してください
import { useAuth } from "../../context/AuthContext"; 

// Goの model.Product に合わせた型定義
interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  image_url_1: string;
  seller_id: string;
  status: string;
}

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onBuySuccess: () => void; // 購入成功時にチャットルームへ飛ばすためのコールバック
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onBuySuccess,
}) => {
  const { user } = useAuth(); // 宇宙市民の認証情報を取得
  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
    // 💡 TypeScriptのNullガード（userの存在チェック）
    if (!user?.uid) {
      alert("通信エラー: 取引を開始するにはログインが必要です。");
      return;
    }

    if (!window.confirm(`この商品（${product.title}）を本当に購入しますか？`)) {
      return;
    }

    setLoading(true);
    try {
      // GoのバックエンドAPIを叩く
      const response = await fetch(`http://localhost:8080/api/products/${product.id}/buy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-UID": user.uid, // 👈 ヘッダーで買い手のUIDを送信！
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "取引の同期に失敗しました");
      }

      alert("TRANSACTION COMPLETED: 取引が正常に成立しました！");
      onBuySuccess(); // 成功時の画面遷移などの処理へ
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // 💡 fixed inset-0 と bg-black/60 ＋ backdrop-blur-sm で背景を薄暗く・ボカします
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      
      {/* モダルの外側（背景）をクリックした時も閉じるようにするガード */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* モダル本体の宇宙船ウィンドウ */}
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-cyan-500/30 bg-[#0b1120] text-gray-100 shadow-2xl shadow-cyan-500/10">
        
        {/* 閉じる「✕」ボタン */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-cyan-400 text-xl font-bold transition"
        >
          ✕
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* 左側：商品画像 */}
          <div className="h-64 md:h-full min-h-[300px] relative bg-slate-900">
            <img
              src={product.image_url_1}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            {product.status === "sold" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 font-bold text-red-500 text-2xl tracking-widest">
                SOLD OUT
              </div>
            )}
          </div>

          {/* 右側：詳細スペック情報 */}
          <div className="p-6 flex flex-col justify-between">
            <div>
              <span className="inline-block px-2 py-0.5 mb-2 text-xs font-semibold rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                {product.category}
              </span>
              <h2 className="text-2xl font-bold tracking-wide text-white mb-2">{product.title}</h2>
              
              <div className="text-sm text-cyan-400 font-mono mb-4">
                μCr <span className="text-2xl font-bold text-white">{product.price.toLocaleString()}</span>
              </div>

              <div className="border-t border-gray-800 my-3" />
              <p className="text-sm text-gray-300 leading-relaxed overflow-y-auto max-h-40 whitespace-pre-wrap">
                {product.description || "この物資に関するデータ・説明文は登録されていません。"}
              </p>
            </div>

            {/* 下部：アクションボタンエリア */}
            <div className="mt-6">
              {product.status === "sold" ? (
                <button
                  disabled
                  className="w-full py-3 bg-gray-800 text-gray-500 rounded-lg cursor-not-allowed font-medium"
                >
                  この物資は売り切れました
                </button>
              ) : user?.uid === product.seller_id ? (
                <button
                  disabled
                  className="w-full py-3 bg-cyan-950/40 text-cyan-600 rounded-lg cursor-not-allowed text-sm font-mono border border-cyan-900"
                >
                  あなたが自身で出品した物資です
                </button>
              ) : (
                <button
                  onClick={handleBuy}
                  disabled={loading}
                  className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg tracking-widest transition shadow-lg shadow-cyan-500/20 active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? "取引同期中..." : "⚡ BUY NOW (購入を確定)"}
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};