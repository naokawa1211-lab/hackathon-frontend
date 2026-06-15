import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// 📦 1. 大量の出品ダミーデータ
const MOCK_CARGOS = [
  { title: "型落ちの小型探査艇（ジャンク）", category: "宇宙船・パーツ", price: 4500000, status: "耐久度 34%", trader: "シバタ大佐", image: "🚀", sector: "SOLAR-SYSTEM" },
  { title: "アルファ産 純度99.9% 圧縮酸素ボンベ", category: "生存物資・酸素", price: 1200, status: "残量 80%", trader: "エコアース社", image: "💨", sector: "ALPHA-CENTAURI" },
  { title: "外宇宙通信用 高利得アンテナモジュール", category: "宇宙船・パーツ", price: 85000, status: "未使用・通電確認済", trader: "Dr.マセ", image: "📡", sector: "CYGNUS" },
  { title: "反物質リアクター コア（要メンテナンス）", category: "宇宙船・パーツ", price: 12000000, status: "臨界シグナル微弱", trader: "UNKNOWN", image: "⚛️", sector: "ORION" },
  { title: "テラフォーミング用 高速培養植物種子", category: "生存物資・酸素", price: 3500, status: "100粒カプセル", trader: "緑色銀河組合", image: "🌱", sector: "SOLAR-SYSTEM" },
  { title: "レプリカ版・クラインの壺（観賞用）", category: "天体ガジェット", price: 24000, status: "4次元構造シミュレート", trader: "骨董屋クロノス", image: "🏺", sector: "TAURUS" },
  { title: "タキオン粒子偏向シールド（装甲板）", category: "宇宙船・パーツ", price: 680000, status: "擦り傷あり・偏向率92%", trader: "シバタ大佐", image: "🛡️", sector: "SOLAR-SYSTEM" },
];

// 💬 2. 大量のDM（チャットルーム＆メッセージ）ダミーデータ
const generateMockDMs = (myUid: string) => [
  {
    roomInfo: { participants: [myUid, "shibata_uid"], lastMessage: "400万crが限界シグナルです。", traderName: "シバタ大佐" },
    messages: [
      { senderId: "shibata_uid", text: "例の「型落ちの小型探査艇」、300万crまで値下げできんか？" },
      { senderId: myUid, text: "シバタ大佐、こちらとしても燃料電池を新品に換装したばかりでして…400万crが限界シグナルです。" }
    ]
  },
  {
    roomInfo: { participants: [myUid, "eco_earth_uid"], lastMessage: "次回入港時に引き渡します。", traderName: "エコアース社" },
    messages: [
      { senderId: myUid, text: "圧縮酸素ボンベを3本確保したいのですが、在庫はありますか？" },
      { senderId: "eco_earth_uid", text: " naokawaオペレーター、確保可能です。次回入港時に引き渡します。" }
    ]
  }
];

// 🚀 データ注入を実行するコア関数
export const injectUniverseData = async (myUid: string) => {
  try {
    console.log("🌌 量子データインジェクション開始...");

    // A. 出品データをFirestoreの "cargos" コレクションへ注入
    for (const cargo of MOCK_CARGOS) {
      await addDoc(collection(db, "items"), {
        ...cargo,
        createdAt: serverTimestamp(),
        sellerId: cargo.trader === "UNKNOWN" ? myUid : "other_user_uid" // 一部を自分が出品したことにする
      });
    }

    // B. DMデータをFirestoreの "chat_rooms" とそのサブコレクションへ注入
    const mockDMs = generateMockDMs(myUid);
    for (const dm of mockDMs) {
      // 1. 部屋を作る
      const roomRef = await addDoc(collection(db, "chat_rooms"), {
        ...dm.roomInfo,
        updatedAt: serverTimestamp()
      });
      
      // 2. その部屋の中にメッセージ履歴を叩き込む
      for (const msg of dm.messages) {
        await addDoc(collection(db, `chat_rooms/${roomRef.id}/messages`), {
          ...msg,
          timestamp: serverTimestamp()
        });
      }
    }

    alert("✨ 宇宙ネットワークへのモックデータ注入が完了しました！リロードして確認してください。");
  } catch (error) {
    console.error("インジェクション失敗:", error);
    alert("データ注入に失敗しました。コンソールを確認してください。");
  }
};