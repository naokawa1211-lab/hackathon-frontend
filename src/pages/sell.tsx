import React, { useRef, useState } from 'react';
import { Plus, Lock, AlertTriangle, ChevronLeft, ChevronRight, Rocket, Sparkles, Loader2 } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { SellSidebar } from '../components/sidebar/SellSidebar';
import { PRIMARY_BUTTON_CLASS } from '../styles/buttonStyles';
import { useNavigate } from 'react-router-dom';
import { SuccessModal } from '../components/Modal/SuccessModal';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

export const SellPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '宇宙船・パーツ',
    description: '',
    price: '',
  });
  const [isGeneratingAI, setIsGeneratingAI] = useState(false); //AIが考えているという状態
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false); // 🛰️ 画像のマルチモーダル解析中フラグ

  // アップロード対象の画像ファイルとプレビュー用URL
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [successState, setSuccessState] = useState({ isOpen: false, message: '' });
  const navigate = useNavigate();

  // 🛰️ 画像をGeminiのマルチモーダルAPIに送り、写っているものをベースにタイトル・説明文を自動生成
  const analyzeImageWithAI = async (file: File) => {
    setIsAnalyzingImage(true);
    try {
      const body = new FormData();
      body.append('image', file);

      const response = await fetch(`${API_BASE_URL}/api/products/analyze-image`, {
        method: 'POST',
        body,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || '画像解析に失敗しました');
      }

      const data = await response.json();
      setFormData((prev) => ({
        ...prev,
        title: data.title || prev.title,
        description: data.description || prev.description,
      }));
    } catch (error) {
      console.error('画像のAI解析に失敗しました:', error);
      // 🔭 解析失敗時もユーザーは手入力で続行できるため、出品フローはブロックしない
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
    analyzeImageWithAI(file); // 💡 画像選択と同時にバックグラウンドでAI解析を開始
  };

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep((prev) => prev + 1);
  };
  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const handleGenerateSpaceDescription = async () => {
    if (!formData.title) {
      alert("先にタイトルを入力してください"); 
      return;
    }
    setIsGeneratingAI(true); // ぐるぐるアニメーション

    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/space-description`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_name: formData.title, description: formData.description }),
      });

      const data = await response.json();
      
      // フォームの description（説明文）を上書き
      setFormData((prev) => ({ ...prev, description: data.space_description }));

    } catch (error) {
      console.error(error);
      alert('Geminiによる商品説明の生成に失敗しました。');
    } finally {
      setIsGeneratingAI(false); //ぐるぐるアニメーション終了
    }
  };
  const { user } = useAuth();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const body = new FormData();
    body.append('title', formData.title);
    body.append('description', formData.description);
    body.append('price', String(parseInt(formData.price, 10) || 0));
    body.append('category', formData.category);
    body.append('seller_id', user?.uid || 'mock_uid_naoya'); //ここだ！！ここで毎回mock_uid_naoyaになってしまっていた
    if (imageFile) {
      body.append('image', imageFile);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/products`, {
        method: 'POST',
        body,
      });

      if (!response.ok) {
        throw new Error('通信エラーが発生しました');
      }

      const data = await response.json();

      setFormData({ title: '', category: '宇宙船・パーツ', description: '', price: '' });
      setImageFile(null);
      setImagePreviewUrl('');
      setCurrentStep(1);

      setSuccessState({
        isOpen: true,
        message: data.message || `Milkyway Data Bankに登録されました！\n商品ID: ${data.id} 「${data.title}」`
      });

    } catch (error) {
      console.error(error);
      alert('❌ 出品シグナルの送信に失敗しました。Goのサーバーが起動しているか、CORS設定を確認してください。');
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleCloseSuccess = () => {
    setSuccessState({ ...successState, isOpen: false });
    navigate('/'); // ホーム画面へ遷移
  };

  return (
    <AppLayout
      // 🚀 スロットに出品用のサイドバーを流し込み、現在のステップを同期
      sidebar={<SellSidebar currentStep={currentStep} />}
    >
      {/* 🖋️ メインの動的フォームエリア */}
      <div className="h-full overflow-y-auto p-8 flex items-center justify-center font-mono text-slate-100">
        <div className="max-w-3xl w-full bg-slate-950/40 border border-slate-800/80 rounded-xl p-8 shadow-2xl backdrop-blur-sm min-h-[500px] flex flex-col justify-between">
          
          <form onSubmit={handleSubmit} className="space-y-6 flex-grow">
            
            {/* 1️⃣ STEP 1: 基本情報 */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-200 border-b border-slate-800 pb-2 mb-4">基本情報</h3>
                  <label className="text-xs text-slate-400 block mb-2 font-bold uppercase tracking-wider">商品画像 (最大1枚)</label>
                  
                  <div className="grid grid-cols-5 gap-3">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square border border-dashed border-slate-800 hover:border-cyan-500/50 bg-slate-900/50 rounded flex flex-col items-center justify-center cursor-pointer group transition-all text-slate-500 hover:text-cyan-400 relative overflow-hidden"
                    >
                      {imagePreviewUrl ? (
                        <img src={imagePreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <Plus size={20} className="group-hover:scale-110 transition-transform" />
                          <span className="text-[9px] mt-1 text-center scale-90 text-slate-600 group-hover:text-cyan-500">天体をスキャン</span>
                        </>
                      )}
                    </div>
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="aspect-square border border-dashed border-slate-900 bg-slate-950/20 rounded flex items-center justify-center text-slate-700">
                        <Lock size={14} />
                      </div>
                    ))}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <p className="text-[10px] text-slate-500 mt-2">商品画像をアップロードしてください。</p>
                  {isAnalyzingImage && (
                    <p className="flex items-center gap-1.5 text-[10px] text-cyan-400 mt-2 animate-pulse">
                      <Loader2 size={12} className="animate-spin" />
                      Geminiが画像を解析中...（商品名・説明文を自動生成しています）
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-2 font-bold">商品名</label>
                  <input
                    type="text"
                    placeholder={isAnalyzingImage ? 'Geminiが解析中...' : '例：宇宙服4023年モデル'}
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
                    <option value="宇宙船・パーツ">宇宙船・パーツ</option>
                    <option value="生存物資・酸素">生存物資・酸素</option>
                    <option value="ITデバイス">ITデバイス</option>
                    <option value="天体ガジェット・インテリア">天体ガジェット・インテリア</option>
                    <option value="宇宙服・ウェア">宇宙服・ウェア</option>
                    <option value="本・星図">本・星図</option>
                    <option value="その他">その他</option>
                  </select>
                </div>
              </div>
            )}

            {/* 2️⃣ STEP 2: 詳細情報 */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-200 border-b border-slate-800 pb-2 mb-4">詳細情報</h3>
                {isAnalyzingImage && (
                  <p className="flex items-center gap-1.5 text-[10px] text-cyan-400 animate-pulse">
                    <Loader2 size={12} className="animate-spin" />
                    Geminiが画像を解析中...（商品名・説明文を自動生成しています）
                  </p>
                )}
                <div>
                  <label className="text-xs text-slate-400 block mb-2 font-bold">商品の詳細説明（用途、使用度、傷の有無など）</label>
                  <textarea
                    rows={6}
                    placeholder="商品の詳細な説明を記述してください..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-[#0c101f] border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 transition-colors resize-none"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleGenerateSpaceDescription} //ボタンを押したらAI関数を実行
                    disabled={isGeneratingAI}               //通信中はボタンを押せなくする
                    className="..."
                  >
                    {isGeneratingAI ? (
                      <>
                        <Loader2 size={14} className="animate-spin" /> {/* ぐるぐる回る */}
                        銀河系データベースから抽出中...
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} /> {/* キラキラ */}
                        Gemini 3で宇宙風の説明を自動生成
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* 3️⃣ STEP 3: 価格設定 */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-200 border-b border-slate-800 pb-2 mb-4">価格設定</h3>
                <div>
                  <label className="text-xs text-slate-400 block mb-2 font-bold">販売価格 (円 / 太陽系第三惑星,地球,日本国通貨)</label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full bg-[#0c101f] border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 transition-colors pr-12"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-bold">円</span>
                  </div>
                </div>
              </div>
            )}

            {/* 4️⃣ STEP 4: 確認・出品 */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-200 border-b border-slate-800 pb-2 mb-4">最終確認</h3>
                <div className="flex gap-4 bg-[#0c101f] p-4 border border-slate-900 rounded text-xs text-slate-300">
                  {imagePreviewUrl && (
                    <div className="w-24 h-24 rounded overflow-hidden border border-slate-800 flex-shrink-0">
                      <img src={imagePreviewUrl} alt="Confirm" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="space-y-2 flex-grow">
                    <p><span className="text-slate-500">商品名:</span> {formData.title || '（未入力）'}</p>
                    <p><span className="text-slate-500">カテゴリ:</span> {formData.category}</p>
                    <p><span className="text-slate-500">説明文:</span> {formData.description || '（未入力）'}</p>
                    <p><span className="text-slate-500">価格:</span> {formData.price ? `${Number(formData.price).toLocaleString()} 円` : '（未入力）'}</p>
                  </div>
                </div>
                <p className="flex items-center gap-1.5 text-[11px] text-amber-400/80 animate-pulse">
                  <AlertTriangle size={12} />
                  銀河通商協定第31条に基づき、異星人間の商品取引は行われます。不公平な取引が発覚した場合は銀河公正取引委員会による調査の対象となります。
                </p>
              </div>
            )}

          </form>

          {/* 🔘 ナビゲーションボタン */}
          <div className="flex justify-between items-center border-t border-slate-900 pt-4 mt-6 flex-shrink-0">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1 || isSubmitting}
              className={`flex items-center gap-1 px-4 py-1.5 border rounded text-xs transition-all ${
                currentStep === 1 || isSubmitting
                  ? 'border-slate-900 text-slate-700 cursor-not-allowed'
                  : 'border-slate-700 text-slate-400 hover:bg-slate-900'
              }`}
            >
              <ChevronLeft size={14} />
              戻る
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className={`flex items-center gap-1 px-6 py-1.5 rounded text-xs tracking-wider ${PRIMARY_BUTTON_CLASS}`}
              >
                次へ
                <ChevronRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`flex items-center gap-1.5 px-6 py-1.5 rounded text-xs tracking-wider ${PRIMARY_BUTTON_CLASS}`}
              >
                {isSubmitting ? '通信中...' : (
                  <>
                    出品する
                    <Rocket size={14} />
                  </>
                )}
              </button>
            )}
          </div>

        </div>
        <SuccessModal
        isOpen={successState.isOpen}
        onClose={handleCloseSuccess}
        message={successState.message}
        />
      </div>
    </AppLayout>
  );
};