import { useState } from "react";
import Icon from "@/components/ui/icon";

type AuthStep = "welcome" | "phone" | "code" | "name" | "done";

interface Props {
  onLogin: (name: string, username: string) => void;
}

export default function AuthScreen({ onLogin }: Props) {
  const [step, setStep] = useState<AuthStep>("welcome");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [codeError, setCodeError] = useState(false);

  const handleGoogle = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin("Пользователь Google", "@google_user");
    }, 1800);
  };

  const handleTelegram = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin("Пользователь Telegram", "@tg_user");
    }, 1800);
  };

  const handleSendCode = () => {
    if (phone.replace(/\D/g, "").length < 10) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep("code"); }, 1200);
  };

  const handleVerifyCode = () => {
    if (code.length < 5) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (code === "12345") {
        setStep("name");
      } else {
        setCodeError(true);
        setLoading(false);
        setTimeout(() => setCodeError(false), 2000);
      }
    }, 1000);
  };

  const handleFinish = () => {
    if (!name.trim()) return;
    const uname = username.trim() ? (username.startsWith("@") ? username : "@" + username) : "@user_" + Math.floor(Math.random() * 9999);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin(name.trim(), uname);
    }, 800);
  };

  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 11);
    if (!digits) return "";
    if (digits.startsWith("7") || digits.startsWith("8")) {
      const d = digits.slice(1);
      let result = "+7";
      if (d.length > 0) result += " (" + d.slice(0, 3);
      if (d.length >= 3) result += ") " + d.slice(3, 6);
      if (d.length >= 6) result += "-" + d.slice(6, 8);
      if (d.length >= 8) result += "-" + d.slice(8, 10);
      return result;
    }
    return "+" + digits;
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: "linear-gradient(135deg, #F5F5F5 0%, #EEF2FF 50%, #F5F5F5 100%)",
        fontFamily: "'Golos Text', sans-serif",
      }}
    >
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-10" style={{ background: "var(--mrax-accent)", filter: "blur(80px)" }} />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-10" style={{ background: "#FF6B6B", filter: "blur(80px)" }} />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Card */}
        <div
          className="rounded-3xl p-8 shadow-2xl animate-scale-in"
          style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(20px)" }}
        >
          {/* Welcome */}
          {step === "welcome" && (
            <div className="text-center">
              <div
                className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5 font-bold text-white text-2xl shadow-lg"
                style={{ background: "var(--mrax-accent)" }}
              >
                MX
              </div>
              <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--mrax-text)" }}>MRAX</h1>
              <p className="text-sm mb-8" style={{ color: "var(--mrax-text-secondary)" }}>
                Мессенджер нового поколения
              </p>

              {/* Google */}
              <button
                onClick={handleGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl mb-3 font-semibold text-sm transition-all duration-200 border"
                style={{
                  background: loading ? "#f5f5f5" : "#fff",
                  color: "var(--mrax-text)",
                  borderColor: "var(--mrax-border)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
                onMouseEnter={e => !loading && (e.currentTarget.style.background = "#f8f8f8")}
                onMouseLeave={e => !loading && (e.currentTarget.style.background = "#fff")}
              >
                {loading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 border-t-gray-600 animate-spin" />
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                Войти через Google
              </button>

              {/* Telegram */}
              <button
                onClick={handleTelegram}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl mb-6 font-semibold text-sm text-white transition-all duration-200"
                style={{
                  background: loading ? "#5BA3D9" : "#229ED9",
                  boxShadow: "0 2px 8px rgba(34,158,217,0.35)",
                }}
                onMouseEnter={e => !loading && (e.currentTarget.style.background = "#1e8fc5")}
                onMouseLeave={e => !loading && (e.currentTarget.style.background = "#229ED9")}
              >
                {loading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.19 13.98l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.958.579z"/>
                  </svg>
                )}
                Войти через Telegram
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px" style={{ background: "var(--mrax-border)" }} />
                <span className="text-xs" style={{ color: "var(--mrax-text-secondary)" }}>или</span>
                <div className="flex-1 h-px" style={{ background: "var(--mrax-border)" }} />
              </div>

              <button
                onClick={() => setStep("phone")}
                className="w-full py-3.5 rounded-2xl font-semibold text-sm transition-all duration-200"
                style={{
                  background: "var(--mrax-accent-light)",
                  color: "var(--mrax-accent)",
                  border: "1.5px solid rgba(42,92,255,0.2)",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "#dce7ff")}
                onMouseLeave={e => (e.currentTarget.style.background = "var(--mrax-accent-light)")}
              >
                Войти по номеру телефона
              </button>

              <p className="text-xs mt-5 text-center leading-relaxed" style={{ color: "var(--mrax-text-secondary)" }}>
                Регистрируясь, вы соглашаетесь с{" "}
                <span style={{ color: "var(--mrax-accent)", cursor: "pointer" }}>Условиями</span>
                {" "}и{" "}
                <span style={{ color: "var(--mrax-accent)", cursor: "pointer" }}>Политикой конфиденциальности</span>
              </p>
            </div>
          )}

          {/* Phone step */}
          {step === "phone" && (
            <div>
              <button onClick={() => setStep("welcome")} className="mb-5 flex items-center gap-2" style={{ color: "var(--mrax-accent)" }}>
                <Icon name="ArrowLeft" size={18} />
                <span className="text-sm font-semibold">Назад</span>
              </button>
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "var(--mrax-accent-light)" }}>
                  <Icon name="Phone" size={26} style={{ color: "var(--mrax-accent)" }} />
                </div>
                <h2 className="text-xl font-bold mb-1" style={{ color: "var(--mrax-text)" }}>Введите номер</h2>
                <p className="text-sm" style={{ color: "var(--mrax-text-secondary)" }}>Мы отправим вам SMS с кодом</p>
              </div>
              <div
                className="flex items-center gap-2 px-4 py-3.5 rounded-2xl mb-4"
                style={{ border: "2px solid var(--mrax-accent)", background: "var(--mrax-accent-light)" }}
              >
                <Icon name="Phone" size={18} style={{ color: "var(--mrax-accent)" }} />
                <input
                  className="flex-1 bg-transparent outline-none font-semibold text-base"
                  style={{ color: "var(--mrax-text)", fontFamily: "'Golos Text', sans-serif" }}
                  placeholder="+7 (999) 000-00-00"
                  value={phone}
                  onChange={e => setPhone(formatPhone(e.target.value))}
                  onKeyDown={e => e.key === "Enter" && handleSendCode()}
                  autoFocus
                />
              </div>
              <button
                onClick={handleSendCode}
                disabled={loading || phone.replace(/\D/g, "").length < 10}
                className="w-full py-3.5 rounded-2xl font-bold text-sm text-white transition-all duration-200"
                style={{
                  background: phone.replace(/\D/g, "").length >= 10 ? "var(--mrax-accent)" : "#C5D1FF",
                }}
              >
                {loading ? "Отправляем..." : "Получить код →"}
              </button>
            </div>
          )}

          {/* Code step */}
          {step === "code" && (
            <div>
              <button onClick={() => setStep("phone")} className="mb-5 flex items-center gap-2" style={{ color: "var(--mrax-accent)" }}>
                <Icon name="ArrowLeft" size={18} />
                <span className="text-sm font-semibold">Назад</span>
              </button>
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "var(--mrax-accent-light)" }}>
                  <Icon name="MessageSquare" size={26} style={{ color: "var(--mrax-accent)" }} />
                </div>
                <h2 className="text-xl font-bold mb-1" style={{ color: "var(--mrax-text)" }}>SMS-код</h2>
                <p className="text-sm" style={{ color: "var(--mrax-text-secondary)" }}>
                  Отправлен на номер <strong>{phone}</strong>
                </p>
              </div>
              <div
                className="flex items-center gap-2 px-4 py-3.5 rounded-2xl mb-1 transition-all duration-200"
                style={{
                  border: codeError ? "2px solid var(--mrax-notify)" : "2px solid var(--mrax-accent)",
                  background: codeError ? "#FFF0F0" : "var(--mrax-accent-light)",
                }}
              >
                <Icon name="Key" size={18} style={{ color: codeError ? "var(--mrax-notify)" : "var(--mrax-accent)" }} />
                <input
                  className="flex-1 bg-transparent outline-none font-bold text-2xl tracking-widest text-center"
                  style={{ color: codeError ? "var(--mrax-notify)" : "var(--mrax-text)", fontFamily: "'Golos Text', sans-serif", letterSpacing: "0.3em" }}
                  placeholder="·····"
                  maxLength={5}
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
                  onKeyDown={e => e.key === "Enter" && handleVerifyCode()}
                  autoFocus
                />
              </div>
              {codeError && (
                <p className="text-xs text-center mb-3" style={{ color: "var(--mrax-notify)" }}>
                  Неверный код. Попробуйте ещё раз.
                </p>
              )}
              <p className="text-xs text-center mb-4" style={{ color: "var(--mrax-text-secondary)" }}>
                Для демо введите: <strong style={{ color: "var(--mrax-accent)" }}>12345</strong>
              </p>
              <button
                onClick={handleVerifyCode}
                disabled={loading || code.length < 5}
                className="w-full py-3.5 rounded-2xl font-bold text-sm text-white transition-all duration-200"
                style={{ background: code.length >= 5 ? "var(--mrax-accent)" : "#C5D1FF" }}
              >
                {loading ? "Проверяем..." : "Подтвердить →"}
              </button>
              <button
                className="w-full mt-3 text-sm py-2"
                style={{ color: "var(--mrax-accent)" }}
                onClick={() => {
                  setLoading(true);
                  setTimeout(() => setLoading(false), 1000);
                }}
              >
                Отправить код повторно
              </button>
            </div>
          )}

          {/* Name step */}
          {step === "name" && (
            <div>
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "var(--mrax-accent-light)" }}>
                  <Icon name="User" size={26} style={{ color: "var(--mrax-accent)" }} />
                </div>
                <h2 className="text-xl font-bold mb-1" style={{ color: "var(--mrax-text)" }}>Ваш профиль</h2>
                <p className="text-sm" style={{ color: "var(--mrax-text-secondary)" }}>Как вас будут видеть другие?</p>
              </div>

              <div className="space-y-3 mb-5">
                <div
                  className="flex items-center gap-3 px-4 py-3.5 rounded-2xl"
                  style={{ border: "2px solid var(--mrax-accent)", background: "var(--mrax-accent-light)" }}
                >
                  <Icon name="User" size={18} style={{ color: "var(--mrax-accent)" }} />
                  <input
                    className="flex-1 bg-transparent outline-none font-semibold text-sm"
                    style={{ color: "var(--mrax-text)", fontFamily: "'Golos Text', sans-serif" }}
                    placeholder="Имя и фамилия *"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    autoFocus
                  />
                </div>
                <div
                  className="flex items-center gap-3 px-4 py-3.5 rounded-2xl"
                  style={{ border: "2px solid var(--mrax-border)", background: "var(--mrax-bg)" }}
                >
                  <span style={{ color: "var(--mrax-text-secondary)", fontWeight: 600 }}>@</span>
                  <input
                    className="flex-1 bg-transparent outline-none text-sm"
                    style={{ color: "var(--mrax-text)", fontFamily: "'Golos Text', sans-serif" }}
                    placeholder="username (необязательно)"
                    value={username}
                    onChange={e => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
                  />
                </div>
              </div>

              <button
                onClick={handleFinish}
                disabled={loading || !name.trim()}
                className="w-full py-3.5 rounded-2xl font-bold text-sm text-white transition-all duration-200"
                style={{ background: name.trim() ? "var(--mrax-accent)" : "#C5D1FF" }}
              >
                {loading ? "Создаём профиль..." : "Войти в MRAX 🚀"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
