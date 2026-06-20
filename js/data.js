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
    story: "חברה טכנולוגית צעירה המשקיעה רבות בפיתוח מוצרים חדשניים עם פוטנציאל צמיחה גבוה. הרווחיות כרגע נמוכה בשל השקעות כבדות במחקר ופיתוח. לחברה טכנולוגיה ייחודית שקשה מאוד למתחרים להעתיק. המוצרים החדשים נמצאים בשלבי השקה.",
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
    story: "חברה צעירה ומפתיעה שהשיקה את מוצריה לפני שנתיים. היא הציגה תוצאות יוצאות דופן, גידול חד במכירות ורווחיות גבוהה מהממוצע בתחום. החברה פועלת בשוק צומח והתחרות בתחום מתגברת.",
    startPrice: 800,
  },
];

const YEARS = [
  // ── שנת ניסיון ──
  {
    label: "שנת ניסיון", isTrial: true,
    nova: {
      rev: "₪500M", profit: "₪-20M", profitClass: "neg", price: 500,
      headline: "המשקיעים דואגים: האם NovaTech תצליח להרוויח?",
      body: "החברה ממשיכה להשקיע מיליונים בפיתוח, אך הרווחיות נותרת שלילית. מנכ\"ל החברה מבטיח: \"אנחנו בונים משהו גדול.\""
    },
    prime: {
      rev: "₪1.1B", profit: "₪220M", profitClass: "pos", price: 5000,
      headline: "Prime Holdings: יציבות ורווחיות — שוב",
      body: "החברה מדווחת על תוצאות חזקות ברבעון השלישי. המנהלים שומרים על אסטרטגיה שמרנית שמוכיחה את עצמה שנה אחר שנה."
    },
    fast: {
      rev: "₪700M", profit: "₪350M", profitClass: "pos", price: 800,
      headline: "FastWave מכה את כל התחזיות — המניה זינקה",
      body: "המשקיעים נלהבים: החברה הצעירה מציגה צמיחה חדה במכירות ורווחיות גבוהה במיוחד. האם זה ממשיך?"
    },
  },

  // ── שנה 1 ──
  {
    label: "שנה 1 מתוך 5", isTrial: false,
    nova: {
      rev: "₪620M", profit: "₪-10M", profitClass: "neg", price: 480,
      headline: "NovaTech עדיין מפסידה — עד מתי?",
      body: "למרות צמיחה בהכנסות, הרווח נשאר שלילי. אנליסטים חלוקים: חלק רואים פוטנציאל, אחרים מזהירים מסיכון."
    },
    prime: {
      rev: "₪950M", profit: "₪190M", profitClass: "pos", price: 5500,
      headline: "דיבידנד מחולק, תחזית מועלית — Prime ממשיכה לספק",
      body: "החברה הודיעה על העלאת תחזית שנתית וחלוקת דיבידנד נוסף. \"זו חברה שיודעת לשמור על הבטחותיה,\" אמר אנליסט בכיר."
    },
    fast: {
      rev: "₪880M", profit: "₪440M", profitClass: "pos", price: 960,
      headline: "אנליסטים מעלים המלצות: FastWave — קנייה חזקה",
      body: "בעקבות צמיחה של כמעט 26% בהכנסות, שלושה בתי השקעות גדולים שדרגו את המלצתם. \"הנתונים מדברים בעד עצמם.\""
    },
  },

  // ── שנה 2 ──
  {
    label: "שנה 2 מתוך 5", isTrial: false,
    nova: {
      rev: "₪760M", profit: "₪5M", profitClass: "pos", price: 450,
      headline: "יקרה מדי או הזדמנות? הוויכוח על NovaTech נמשך",
      body: "לראשונה החברה מציגה רווח קטן — אך האנליסטים חלוקים. \"המניה מתומחרת גבוה מדי ביחס לרווחים,\" טוענים חלקם. אחרים רואים בכך רק את תחילת הדרך."
    },
    prime: {
      rev: "₪1.0B", profit: "₪200M", profitClass: "pos", price: 6000,
      headline: "Prime Holdings: תוצאות עקביות — אבל האם המניה יקרה?",
      body: "החברה ממשיכה לספק תוצאות יציבות ורווחיות גבוהה. חלק מהאנליסטים מזהירים שהמניה אינה זולה, אך המחזיקים הוותיקים אינם ממהרים למכור."
    },
    fast: {
      rev: "₪1.05B", profit: "₪525M", profitClass: "pos", price: 1150,
      headline: "שיא חדש ל-FastWave — אך מתחרים מתחילים לנשום בעורף",
      body: "החברה שוברת שיאים ברווחיות, אך לראשונה מופיעות אזהרות: שחקנים חדשים נכנסים לתחום. \"הצמיחה מרשימה, אבל התחרות מתעוררת,\" אמר אנליסט."
    },
  },

  // ── שנה 3 ──
  {
    label: "שנה 3 מתוך 5", isTrial: false,
    nova: {
      rev: "₪940M", profit: "₪35M", profitClass: "pos", price: 530,
      headline: "המוצר החדש של NovaTech מתחיל לזוז — השוק עדיין סקפטי",
      body: "נתוני המכירות מראים גידול ראשון משמעותי במוצר הדגל. \"אנחנו רואים אימוץ אמיתי בשוק,\" אמר המנכ\"ל. אנליסטים זהירים — רוצים לראות עוד רבעון לפני שמשנים המלצה."
    },
    prime: {
      rev: "₪1.06B", profit: "₪210M", profitClass: "pos", price: 6600,
      headline: "Prime Holdings: צמיחה איטית אך בטוחה — המודל עובד",
      body: "רבעון נוסף של תוצאות עקביות. החברה אינה מפתיעה — לא לטובה ולא לרעה. \"זו בדיוק הסיבה שאנחנו אוהבים אותה,\" אמר מנהל קרן גדולה."
    },
    fast: {
      rev: "₪980M", profit: "₪490M", profitClass: "pos", price: 720,
      headline: "סדקים ראשונים: FastWave מדווחת על ירידה ברווחיות",
      body: "לראשונה מזה שלוש שנים, הרווח של FastWave ירד בחדות. מלחמת מחירים מול מתחרים חדשים גובה את מחירה. \"זה לא מה שציפינו,\" הודה סמנכ\"ל הכספים."
    },
  },

  // ── שנה 4 ──
  {
    label: "שנה 4 מתוך 5", isTrial: false,
    nova: {
      rev: "₪1.3B", profit: "₪140M", profitClass: "pos", price: 850,
      headline: "NovaTech פורצת: קפיצה ענקית במכירות המוצר החדש",
      body: "הנתונים מדברים בעד עצמם — צמיחה של 38% בהכנסות ורווח שזינק פי ארבעה. \"זה הרגע שחיכינו לו,\" אמר המנכ\"ל. המניה מגיבה בחיוב."
    },
    prime: {
      rev: "₪1.12B", profit: "₪225M", profitClass: "pos", price: 7250,
      headline: "Prime Holdings שומרת על הקו — רווחיות יציבה גם בסביבה סוערת",
      body: "בעוד שוק המניות תנודתי, Prime מספקת שוב תוצאות צפויות. \"בשוק כזה, יציבות היא נכס,\" אמר מנהל ההשקעות הראשי."
    },
    fast: {
      rev: "₪760M", profit: "₪-30M", profitClass: "neg", price: 320,
      headline: "המנכ\"לית פורשת, הרווח קורס — FastWave במשבר",
      body: "הלם בשוק: המנכ\"לית המייסדת הודיעה על פרישה מיידית, ובמקביל דיווחה החברה על הפסד ראשון. \"אנחנו בוחנים את האפשרויות,\" נמסר מהחברה."
    },
  },

  // ── שנה 5 ──
  {
    label: "שנה 5 מתוך 5", isTrial: false,
    nova: {
      rev: "₪1.8B", profit: "₪310M", profitClass: "pos", price: 1360,
      headline: "NovaTech — מובילת שוק: הסיפור של העשור",
      body: "מי שהאמין בחברה כשכולם ספקנו — מחייך היום. NovaTech הפכה למובילת שוק בתחומה עם צמיחה של 170% מתחילת הדרך. \"זה רק ההתחלה,\" הבטיח המנכ\"ל."
    },
    prime: {
      rev: "₪1.2B", profit: "₪240M", profitClass: "pos", price: 8000,
      headline: "Prime Holdings: עוד שנה, אותה מצוינות",
      body: "חמש שנים רצופות של צמיחה עקבית ורווחיות גבוהה. המשקיעים הוותיקים מרוצים. \"זו לא החברה המרגשת ביותר — אבל היא מהאמינות ביותר,\" סיכם אנליסט."
    },
    fast: {
      rev: "₪620M", profit: "₪-90M", profitClass: "neg", price: 200,
      headline: "FastWave נאבקת להתאושש — ללא הצלחה",
      body: "שנה שנייה של הפסדים, הכנסות יורדות, ולקוחות עוברים למתחרים. \"לא ברור אם החברה תצליח לשרוד בצורתה הנוכחית,\" אמר אנליסט. המניה איבדה 75% מערכה."
    },
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