export interface Contact {
  id: number;
  name: string;
  username: string;
  avatar: string;
  color: string;
  lastMsg: string;
  time: string;
  unread: number;
  online: boolean;
  type: "personal" | "group" | "channel";
  members?: number;
}

export interface Message {
  id: number;
  from: "me" | "them";
  text: string;
  time: string;
  read: boolean;
  isNew?: boolean;
  type?: "text" | "voice" | "image" | "file" | "sticker";
  replyTo?: number;
  forwarded?: boolean;
  pinned?: boolean;
  edited?: boolean;
}

export interface User {
  id: number;
  name: string;
  username: string;
  avatar: string;
  color: string;
  phone: string;
  bio: string;
}

export const CURRENT_USER: User = {
  id: 0,
  name: "Вы",
  username: "@mrax_user",
  avatar: "ВЫ",
  color: "#2A5CFF",
  phone: "+7 (999) 000-00-00",
  bio: "Использую MRAX",
};

export const CONTACTS: Contact[] = [
  { id: 1, name: "Алексей Громов", username: "@alexgromov", avatar: "АГ", color: "#2A5CFF", lastMsg: "Привет! Как дела?", time: "12:45", unread: 3, online: true, type: "personal" },
  { id: 2, name: "Мария Соколова", username: "@msokolova", avatar: "МС", color: "#FF6B6B", lastMsg: "Документ отправила 📎", time: "11:30", unread: 0, online: true, type: "personal" },
  { id: 3, name: "MRAX Official", username: "@mrax", avatar: "MX", color: "#2A5CFF", lastMsg: "Добро пожаловать в MRAX!", time: "09:15", unread: 1, online: true, type: "channel" },
  { id: 4, name: "Дмитрий Волков", username: "@dvolkov", avatar: "ДВ", color: "#FF9F43", lastMsg: "🎙 Голосовое сообщение", time: "Вчера", unread: 0, online: false, type: "personal" },
  { id: 5, name: "Проект «Альфа»", username: "@project_alpha", avatar: "ПА", color: "#A55EEA", lastMsg: "Иван: Встреча в 15:00", time: "Вчера", unread: 7, online: false, type: "group", members: 14 },
  { id: 6, name: "Анна Белова", username: "@annabelova", avatar: "АБ", color: "#2BCBBA", lastMsg: "Спасибо большое! 🙏", time: "Пн", unread: 0, online: true, type: "personal" },
  { id: 7, name: "Техподдержка MRAX", username: "@support", avatar: "ТП", color: "#778CA3", lastMsg: "Ваш запрос принят.", time: "Пн", unread: 0, online: false, type: "channel" },
  { id: 8, name: "Семья ❤️", username: "@family", avatar: "С❤", color: "#FC5C65", lastMsg: "Мама: Ужин в 19:00", time: "Вс", unread: 2, online: false, type: "group", members: 5 },
  { id: 9, name: "Игорь Петров", username: "@ipetrov", avatar: "ИП", color: "#20BF6B", lastMsg: "Увидимся завтра", time: "Вс", unread: 0, online: false, type: "personal" },
  { id: 10, name: "Рабочий чат 💼", username: "@work", avatar: "РЧ", color: "#45AAF2", lastMsg: "Сергей: Отчёт готов!", time: "Сб", unread: 4, online: false, type: "group", members: 23 },
];

export const MESSAGES_BY_ID: Record<number, Message[]> = {
  1: [
    { id: 1, from: "them", text: "Привет! Как дела?", time: "12:40", read: true },
    { id: 2, from: "me", text: "Всё хорошо, работаю над новым проектом!", time: "12:41", read: true },
    { id: 3, from: "them", text: "Отлично! Что за проект?", time: "12:42", read: true },
    { id: 4, from: "me", text: "Мессенджер MRAX 🚀 Уже почти готово", time: "12:43", read: true },
    { id: 5, from: "them", text: "Звучит интересно! Когда можно посмотреть?", time: "12:45", read: false },
  ],
  2: [
    { id: 1, from: "them", text: "Добрый день! Отправляю документы по договору.", time: "11:20", read: true },
    { id: 2, from: "me", text: "Спасибо, получил.", time: "11:25", read: true },
    { id: 3, from: "them", text: "Документ отправила 📎", time: "11:30", read: true },
  ],
  3: [
    { id: 1, from: "them", text: "Добро пожаловать в MRAX! 🎉", time: "09:10", read: true },
    { id: 2, from: "them", text: "MRAX — самый безопасный мессенджер для России.", time: "09:11", read: true },
    { id: 3, from: "them", text: "Встроенный переводчик, невидимое чтение и облачное хранилище — только у нас.", time: "09:13", read: true },
    { id: 4, from: "them", text: "Наслаждайтесь общением! 💬", time: "09:15", read: false },
  ],
  4: [
    { id: 1, from: "them", text: "🎙 Голосовое сообщение (0:23)", time: "18:05", read: true, type: "voice" },
    { id: 2, from: "me", text: "Слышу, всё понял!", time: "18:30", read: true },
  ],
  5: [
    { id: 1, from: "them", text: "Коллеги, встреча по проекту Альфа в 15:00 в переговорной.", time: "08:00", read: true },
    { id: 2, from: "them", text: "Иван: Встреча в 15:00", time: "Вчера", read: false },
  ],
  8: [
    { id: 1, from: "them", text: "Мама: Ужин в 19:00, не забудьте! ❤️", time: "Вс", read: false },
    { id: 2, from: "them", text: "Папа: Ок, буду вовремя", time: "Вс", read: false },
  ],
  10: [
    { id: 1, from: "them", text: "Сергей: Отчёт за квартал готов, отправил на почту", time: "Сб", read: false },
    { id: 2, from: "them", text: "Анна: Приняла, спасибо!", time: "Сб", read: false },
    { id: 3, from: "them", text: "Иван: Отличная работа команда 👏", time: "Сб", read: false },
    { id: 4, from: "them", text: "Сергей: Отчёт готов!", time: "Сб", read: false },
  ],
};

export const CALL_HISTORY = [
  { id: 1, name: "Алексей Громов", type: "incoming" as const, time: "Сегодня, 10:30", avatar: "АГ", color: "#2A5CFF", duration: "5:23" },
  { id: 2, name: "Мария Соколова", type: "outgoing" as const, time: "Вчера, 18:45", avatar: "МС", color: "#FF6B6B", duration: "12:07" },
  { id: 3, name: "Дмитрий Волков", type: "missed" as const, time: "Пн, 14:20", avatar: "ДВ", color: "#FF9F43", duration: "" },
  { id: 4, name: "Анна Белова", type: "video" as const, time: "Вс, 20:10", avatar: "АБ", color: "#2BCBBA", duration: "45:12" },
  { id: 5, name: "Проект «Альфа»", type: "outgoing" as const, time: "Сб, 15:00", avatar: "ПА", color: "#A55EEA", duration: "1:02:33" },
];
