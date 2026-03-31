import { useState, useEffect, useCallback } from "react";
import AuthScreen from "@/components/AuthScreen";
import Sidebar from "@/components/messenger/Sidebar";
import ChatArea from "@/components/messenger/ChatArea";
import { NewChatModal, CallModal, CloudModal } from "@/components/messenger/Modals";
import PremiumModal from "@/components/PremiumModal";
import StarsModal from "@/components/StarsModal";
import { CONTACTS, MESSAGES_BY_ID, CURRENT_USER, type Message, type User } from "@/data/mockData";
import { getMe, demoLogin, logout as apiLogout, getLocalStars, getMessages, sendMessage as apiSend, getChats } from "@/lib/api";

type Modal = "none" | "newChat" | "call" | "videoCall" | "cloud" | "premium" | "stars" | "gift";

export default function Index() {
  const [isAuth, setIsAuth] = useState(() => !!localStorage.getItem("mrax_token") || !!localStorage.getItem("mrax_user"));
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem("mrax_user");
    return saved ? JSON.parse(saved) : CURRENT_USER;
  });
  const [stars, setStars] = useState(() => getLocalStars());

  const [activeTab, setActiveTab] = useState("chats");
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [messageMap, setMessageMap] = useState<Record<number, Message[]>>(MESSAGES_BY_ID);
  const [showTranslator, setShowTranslator] = useState(false);
  const [invisibleRead, setInvisibleRead] = useState(false);
  const [modal, setModal] = useState<Modal>("none");
  const [contacts] = useState(CONTACTS);

  // Real API polling for messages
  const [lastMsgId, setLastMsgId] = useState<Record<number, number>>({});
  const [useRealApi, setUseRealApi] = useState(!!localStorage.getItem("mrax_token"));

  const selectedContact = contacts.find(c => c.id === selectedChat) ?? null;
  const currentMessages = selectedChat ? (messageMap[selectedChat] || []) : [];
  const pinnedMsg = currentMessages.find(m => m.pinned) ?? null;

  // Load user from real API on start
  useEffect(() => {
    const token = localStorage.getItem("mrax_token");
    if (token) {
      getMe().then(data => {
        if (data.id) {
          const user: User = {
            id: data.id, tg_id: data.tg_id,
            name: [data.first_name, data.last_name].filter(Boolean).join(" "),
            username: data.username ? `@${data.username}` : "@mrax_user",
            avatar: (data.first_name?.[0] || "U") + (data.last_name?.[0] || ""),
            color: "#2A5CFF",
            phone: "",
            bio: data.bio || "",
            is_premium: data.is_premium,
            stars_balance: data.stars_balance,
          };
          setCurrentUser(user);
          localStorage.setItem("mrax_user", JSON.stringify(user));
          setStars(data.stars_balance || 0);
        }
      }).catch(() => {});
    }
  }, []);

  // Poll real messages if using real API
  useEffect(() => {
    if (!useRealApi || !selectedChat) return;
    const poll = async () => {
      const after = lastMsgId[selectedChat] || 0;
      const data = await getMessages(selectedChat, after).catch(() => ({ messages: [] }));
      if (data.messages?.length) {
        const mapped: Message[] = data.messages.map((m: Record<string, unknown>) => ({
          id: Number(m.id),
          from: m.from as "me" | "them",
          text: m.text as string,
          time: new Date(m.created_at as string).toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }),
          read: m.is_read as boolean,
          isNew: true,
          type: (m.type as Message["type"]) || "text",
        }));
        setMessageMap(prev => {
          const existing = prev[selectedChat] || [];
          const existingIds = new Set(existing.map(m => m.id));
          const newMsgs = mapped.filter(m => !existingIds.has(m.id));
          return newMsgs.length ? { ...prev, [selectedChat]: [...existing, ...newMsgs] } : prev;
        });
        const maxId = Math.max(...data.messages.map((m: Record<string, unknown>) => Number(m.id)));
        setLastMsgId(prev => ({ ...prev, [selectedChat]: maxId }));
      }
    };
    poll();
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [useRealApi, selectedChat, lastMsgId]);

  // Simulate auto-responses for mock chats
  useEffect(() => {
    if (useRealApi || !selectedChat) return;
    const pool = ["Окей, понял 👍", "Спасибо за информацию!", "Хорошо, скоро отвечу", "Отлично! Договорились.", "Принято ✓", "👍", "Понял, сделаю", "Интересно, расскажи подробнее?", "Отлично! 🔥"];
    const t = setTimeout(() => {
      if (Math.random() > 0.4) {
        const resp: Message = {
          id: Date.now(),
          from: "them",
          text: pool[Math.floor(Math.random() * pool.length)],
          time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }),
          read: !invisibleRead,
          isNew: true,
        };
        setMessageMap(prev => ({ ...prev, [selectedChat]: [...(prev[selectedChat] || []), resp] }));
      }
    }, 2500 + Math.random() * 5000);
    return () => clearTimeout(t);
  }, [useRealApi, selectedChat, messageMap, invisibleRead]);

  const handleSend = useCallback(async (text: string) => {
    if (!selectedChat) return;
    const tempMsg: Message = {
      id: Date.now(),
      from: "me",
      text,
      time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }),
      read: false,
      isNew: true,
    };
    setMessageMap(prev => ({ ...prev, [selectedChat]: [...(prev[selectedChat] || []), tempMsg] }));
    if (useRealApi) {
      apiSend(selectedChat, text).catch(() => {});
    }
  }, [selectedChat, useRealApi]);

  const handleGiftSent = (gift: { emoji: string; name: string }) => {
    if (!selectedChat) return;
    const giftMsg: Message = {
      id: Date.now(),
      from: "me",
      text: `${gift.emoji} Подарок «${gift.name}»`,
      time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }),
      read: false,
      isNew: true,
      type: "text",
    };
    setMessageMap(prev => ({ ...prev, [selectedChat]: [...(prev[selectedChat] || []), giftMsg] }));
    setTimeout(() => {
      const reply: Message = {
        id: Date.now() + 1,
        from: "them",
        text: "Спасибо за подарок! 🎁 Очень приятно! ❤️",
        time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }),
        read: false,
        isNew: true,
      };
      setMessageMap(prev => ({ ...prev, [selectedChat]: [...(prev[selectedChat] || []), reply] }));
    }, 1500);
  };

  const handleLogin = async (name: string, username: string) => {
    // Try real API first
    try {
      const tgId = Math.floor(Math.random() * 900000000) + 100000000;
      const data = await demoLogin(name, username.replace("@", ""), tgId);
      if (data.token) {
        localStorage.setItem("mrax_token", data.token);
        const user: User = {
          id: data.user.id,
          name: data.user.first_name + (data.user.last_name ? " " + data.user.last_name : ""),
          username: data.user.username ? `@${data.user.username}` : username,
          avatar: name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase(),
          color: "#2A5CFF",
          phone: "",
          bio: "",
          is_premium: false,
          stars_balance: 100,
        };
        setCurrentUser(user);
        localStorage.setItem("mrax_user", JSON.stringify(user));
        setStars(100);
        setUseRealApi(true);
        setIsAuth(true);
        return;
      }
    } catch (_e) {
      // fallback
    }

    // Fallback to local
    const user: User = {
      ...CURRENT_USER, name, username,
      avatar: name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase(),
    };
    setCurrentUser(user);
    localStorage.setItem("mrax_user", JSON.stringify(user));
    setStars(100);
    setIsAuth(true);
  };

  const handleTelegramLogin = async (tgData: Record<string, string>) => {
    // Telegram login widget callback
    const { telegramLogin } = await import("@/lib/api");
    const data = await telegramLogin(tgData);
    if (data.token) {
      localStorage.setItem("mrax_token", data.token);
      const user: User = {
        id: data.user.id,
        name: [data.user.first_name, data.user.last_name].filter(Boolean).join(" "),
        username: data.user.username ? `@${data.user.username}` : "@mrax_user",
        avatar: (data.user.first_name?.[0] || "U") + (data.user.last_name?.[0] || ""),
        color: "#2A5CFF",
        phone: "",
        bio: data.user.bio || "",
        is_premium: data.user.is_premium,
        stars_balance: data.user.stars_balance || 0,
        photo_url: data.user.photo_url,
      };
      setCurrentUser(user);
      localStorage.setItem("mrax_user", JSON.stringify(user));
      setStars(data.user.stars_balance || 0);
      setUseRealApi(true);
      setIsAuth(true);
    }
  };

  const handleLogout = async () => {
    await apiLogout();
    localStorage.removeItem("mrax_user");
    localStorage.removeItem("mrax_token");
    setIsAuth(false);
    setSelectedChat(null);
    setActiveTab("chats");
    setUseRealApi(false);
  };

  const handleSelectChat = (id: number) => {
    setSelectedChat(id);
    setActiveTab("chats");
  };

  const handleNewChatSelect = (id: number) => {
    setSelectedChat(id);
    setActiveTab("chats");
    setModal("none");
  };

  if (!isAuth) {
    return <AuthScreen onLogin={handleLogin} onTelegramLogin={handleTelegramLogin} />;
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--mrax-bg)", fontFamily: "'Golos Text', sans-serif" }}>
      <Sidebar
        contacts={contacts}
        selectedChat={selectedChat}
        onSelectChat={handleSelectChat}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onNewChat={() => setModal("newChat")}
        onCallStart={() => setModal("call")}
        currentUser={currentUser}
        onLogout={handleLogout}
        onCallHistoryCall={() => setModal("call")}
        stars={stars}
        onPremium={() => setModal("premium")}
        onStars={() => setModal("stars")}
      />

      <ChatArea
        contact={selectedContact}
        messages={currentMessages}
        onSend={handleSend}
        currentUser={currentUser}
        showTranslator={showTranslator}
        setShowTranslator={setShowTranslator}
        invisibleRead={invisibleRead}
        setInvisibleRead={setInvisibleRead}
        onCallStart={() => setModal("call")}
        onVideoCallStart={() => setModal("videoCall")}
        pinnedMsg={pinnedMsg}
        onSendGift={() => setModal("gift")}
        stars={stars}
      />

      {modal === "newChat" && (
        <NewChatModal contacts={contacts} onSelect={handleNewChatSelect} onClose={() => setModal("none")} />
      )}
      {(modal === "call" || modal === "videoCall") && (
        <CallModal contact={selectedContact ?? contacts[0]} isVideo={modal === "videoCall"} onClose={() => setModal("none")} />
      )}
      {modal === "cloud" && <CloudModal onClose={() => setModal("none")} />}
      {modal === "premium" && (
        <PremiumModal stars={stars} onClose={() => setModal("none")} onPurchased={() => {
          const user = JSON.parse(localStorage.getItem("mrax_user") || "{}");
          setCurrentUser(prev => ({ ...prev, is_premium: true }));
          setStars(getLocalStars());
        }} />
      )}
      {(modal === "stars" || modal === "gift") && (
        <StarsModal
          stars={stars}
          onClose={() => setModal("none")}
          onUpdate={setStars}
          mode={modal === "gift" ? "gift" : "buy"}
          recipientName={modal === "gift" ? selectedContact?.name : undefined}
          onGiftSent={handleGiftSent}
        />
      )}
    </div>
  );
}