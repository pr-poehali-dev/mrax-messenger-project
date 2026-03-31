import { useState, useEffect } from "react";
import AuthScreen from "@/components/AuthScreen";
import Sidebar from "@/components/messenger/Sidebar";
import ChatArea from "@/components/messenger/ChatArea";
import { NewChatModal, CallModal, CloudModal } from "@/components/messenger/Modals";
import { CONTACTS, MESSAGES_BY_ID, CURRENT_USER, type Message, type User } from "@/data/mockData";

type Modal = "none" | "newChat" | "call" | "videoCall" | "cloud";

export default function Index() {
  const [isAuth, setIsAuth] = useState(() => !!localStorage.getItem("mrax_user"));
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem("mrax_user");
    return saved ? JSON.parse(saved) : CURRENT_USER;
  });

  const [activeTab, setActiveTab] = useState("chats");
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [messageMap, setMessageMap] = useState<Record<number, Message[]>>(MESSAGES_BY_ID);
  const [showTranslator, setShowTranslator] = useState(false);
  const [invisibleRead, setInvisibleRead] = useState(false);
  const [modal, setModal] = useState<Modal>("none");
  const [contacts] = useState(CONTACTS);

  const selectedContact = contacts.find(c => c.id === selectedChat) ?? null;
  const currentMessages = selectedChat ? (messageMap[selectedChat] || []) : [];
  const pinnedMsg = currentMessages.find(m => m.pinned) ?? null;

  // Simulate incoming messages
  useEffect(() => {
    if (!selectedChat) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const responsePool = [
      "Окей, понял 👍",
      "Спасибо за информацию!",
      "Хорошо, скоро отвечу",
      "Отлично! Договорились.",
      "Принято ✓",
      "Напишу чуть позже",
      "👍",
      "Понял, сделаю",
    ];
    const t = setTimeout(() => {
      if (Math.random() > 0.5) {
        const resp: Message = {
          id: Date.now(),
          from: "them",
          text: responsePool[Math.floor(Math.random() * responsePool.length)],
          time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }),
          read: !invisibleRead,
          isNew: true,
        };
        setMessageMap(prev => ({
          ...prev,
          [selectedChat]: [...(prev[selectedChat] || []), resp],
        }));
      }
    }, 3000 + Math.random() * 4000);
    timers.push(t);
    return () => timers.forEach(clearTimeout);
  }, [selectedChat, invisibleRead]);

  const handleSend = (text: string) => {
    if (!selectedChat) return;
    const msg: Message = {
      id: Date.now(),
      from: "me",
      text,
      time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }),
      read: false,
      isNew: true,
    };
    setMessageMap(prev => ({
      ...prev,
      [selectedChat]: [...(prev[selectedChat] || []), msg],
    }));
  };

  const handleLogin = (name: string, username: string) => {
    const user: User = { ...CURRENT_USER, name, username };
    setCurrentUser(user);
    localStorage.setItem("mrax_user", JSON.stringify(user));
    setIsAuth(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("mrax_user");
    setIsAuth(false);
    setSelectedChat(null);
    setActiveTab("chats");
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
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--mrax-bg)", fontFamily: "'Golos Text', sans-serif" }}>
      {/* Sidebar */}
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
      />

      {/* Chat */}
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
      />

      {/* Modals */}
      {modal === "newChat" && (
        <NewChatModal contacts={contacts} onSelect={handleNewChatSelect} onClose={() => setModal("none")} />
      )}
      {(modal === "call" || modal === "videoCall") && (
        <CallModal contact={selectedContact ?? contacts[0]} isVideo={modal === "videoCall"} onClose={() => setModal("none")} />
      )}
      {modal === "cloud" && (
        <CloudModal onClose={() => setModal("none")} />
      )}
    </div>
  );
}
