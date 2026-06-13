// =============================================
// data.js — כל נתוני המשחק
// =============================================

const STARTING_CASH = 100000;
const MAX_PLAYERS   = 20;
const API_BASE      = "";

const PLAYER_EMOJIS = [
  "😊","😎","🤩","🧐","😄","🥳","🤓","😏","🙂","😁",
  "😀","🤗","😌","😇","🥸","😉","😋","🤔","😃","😆"
];

const COMPANIES = [
  {
    id: "nova", name: "NovaTech", icon: "🚀",
    cardClass: "nova",
    color: "var(--accent)", bg: "rgba(124,58,237,.15)",
    moat: 3, mgmt: 3, debt: 3,
    story: "חברה טכנולוגית צעירה המשקיעה רבות בפיתוח מוצרים חדשניים עם פוטנציאל צמיחה גבוה. הרווחיות כרגע נמוכה בשל השקעות כבדות במחקר ופיתוח, אך לחברה טכנולוגיה ייחודית שקשה מאוד למתחרים להעתיק. המוצרים החדשים נמצאים בשלבי השקה והביקוש הולך וגדל.",
    startPrice: 500,
  },
  {
    id: "prime", name: "Prime Holdings", icon: "🏦",
    cardClass: "prime",
    color: "var(--green)", bg: "rgba(5,150,105,.15)",
    moat: 2, mgmt: 3, debt: 3,
    story: "חברה ותיקה ומבוססת הפועלת בשוק יציב עם בסיס לקוחות נאמן ורחב. מציגה צמיחה סולידית ועקבית לאורך שנים רבות, מייצרת תזרים מזומנים חזק ומחלקת דיבידנד באופן קבוע. ההנהלה שמרנית ומנוסה, עם רקורד ארוך של עמידה ביעדים.",
    startPrice: 5000,
  },
  {
    id: "fast", name: "FastWave", icon: "⚡",
    cardClass: "fast",
    color: "var(--pink)", bg: "rgba(192,38,211,.15)",
    moat: 1, mgmt: 2, debt: 2,
    story: "חברה צעירה ומפתיעה שהציגה תוצאות יוצאות דופן בשנתיים האחרונות — גידול חד במכירות ורווחיות גבוהה מהממוצע בתחום. החברה פועלת בשוק צומח עם ביקוש גובר למוצריה. עם זאת, התחרות בתחום מתגברת ומתחרים חדשים נכנסים לשוק בקצב מהיר.",
    startPrice: 800,
  },
];

// index 0 = trial, 1-5 = real years
const YEARS = [
  // Trial
  {
    label: "שנת ניסיון", isTrial: true,
    nova:  { rev: "₪500M", profit: "₪-20M",  profitClass: "neg", news: "החברה מגדילה השקעות בפיתוח – המשקיעים חוששים מהרווחיות הנמוכה.", price: 500 },
    prime: { rev: "₪1.1B", profit: "₪220M",  profitClass: "pos", news: "החברה ממשיכה להציג יציבות ורווחיות גבוהה.", price: 5000 },
    fast:  { rev: "₪700M", profit: "₪350M",  profitClass: "pos", news: "FastWave מכה את התחזיות והמניה מושכת עניין רב.", price: 800 },
  },
  // Year 1
  {
    label: "שנה 1 מתוך 5", isTrial: false,
    nova:  { rev: "₪620M",  profit: "₪-10M", profitClass: "neg", news: "כותרות שליליות: החברה עדיין לא מצליחה להציג רווח משמעותי.", price: 480 },
    prime: { rev: "₪950M",  profit: "₪190M", profitClass: "pos", news: "החברה מעלה תחזית שנתית ומחלקת דיבידנד.", price: 5500 },
    fast:  { rev: "₪880M",  profit: "₪440M", profitClass: "pos", news: "אנליסטים מעלים המלצות בעקבות צמיחה מהירה.", price: 960 },
  },
  // Year 2
  {
    label: "שנה 2 מתוך 5", isTrial: false,
    nova:  { rev: "₪760M",  profit: "₪5M",   profitClass: "pos", news: "אנליסטים חלוקים: האם החברה יקרה מדי ביחס לרווחים?", price: 450 },
    prime: { rev: "₪1.0B",  profit: "₪200M", profitClass: "pos", news: "ביצועים עקביים, אך חלק מהאנליסטים טוענים שהמניה יקרה.", price: 6000 },
    fast:  { rev: "₪1.05B", profit: "₪525M", profitClass: "pos", news: "החברה מציגה שיאים חדשים, אך מתחרים חדשים נכנסים לשוק.", price: 1150 },
  },
  // Year 3
  {
    label: "שנה 3 מתוך 5", isTrial: false,
    nova:  { rev: "₪940M",  profit: "₪35M",  profitClass: "pos", news: "המוצר החדש מתחיל לצבור לקוחות, אך השוק עדיין סקפטי.", price: 530 },
    prime: { rev: "₪1.06B", profit: "₪210M", profitClass: "pos", news: "החברה ממשיכה לצמוח לאט אך בעקביות.", price: 6600 },
    fast:  { rev: "₪980M",  profit: "₪490M", profitClass: "pos", news: "סדקים ראשונים: ירידה ברווחיות בעקבות מלחמת מחירים.", price: 720 },
  },
  // Year 4
  {
    label: "שנה 4 מתוך 5", isTrial: false,
    nova:  { rev: "₪1.3B",  profit: "₪140M", profitClass: "pos", news: "החברה מדווחת על פריצה משמעותית במכירות המוצר החדש.", price: 850 },
    prime: { rev: "₪1.12B", profit: "₪225M", profitClass: "pos", news: "ההנהלה שומרת על מדיניות שמרנית ועל רווחיות יציבה.", price: 7250 },
    fast:  { rev: "₪760M",  profit: "₪-30M", profitClass: "neg", news: 'החברה מאבדת נתח שוק והמנכ"לית פורשת במפתיע.', price: 320 },
  },
  // Year 5
  {
    label: "שנה 5 מתוך 5", isTrial: false,
    nova:  { rev: "₪1.8B",  profit: "₪310M", profitClass: "pos", news: "NovaTech הופכת למובילת שוק בתחומה.", price: 1360 },
    prime: { rev: "₪1.2B",  profit: "₪240M", profitClass: "pos", news: "עוד שנה יציבה לחברה הוותיקה.", price: 8000 },
    fast:  { rev: "₪620M",  profit: "₪-90M", profitClass: "neg", news: "FastWave מתקשה להתאושש מול תחרות חזקה.", price: 200 },
  },
];

// ── Helpers ───────────────────────────────────
function fmt(n) {
  return "₪" + Math.round(n).toLocaleString("he-IL");
}

function calcNewValue(totalValue, alloc, fromYearIdx, toYearIdx) {
  const from = YEARS[fromYearIdx];
  const to   = YEARS[toYearIdx];
  let newTotal = 0;
  COMPANIES.forEach(co => {
    const pct    = (alloc[co.id] || 0) / 100;
    const amount = totalValue * pct;
    const ret    = (to[co.id].price - from[co.id].price) / from[co.id].price;
    newTotal    += amount * (1 + ret);
  });
  return Math.round(newTotal);
}

async function apiGet(path) {
  const res = await fetch(API_BASE + path);
  return res.json();
}

async function apiPost(path, body) {
  const res = await fetch(API_BASE + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function apiDelete(path) {
  const res = await fetch(API_BASE + path, { method: "DELETE" });
  return res.json();
}