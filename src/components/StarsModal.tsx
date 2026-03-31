import { useState } from "react";
import Icon from "@/components/ui/icon";
import { addLocalStars, GIFTS_CATALOG, spendLocalStars } from "@/lib/api";

interface Props {
  stars: number;
  onClose: () => void;
  onUpdate: (newBalance: number) => void;
  recipientName?: string;
  recipientId?: number;
  mode?: "buy" | "gift";
  onGiftSent?: (gift: typeof GIFTS_CATALOG[0]) => void;
}

const STAR_PACKS = [
  { amount: 50, price: "75 ₽", bonus: "" },
  { amount: 100, price: "140 ₽", bonus: "" },
  { amount: 250, price: "320 ₽", bonus: "+10%" },
  { amount: 500, price: "599 ₽", bonus: "+15%", popular: true },
  { amount: 1000, price: "1099 ₽", bonus: "+20%" },
  { amount: 2500, price: "2499 ₽", bonus: "+25%" },
];

const RARITY_LABELS: Record<string, string> = {
  common: "Обычный", rare: "Редкий", epic: "Эпический", legendary: "Легендарный"
};
const RARITY_COLORS: Record<string, string> = {
  common: "#778CA3", rare: "#2A5CFF", epic: "#A55EEA", legendary: "#FF9F43"
};

export default function StarsModal({ stars, onClose, onUpdate, recipientName, recipientId, mode = "buy", onGiftSent }: Props) {
  const [tab, setTab] = useState<"buy" | "gift">(mode);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [selectedGift, setSelectedGift] = useState<number | null>(null);

  const handleBuyStars = (amount: number) => {
    setLoading(true);
    setTimeout(() => {
      const newBal = addLocalStars(amount);
      onUpdate(newBal);
      setSuccess(`+${amount} ⭐ зачислено!`);
      setLoading(false);
      setTimeout(() => setSuccess(""), 2500);
    }, 1000);
  };

  const handleSendGift = () => {
    if (!selectedGift) return;
    const gift = GIFTS_CATALOG.find(g => g.id === selectedGift)!;
    if (stars < gift.price_stars) return;
    setLoading(true);
    setTimeout(() => {
      const ok = spendLocalStars(gift.price_stars);
      if (ok) {
        onUpdate(stars - gift.price_stars);
        onGiftSent?.(gift);
        setSuccess(`Подарок «${gift.emoji} ${gift.name}» отправлен!`);
        setTimeout(() => { setSuccess(""); onClose(); }, 2000);
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 animate-fade-in" style={{ background: "rgba(0,0,0,0.6)" }} onClick={onClose}>
      <div className="rounded-3xl w-full max-w-md mx-4 shadow-2xl animate-scale-in overflow-hidden" style={{ background: "var(--mrax-chat-bg)", maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 text-center" style={{ background: "linear-gradient(135deg, #FF9F43 0%, #FF6B6B 100%)" }}>
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.2)" }}>
            <Icon name="X" size={16} style={{ color: "#fff" }} />
          </button>
          <div className="text-4xl mb-1">⭐</div>
          <h2 className="text-xl font-bold text-white">MRAX Звёзды</h2>
          <div className="mt-2 text-2xl font-bold text-white">{stars} ⭐</div>
          <p className="text-xs text-white opacity-75">ваш баланс</p>
        </div>

        {/* Tabs */}
        <div className="flex px-4 pt-4 gap-2">
          {[{ id: "buy", label: "Купить звёзды" }, { id: "gift", label: "Подарки" }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as "buy" | "gift")}
              className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
              style={{ background: tab === t.id ? "var(--mrax-accent)" : "var(--mrax-accent-light)", color: tab === t.id ? "#fff" : "var(--mrax-accent)" }}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="px-4 py-4">
          {success && (
            <div className="text-center py-3 mb-3 rounded-xl" style={{ background: "#F0FFF8" }}>
              <div className="text-2xl mb-1">🎉</div>
              <div className="font-bold text-sm" style={{ color: "#00C48C" }}>{success}</div>
            </div>
          )}

          {/* BUY STARS */}
          {tab === "buy" && (
            <div>
              <p className="text-sm mb-4 text-center" style={{ color: "var(--mrax-text-secondary)" }}>
                Звёзды используются для подарков и Premium
              </p>
              <div className="grid grid-cols-2 gap-2">
                {STAR_PACKS.map(pack => (
                  <button key={pack.amount} onClick={() => handleBuyStars(pack.amount)} disabled={loading}
                    className="py-3 px-4 rounded-2xl text-left transition-all duration-200 relative"
                    style={{ background: pack.popular ? "var(--mrax-accent)" : "var(--mrax-accent-light)", border: pack.popular ? "none" : "1.5px solid var(--mrax-border)" }}>
                    {pack.popular && <div className="absolute -top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: "var(--mrax-notify)" }}>Топ</div>}
                    {pack.bonus && <div className="absolute top-2 right-2 text-xs font-bold" style={{ color: pack.popular ? "rgba(255,255,255,0.8)" : "#00C48C" }}>{pack.bonus}</div>}
                    <div className="text-lg font-bold" style={{ color: pack.popular ? "#fff" : "var(--mrax-text)" }}>{pack.amount} ⭐</div>
                    <div className="text-xs mt-0.5" style={{ color: pack.popular ? "rgba(255,255,255,0.8)" : "var(--mrax-text-secondary)" }}>{pack.price}</div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-center mt-4" style={{ color: "var(--mrax-text-secondary)" }}>
                Демо-режим: звёзды начисляются бесплатно
              </p>
            </div>
          )}

          {/* GIFTS */}
          {tab === "gift" && (
            <div>
              {recipientName && (
                <div className="text-center mb-3 text-sm font-semibold" style={{ color: "var(--mrax-text)" }}>
                  Подарок для: <span style={{ color: "var(--mrax-accent)" }}>{recipientName}</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {GIFTS_CATALOG.map(gift => (
                  <button key={gift.id} onClick={() => setSelectedGift(selectedGift === gift.id ? null : gift.id)}
                    className="p-3 rounded-2xl text-left transition-all duration-200 relative"
                    style={{
                      background: selectedGift === gift.id ? RARITY_COLORS[gift.rarity] + "18" : "var(--mrax-bg)",
                      border: `2px solid ${selectedGift === gift.id ? RARITY_COLORS[gift.rarity] : "var(--mrax-border)"}`,
                    }}>
                    {"is_limited" in gift && gift.is_limited && (
                      <div className="absolute top-1.5 right-1.5 text-xs font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: RARITY_COLORS[gift.rarity] }}>
                        Лим.
                      </div>
                    )}
                    <div className="text-3xl mb-1">{gift.emoji}</div>
                    <div className="font-semibold text-xs mb-0.5" style={{ color: "var(--mrax-text)" }}>{gift.name}</div>
                    <div className="text-xs font-bold" style={{ color: RARITY_COLORS[gift.rarity] }}>
                      {RARITY_LABELS[gift.rarity]}
                    </div>
                    <div className="text-xs mt-1 font-bold" style={{ color: stars >= gift.price_stars ? "var(--mrax-accent)" : "var(--mrax-notify)" }}>
                      {gift.price_stars} ⭐
                    </div>
                  </button>
                ))}
              </div>
              {selectedGift && (
                <button onClick={handleSendGift} disabled={loading || stars < (GIFTS_CATALOG.find(g => g.id === selectedGift)?.price_stars || 0)}
                  className="w-full py-3.5 rounded-2xl font-bold text-white transition-all duration-200"
                  style={{ background: "linear-gradient(135deg, #FF9F43, #FF6B6B)" }}>
                  {loading ? "Отправляем..." : `Отправить подарок ${GIFTS_CATALOG.find(g => g.id === selectedGift)?.emoji}`}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
