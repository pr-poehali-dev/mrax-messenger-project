const AUTH_URL = "https://functions.poehali.dev/143f3ad6-8b3e-44b2-84bc-63af21d1df97";
const MESSAGES_URL = "https://functions.poehali.dev/7ecf7988-d6dd-4ef7-8ddd-863a55b258bf";

function getToken(): string {
  return localStorage.getItem("mrax_token") || "";
}

function authHeaders() {
  return { "Content-Type": "application/json", "X-Auth-Token": getToken() };
}

// ── AUTH ──
export async function demoLogin(firstName: string, username: string, tgId: number) {
  const res = await fetch(`${AUTH_URL}/demo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ first_name: firstName, username, tg_id: tgId }),
  });
  return res.json();
}

export async function telegramLogin(tgData: Record<string, string>) {
  const res = await fetch(`${AUTH_URL}/telegram`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tg_data: tgData }),
  });
  return res.json();
}

export async function getMe() {
  const res = await fetch(`${AUTH_URL}/me`, { headers: authHeaders() });
  return res.json();
}

export async function logout() {
  await fetch(`${AUTH_URL}/logout`, { method: "POST", headers: authHeaders() });
  localStorage.removeItem("mrax_token");
  localStorage.removeItem("mrax_user");
}

// ── CHATS ──
export async function getChats() {
  const res = await fetch(`${MESSAGES_URL}/chats`, { headers: authHeaders() });
  return res.json();
}

export async function createChat(userId: number) {
  const res = await fetch(`${MESSAGES_URL}/chats`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ user_id: userId, type: "personal" }),
  });
  return res.json();
}

export async function searchUsers(q: string) {
  const res = await fetch(`${MESSAGES_URL}/users/search?q=${encodeURIComponent(q)}`, { headers: authHeaders() });
  return res.json();
}

// ── MESSAGES ──
export async function getMessages(chatId: number, afterId = 0) {
  const res = await fetch(`${MESSAGES_URL}/messages?chat_id=${chatId}&after_id=${afterId}`, { headers: authHeaders() });
  return res.json();
}

export async function sendMessage(chatId: number, text: string, type = "text", replyToId?: number) {
  const res = await fetch(`${MESSAGES_URL}/messages`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ chat_id: chatId, text, type, reply_to_id: replyToId }),
  });
  return res.json();
}

// ── STARS (local simulation until stars function deploys) ──
export function getLocalStars(): number {
  const user = JSON.parse(localStorage.getItem("mrax_user") || "{}");
  return user.stars_balance || 0;
}

export function addLocalStars(amount: number): number {
  const user = JSON.parse(localStorage.getItem("mrax_user") || "{}");
  user.stars_balance = (user.stars_balance || 0) + amount;
  localStorage.setItem("mrax_user", JSON.stringify(user));
  return user.stars_balance;
}

export function spendLocalStars(amount: number): boolean {
  const user = JSON.parse(localStorage.getItem("mrax_user") || "{}");
  if ((user.stars_balance || 0) < amount) return false;
  user.stars_balance = (user.stars_balance || 0) - amount;
  localStorage.setItem("mrax_user", JSON.stringify(user));
  return true;
}

export function setPremium(until: Date) {
  const user = JSON.parse(localStorage.getItem("mrax_user") || "{}");
  user.is_premium = true;
  user.premium_until = until.toISOString();
  localStorage.setItem("mrax_user", JSON.stringify(user));
}

export const GIFTS_CATALOG = [
  { id: 1, name: "Красная роза", emoji: "🌹", description: "Символ любви и уважения", price_stars: 50, rarity: "common" },
  { id: 2, name: "Торт", emoji: "🎂", description: "С Днём рождения!", price_stars: 100, rarity: "common" },
  { id: 3, name: "Бриллиант", emoji: "💎", description: "Редкий и ценный подарок", price_stars: 500, rarity: "rare" },
  { id: 4, name: "Ракета", emoji: "🚀", description: "Для настоящих первопроходцев", price_stars: 250, rarity: "rare" },
  { id: 5, name: "Корона", emoji: "👑", description: "Для королей и королев", price_stars: 1000, rarity: "epic", is_limited: true, total_supply: 5000 },
  { id: 6, name: "Звезда", emoji: "⭐", description: "Подари звезду другу", price_stars: 25, rarity: "common" },
  { id: 7, name: "Огонь", emoji: "🔥", description: "Горячий подарок", price_stars: 75, rarity: "common" },
  { id: 8, name: "Единорог", emoji: "🦄", description: "Легендарный подарок", price_stars: 2500, rarity: "legendary", is_limited: true, total_supply: 1000 },
  { id: 9, name: "Шампанское", emoji: "🥂", description: "Отпразднуй вместе!", price_stars: 150, rarity: "rare" },
  { id: 10, name: "Плюшевый мишка", emoji: "🧸", description: "Милый и уютный", price_stars: 80, rarity: "common" },
];

export const PREMIUM_PLANS = [
  { id: 1, duration_months: 1, price_stars: 500, price_rub: 299, label: "1 месяц", features: ["Без рекламы", "Уникальные стикеры", "Голосовые HD", "Файлы до 4 ГБ", "Бейдж Premium ⭐", "Анимированный аватар", "Невидимый режим+", "Облако 100 ГБ"] },
  { id: 2, duration_months: 3, price_stars: 1300, price_rub: 799, label: "3 месяца", popular: true, features: ["Без рекламы", "Уникальные стикеры", "Голосовые HD", "Файлы до 4 ГБ", "Бейдж Premium ⭐", "Анимированный аватар", "Невидимый режим+", "Облако 100 ГБ", "Приоритетная поддержка"] },
  { id: 3, duration_months: 12, price_stars: 4500, price_rub: 2499, label: "1 год", features: ["Без рекламы", "Уникальные стикеры", "Голосовые HD", "Файлы до 4 ГБ", "Бейдж Premium ⭐", "Анимированный аватар", "Невидимый режим+", "Облако 200 ГБ", "Приоритетная поддержка", "Эксклюзивные подарки"] },
];
