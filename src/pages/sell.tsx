import React, { useState } from 'react';

// 🌌 ステップの定義
const STEPS = [
  { id: 1, name: '基本情報' },
  { id: 2, name: '詳細情報' },
  { id: 3, name: '価格設定' },
  { id: 4, name: '確認・出品' },
];

// 🛸 宇宙のランダム画像プール（クリックするたびにここからランダムでセットされる）
const SPACE_IMAGES = [
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600", // 地球・サイバー
  "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=600", // 星雲・パープル
  "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=600", // 衛星・宇宙飛行
  "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=600", // ブルー惑星
  "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=600"  // 銀河・星雲
];

export const SellPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // フォームの状態管理（Goのバックエンドのキー名に統一）
  const [formData, setFormData] = useState({
    title: '',
    category: '惑星・星', // Go側のテストデータに統一
    description: '',
    price: '',
    image_url_1: '', // ここにダミー画像のURLを入れる
  });

  // 🛠️ 宇宙ハック：画像アップロードボタンを押したらランダムに星の画像がセットされる
  const handleSimulateUpload = () => {
    const randomIndex = Math.floor(Math.random() * SPACE_IMAGES.length);
    const selectedImage = SPACE_IMAGES[randomIndex];
    setFormData({ ...formData, image_url_1: selectedImage });
  };

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep((prev) => prev + 1);
  };
  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  // 🚀 Goのバックエンドへ実際に出品データを送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // バックエンドが期待するデータ構造に整形
    const payload = {
      title: formData.title,
      description: formData.description,
      price: parseInt(formData.price, 10) || 0, // 文字列から数値（int）に変換
      category: formData.category,
      image_url_1: formData.image_url_1,
      seller_id: 'mock_uid_naoya', // 先ほど成功したNaoyaのモックIDをセット！
    };

    try {
      const response = await fetch('http://localhost:8080/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('通信エラーが発生しました');
      }

      const data = await response.json();
      console.log('Backend Response:', data);
      
      alert(`🛰️ 宇宙中心バンクに登録されました！\n商品ID: ${data.id} 「${data.title}」`);
      
      // フォームをリセットしてステップ1に戻る
      setFormData({ title: '', category: '惑星・星', description: '', price: '', image_url_1: '' });
      setCurrentStep(1);

    } catch (error) {
      console.error(error);
      alert('❌ 出品シグナルの送信に失敗しました。Goのサーバーが起動しているか、CORS設定を確認してください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 font-mono p-6 flex flex-col justify-between">
      
      {/* 🛸 メインコンテンツエリア */}
      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 my-auto">
        
        {/* 📋 左側：出品の流れ */}
        <div className="md:col-span-1 space-y-4 border-r border-cyan-500/10 pr-6">
          <h2 className="text-sm font-bold text-cyan-400 tracking-widest mb-6 uppercase">📦 出品の流れ</h2>
          <div className="space-y-6">
            {STEPS.map((step) => (
              <div key={step.id} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border transition-all ${
                  currentStep === step.id
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.4)]'
                    : currentStep > step.id
                    ? 'bg-slate-800 border-slate-700 text-slate-400 line-through'
                    : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}>
                  {step.id}
                </div>
                <span className={`text-xs tracking-wider transition-colors ${
                  currentStep === step.id ? 'text-cyan-300 font-bold' : 'text-slate-500'
                }`}>
                  {step.name}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-12 p-4 bg-slate-950/40 border border-slate-800 rounded text-[11px] text-slate-400 leading-relaxed">
            <span className="text-cyan-400 font-bold block mb-1">💡 ヒント</span>
            魅力的な商品画像や詳細なパラメータを記述すると、銀河系全域のバイヤーから注目されやすくなります。
          </div>
        </div>

        {/* 🖋️ 右側：動的フォームエリア */}
        <div className="md:col-span-3 bg-slate-950/40 border border-slate-800/80 rounded-xl p-8 shadow-2xl backdrop-blur-sm min-h-[450px] flex flex-col justify-between">
          <form onSubmit={handleSubmit} className="space-y-6 flex-grow">
            
            {/* 1️⃣ STEP 1: 基本情報 */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-200 border-b border-slate-800 pb-2 mb-4">基本情報</h3>
                  <label className="text-xs text-slate-400 block mb-2 font-bold uppercase tracking-wider">天体スキャン画像 (最大1枚)</label>
                  
                  <div className="grid grid-cols-5 gap-3">
                    {/* 画像アップロード・シミュレーター */}
                    <div 
                      onClick={handleSimulateUpload}
                      className="aspect-square border border-dashed border-slate-800 hover:border-cyan-500/50 bg-slate-900/50 rounded flex flex-col items-center justify-center cursor-pointer group transition-all text-slate-500 hover:text-cyan-400 relative overflow-hidden"
                    >
                      {formData.image_url_1 ? (
                        <img src={formData.image_url_1} alt="Preview" className="w-full h-full object-cover animate-fadeIn" />
                      ) : (
                        <>
                          <span className="text-xl group-hover:scale-110 transition-transform">+</span>
                          <span className="text-[9px] mt-1 text-center scale-90 text-slate-600 group-hover:text-cyan-500">天体をスキャン</span>
                        </>
                      )}
                    </div>
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="aspect-square border border-dashed border-slate-900 bg-slate-950/20 rounded flex items-center justify-center text-slate-700 text-xs">
                        🔒
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2">※ハッカソン仕様：枠をクリックすると量子スキャナーが起動し、天体画像を自動生成します。</p>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-2 font-bold">天体名 / 商品名</label>
                  <input
                    type="text"
                    placeholder="例：青色超巨星「スピカ」"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-[#0c101f] border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-2 font-bold">カテゴリ</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-[#0c101f] border border-slate-800 rounded px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-cyan-500/50 transition-colors"
                  >
                    <option value="惑星·星">惑星・星</option>
                    <option value="惑星・衛星">惑星・衛星</option>
                    <option value="ブラックホール">ブラックホール</option>
                    <option value="銀河・星雲">銀河・星雲</option>
                  </select>
                </div>
              </div>
            )}

            {/* 2️⃣ STEP 2: 詳細情報 */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-200 border-b border-slate-800 pb-2 mb-4">詳細情報</h3>
                <div>
                  <label className="text-xs text-slate-400 block mb-2 font-bold">天体の詳細説明（状態、パラメータ、軌道情報など）</label>
                  <textarea
                    rows={6}
                    placeholder="天体の詳細な説明を記述してください..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-[#0c101f] border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 transition-colors resize-none"
                  />
                </div>
              </div>
            )}

            {/* 3️⃣ STEP 3: 価格設定 */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-200 border-b border-slate-800 pb-2 mb-4">価格設定</h3>
                <div>
                  <label className="text-xs text-slate-400 block mb-2 font-bold">販売価格 (µCr / マイクロクレジット)</label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full bg-[#0c101f] border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 transition-colors pr-12"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-bold">µCr</span>
                  </div>
                </div>
              </div>
            )}

            {/* 4️⃣ STEP 4: 確認・出品 */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-200 border-b border-slate-800 pb-2 mb-4">最終確認</h3>
                <div className="flex gap-4 bg-[#0c101f] p-4 border border-slate-900 rounded text-xs text-slate-300">
                  {formData.image_url_1 && (
                    <div className="w-24 h-24 rounded overflow-hidden border border-slate-800 flex-shrink-0">
                      <img src={formData.image_url_1} alt="Confirm" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="space-y-2 flex-grow">
                    <p><span className="text-slate-500">商品名:</span> {formData.title || '（未入力）'}</p>
                    <p><span className="text-slate-500">カテゴリ:</span> {formData.category}</p>
                    <p><span className="text-slate-500">説明文:</span> {formData.description || '（未入力）'}</p>
                    <p><span className="text-slate-500">価格:</span> {formData.price ? `${Number(formData.price).toLocaleString()} µCr` : '（未入力）'}</p>
                  </div>
                </div>
                <p className="text-[11px] text-amber-400/80 animate-pulse">⚠️ 宇宙条約に基づき、一度出品された天体は軌道変更が困難になります。内容を確認してください。</p>
              </div>
            )}

          </form>

          {/* 🔘 ナビゲーションボタン */}
          <div className="flex justify-between items-center border-t border-slate-900 pt-4 mt-6">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1 || isSubmitting}
              className={`px-4 py-1.5 border rounded text-xs transition-all ${
                currentStep === 1 || isSubmitting
                  ? 'border-slate-900 text-slate-700 cursor-not-allowed'
                  : 'border-slate-700 text-slate-400 hover:bg-slate-900'
              }`}
            >
              戻る
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-1.5 bg-cyan-950/60 border border-cyan-500 text-cyan-400 rounded text-xs font-bold tracking-wider hover:bg-cyan-900/60 hover:text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)] transition-all"
              >
                次へ
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-1.5 bg-purple-950/60 border border-purple-500 text-purple-400 rounded text-xs font-bold tracking-wider hover:bg-purple-900/60 hover:text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.2)] transition-all disabled:opacity-50"
              >
                {isSubmitting ? '通信中...📡' : '宇宙へ出品する🚀'}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};