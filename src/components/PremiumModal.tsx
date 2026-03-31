import { useState } from "react";
import Icon from "@/components/ui/icon";
import { PREMIUM_PLANS, spendLocalStars, setPremium, getLocalStars } from "@/lib/api";

interface Props {
  onClose: () => void;
  onPurchased: () => void;
  stars: number;
}

export default function PremiumModal({ onClose, onPurchased, stars }: Props) {
  const [selectedPlan, setSelectedPlan] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const plan = PREMIUM_PLANS.find(p => p.id === selectedPlan)!;

  const handleBuy = () => {
    setError("");
    if (stars < plan.price_stars) {
      setError(`Недостаточно звёзд. Нужно ${plan.price_stars} ⭐, у вас ${stars}`);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const ok = spendLocalStars(plan.price_stars);
      if (ok) {
        const until = new Date();
        until.setMonth(until.getMonth() + plan.duration_months);
        setPremium(until);
        setSuccess(true);
        setTimeout(() => { onPurchased(); onClose(); }, 2000);
      }
      setLoading(false);
    }, 1200);
  };

  const RARITY_COLORS: Record<string, string> = {
    common: "#778CA3", rare: "#2A5CFF", epic: "#A55EEA", legendary: "#FF9F43"
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 animate-fade-in" style={{ background: "rgba(0,0,0,0.6)" }} onClick={onClose}>
      <div className="rounded-3xl w-full max-w-md mx-4 shadow-2xl animate-scale-in overflow-hidden" style={{ background: "var(--mrax-chat-bg)" }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="relative px-6 pt-8 pb-5 text-center" style={{ background: "linear-gradient(135deg, #2A5CFF 0%, #7B3FE4 100%)" }}>
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
            <Icon name="X" size={16} style={{ color: "#fff" }} />
          </button>
          <div className="text-4xl mb-2">⭐</div>
          <h2 className="text-xl font-bold text-white mb-1">MRAX Premium</h2>
          <p className="text-sm text-white opacity-80">Разблокируй все возможности</p>
          <div className="mt-3 px-4 py-1.5 rounded-full inline-block text-sm font-semibold" style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>
            Ваш баланс: {stars} ⭐
          </div>
        </div>

        <div className="px-5 py-4">
          {/* Plan selector */}
          <div className="flex gap-2 mb-4">
            {PREMIUM_PLANS.map(p => (
              <button key={p.id} onClick={() => setSelectedPlan(p.id)}
                className="flex-1 py-3 rounded-2xl text-center transition-all duration-200 relative"
                style={{
                  background: selectedPlan === p.id ? "var(--mrax-accent)" : "var(--mrax-accent-light)",
                  border: selectedPlan === p.id ? "none" : "1.5px solid transparent",
                }}>
                {p.popular && selectedPlan !== p.id && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: "var(--mrax-notify)", whiteSpace: "nowrap" }}>
                    Выгодно
                  </div>
                )}
                <div className="font-bold text-sm" style={{ color: selectedPlan === p.id ? "#fff" : "var(--mrax-text)" }}>{p.label}</div>
                <div className="text-xs mt-0.5" style={{ color: selectedPlan === p.id ? "rgba(255,255,255,0.8)" : "var(--mrax-text-secondary)" }}>{p.price_stars} ⭐</div>
              </button>
            ))}
          </div>

          {/* Features */}
          <div className="rounded-2xl p-4 mb-4" style={{ background: "var(--mrax-bg)" }}>
            <div className="text-xs font-bold mb-3" style={{ color: "var(--mrax-text-secondary)" }}>ВКЛЮЧЕНО В ПЛАН</div>
            <div className="grid grid-cols-2 gap-1.5">
              {plan.features.map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#00C48C" }}>
                    <Icon name="Check" size={10} style={{ color: "#fff" }} />
                  </div>
                  <span className="text-xs" style={{ color: "var(--mrax-text)" }}>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="text-sm text-center mb-3 px-3 py-2 rounded-xl" style={{ background: "#FFF0F0", color: "var(--mrax-notify)" }}>
              {error}
            </div>
          )}

          {success ? (
            <div className="text-center py-3">
              <div className="text-4xl mb-2">🎉</div>
              <div className="font-bold" style={{ color: "#00C48C" }}>Premium активирован!</div>
            </div>
          ) : (
            <button onClick={handleBuy} disabled={loading}
              className="w-full py-3.5 rounded-2xl font-bold text-base text-white transition-all duration-200"
              style={{ background: "linear-gradient(135deg, #2A5CFF, #7B3FE4)" }}>
              {loading ? "Обрабатываем..." : `Подписаться за ${plan.price_stars} ⭐`}
            </button>
          )}

          <p className="text-xs text-center mt-3" style={{ color: "var(--mrax-text-secondary)" }}>
            {plan.price_rub} ₽/мес · Отмена в любое время
          </p>
        </div>
      </div>
    </div>
  );
}
