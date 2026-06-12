/* =============================================
   data.js — כל נתוני המשחק הקבועים
   ============================================= */

const MAX_PLAYERS = 20;
const STARTING_CASH = 10000;

/* ── Company profiles ── */
const COMPANIES = [
  {
    id:        'nova',
    name:      'NovaTech',
    tag:       'חברת צמיחה',
    tagClass:  'tag-nova',
    cardClass: 'nova',
    moat:      3,
    mgmt:      3,
    debt:      1,
    story:     'החברה משקיעה הרבה בפיתוח מוצרים חדשים. כרגע הרווחיות נמוכה, אך יש לה טכנולוגיה ייחודית שקשה למתחרים להעתיק.',
    startPrice: 500,
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
    startPrice: 3000,
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
    startPrice: 800,
  },
];

/* ── Years data ──
   prices scaled to match new startPrice values
   NovaTech:     500  → x10 from original 50
   Prime:        3000 → x3.33 from original 900
   FastWave:     800  → x10 from original 80
   ── */
const YEARS_DATA = [
  /* ── שנת ניסיון ── */
  {
    label: 'שנת ניסיון',
    nova:  { rev: '₪500M',  profit: '₪-20M', profitClass: 'negative', news: 'החברה מגדילה השקעות בפיתוח – המשקיעים חוששים מהרווחיות הנמוכה.', price: 500 },
    prime: { rev: '₪900M',  profit: '₪120M', profitClass: 'positive', news: 'החברה ממשיכה להציג יציבות ורווחיות גבוהה.', price: 3000 },
    fast:  { rev: '₪700M',  profit: '₪90M',  profitClass: 'positive', news: 'FastWave מכה את התחזיות והמניה מושכת עניין רב.', price: 800 },
  },

  /* ── שנה 1 ── */
  {
    label: 'שנה 1 מתוך 5',
    nova:  { rev: '₪620M',  profit: '₪-10M', profitClass: 'negative', news: 'כותרות שליליות: החברה עדיין לא מצליחה להציג רווח משמעותי.', price: 480 },
    prime: { rev: '₪950M',  profit: '₪130M', profitClass: 'positive', news: 'החברה מעלה תחזית שנתית ומחלקת דיבידנד.', price: 3300 },
    fast:  { rev: '₪880M',  profit: '₪130M', profitClass: 'positive', news: 'אנליסטים מעלים המלצות בעקבות צמיחה מהירה.', price: 960 },
  },

  /* ── שנה 2 ── */
  {
    label: 'שנה 2 מתוך 5',
    nova:  { rev: '₪760M',  profit: '₪5M',   profitClass: 'positive', news: 'אנליסטים חלוקים: האם החברה יקרה מדי ביחס לרווחים?', price: 450 },
    prime: { rev: '₪1.0B',  profit: '₪142M', profitClass: 'positive', news: 'ביצועים עקביים, אך חלק מהאנליסטים טוענים שהמניה יקרה.', price: 3600 },
    fast:  { rev: '₪1.05B', profit: '₪170M', profitClass: 'positive', news: 'החברה מציגה שיאים חדשים, אך מתחרים חדשים נכנסים לשוק.', price: 1150 },
  },

  /* ── שנה 3 ── */
  {
    label: 'שנה 3 מתוך 5',
    nova:  { rev: '₪940M',  profit: '₪35M',  profitClass: 'positive', news: 'המוצר החדש מתחיל לצבור לקוחות, אך השוק עדיין סקפטי.', price: 530 },
    prime: { rev: '₪1.06B', profit: '₪155M', profitClass: 'positive', news: 'החברה ממשיכה לצמוח לאט אך בעקביות.', price: 3960 },
    fast:  { rev: '₪980M',  profit: '₪80M',  profitClass: 'positive', news: 'סדקים ראשונים: ירידה ברווחיות בעקבות מלחמת מחירים.', price: 720 },
  },

  /* ── שנה 4 ── */
  {
    label: 'שנה 4 מתוך 5',
    nova:  { rev: '₪1.3B',  profit: '₪140M', profitClass: 'positive', news: 'החברה מדווחת על פריצה משמעותית במכירות המוצר החדש.', price: 850 },
    prime: { rev: '₪1.12B', profit: '₪168M', profitClass: 'positive', news: 'ההנהלה שומרת על מדיניות שמרנית ועל רווחיות יציבה.', price: 4350 },
    fast:  { rev: '₪760M',  profit: '₪-30M', profitClass: 'negative', news: 'החברה מאבדת נתח שוק והמנכ"לית פורשת במפתיע.', price: 320 },
  },

  /* ── שנה 5 (סיום) ── */
  {
    label: 'שנה 5 מתוך 5',
    nova:  { rev: '₪1.8B',  profit: '₪310M', profitClass: 'positive', news: 'NovaTech הופכת למובילת שוק בתחומה.', price: 1360 },
    prime: { rev: '₪1.2B',  profit: '₪182M', profitClass: 'positive', news: 'עוד שנה יציבה לחברה הוותיקה.', price: 4800 },
    fast:  { rev: '₪620M',  profit: '₪-90M', profitClass: 'negative', news: 'FastWave מתקשה להתאושש מול תחרות חזקה.', price: 200 },
  },
];