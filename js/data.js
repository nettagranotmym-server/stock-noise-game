/* =============================================
   data.js — כל נתוני המשחק הקבועים
   ============================================= */

const AVATARS_F = [
  '👩','👩‍🦰','👩‍🦳','👩‍🦱','👩‍🦲',
  '🧕','👱‍♀️','🧑‍💼','👸','🧝‍♀️',
  '💁‍♀️','🙋‍♀️','🧑‍🎤','🧑‍🏫','🧑‍💻',
];
const AVATARS_M = ['👨','👨‍🦰','👨‍🦳','🧔','👦'];
const ALL_AVATARS = [...AVATARS_F, ...AVATARS_M];

const MAX_PLAYERS = 20;

/* ── Company profiles (shown in intro + throughout) ── */
const COMPANIES = [
  {
    id:        'nova',
    name:      'NovaTech',
    tag:       'חברת צמיחה',
    tagClass:  'tag-nova',
    cardClass: 'nova',
    moat:      3,   // 1–3 dots
    mgmt:      3,
    debt:      1,   // 1=גבוה 2=בינוני 3=נמוך
    story:     'החברה משקיעה הרבה בפיתוח מוצרים חדשים. כרגע הרווחיות נמוכה, אך יש לה טכנולוגיה ייחודית שקשה למתחרים להעתיק.',
    startPrice: 50,
  },
  {
    id:        'prime',
    name:      'Prime Holdings',
    tag:       'חברה יציבה',
    tagClass:  'tag-prime',
    cardClass: 'prime',
    moat:      2,
    mgmt:      3,
    debt:      3,
    story:     'חברה ותיקה ומבוססת. לא צפויה לצמוח במהירות, אך מייצרת הכנסות ורווחים בצורה עקבית.',
    startPrice: 900,
  },
  {
    id:        'fast',
    name:      'FastWave',
    tag:       'חברה מבטיחה',
    tagClass:  'tag-fast',
    cardClass: 'fast',
    moat:      2,
    mgmt:      2,
    debt:      3,
    story:     'החברה מציגה תוצאות חזקות וצומחת מהר, אך פועלת בתחום שבו התחרות הולכת וגוברת.',
    startPrice: 80,
  },
];

/* ──────────────────────────────────────────────
   YEARS_DATA[0]  = שנת ניסיון (trial)
   YEARS_DATA[1]  = שנה 1 מתוך 5
   ...
   YEARS_DATA[5]  = שנה 5 מתוך 5 (final)

   price = מחיר פנימי — לא מוצג לשחקן,
           משמש לחישוב שווי תיק
   ────────────────────────────────────────────── */
const YEARS_DATA = [
  /* ── שנת ניסיון ── */
  {
    label: 'שנת ניסיון',
    nova: {
      rev: '₪500M', profit: '₪-20M', profitClass: 'negative',
      news: 'החברה מגדילה השקעות בפיתוח – המשקיעים חוששים מהרווחיות הנמוכה.',
      price: 50,
    },
    prime: {
      rev: '₪900M', profit: '₪120M', profitClass: 'positive',
      news: 'החברה ממשיכה להציג יציבות ורווחיות גבוהה.',
      price: 900,
    },
    fast: {
      rev: '₪700M', profit: '₪90M', profitClass: 'positive',
      news: 'FastWave מכה את התחזיות והמניה מושכת עניין רב.',
      price: 80,
    },
  },

  /* ── שנה 1 ── */
  {
    label: 'שנה 1 מתוך 5',
    nova: {
      rev: '₪620M', profit: '₪-10M', profitClass: 'negative',
      news: 'כותרות שליליות: החברה עדיין לא מצליחה להציג רווח משמעותי.',
      price: 48,
    },
    prime: {
      rev: '₪950M', profit: '₪130M', profitClass: 'positive',
      news: 'החברה מעלה תחזית שנתית ומחלקת דיבידנד.',
      price: 990,
    },
    fast: {
      rev: '₪880M', profit: '₪130M', profitClass: 'positive',
      news: 'אנליסטים מעלים המלצות בעקבות צמיחה מהירה.',
      price: 96,
    },
  },

  /* ── שנה 2 ── */
  {
    label: 'שנה 2 מתוך 5',
    nova: {
      rev: '₪760M', profit: '₪5M', profitClass: 'positive',
      news: 'אנליסטים חלוקים: האם החברה יקרה מדי ביחס לרווחים?',
      price: 45,
    },
    prime: {
      rev: '₪1.0B', profit: '₪142M', profitClass: 'positive',
      news: 'ביצועים עקביים, אך חלק מהאנליסטים טוענים שהמניה יקרה.',
      price: 1080,
    },
    fast: {
      rev: '₪1.05B', profit: '₪170M', profitClass: 'positive',
      news: 'החברה מציגה שיאים חדשים, אך מתחרים חדשים נכנסים לשוק.',
      price: 115,
    },
  },

  /* ── שנה 3 ── */
  {
    label: 'שנה 3 מתוך 5',
    nova: {
      rev: '₪940M', profit: '₪35M', profitClass: 'positive',
      news: 'המוצר החדש מתחיל לצבור לקוחות, אך השוק עדיין סקפטי.',
      price: 53,
    },
    prime: {
      rev: '₪1.06B', profit: '₪155M', profitClass: 'positive',
      news: 'החברה ממשיכה לצמוח לאט אך בעקביות.',
      price: 1188,
    },
    fast: {
      rev: '₪980M', profit: '₪80M', profitClass: 'positive',
      news: 'סדקים ראשונים: ירידה ברווחיות בעקבות מלחמת מחירים.',
      price: 72,
    },
  },

  /* ── שנה 4 ── */
  {
    label: 'שנה 4 מתוך 5',
    nova: {
      rev: '₪1.3B', profit: '₪140M', profitClass: 'positive',
      news: 'החברה מדווחת על פריצה משמעותית במכירות המוצר החדש.',
      price: 85,
    },
    prime: {
      rev: '₪1.12B', profit: '₪168M', profitClass: 'positive',
      news: 'ההנהלה שומרת על מדיניות שמרנית ועל רווחיות יציבה.',
      price: 1305,
    },
    fast: {
      rev: '₪760M', profit: '₪-30M', profitClass: 'negative',
      news: 'החברה מאבדת נתח שוק והמנכ"לית פורשת במפתיע.',
      price: 32,
    },
  },

  /* ── שנה 5 (סיום) ── */
  {
    label: 'שנה 5 מתוך 5',
    nova: {
      rev: '₪1.8B', profit: '₪310M', profitClass: 'positive',
      news: 'NovaTech הופכת למובילת שוק בתחומה.',
      price: 136,
    },
    prime: {
      rev: '₪1.2B', profit: '₪182M', profitClass: 'positive',
      news: 'עוד שנה יציבה לחברה הוותיקה.',
      price: 1440,
    },
    fast: {
      rev: '₪620M', profit: '₪-90M', profitClass: 'negative',
      news: 'FastWave מתקשה להתאושש מול תחרות חזקה.',
      price: 20,
    },
  },
];