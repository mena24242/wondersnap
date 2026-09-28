// Internationalisation: English (default) + Arabic (RTL). The English strings are byte-identical to the
// originals so behaviour (and the test suite) is unchanged unless ?lang=ar / the saved preference says otherwise.
// Safe to import from a worker: everything degrades gracefully without `window`.

const hasDom = typeof window !== 'undefined' && typeof document !== 'undefined';
const qs = hasDom ? new URLSearchParams(location.search) : new Map();
let saved = null;
try { saved = hasDom ? localStorage.getItem('ws.lang') : null; } catch { /* private mode */ }

export const LANG = (qs.get?.('lang') || saved) === 'ar' ? 'ar' : 'en';
export const isRTL = LANG === 'ar';

/** Switch language: persist + reload with ?lang=… so every string (and dir) is rebuilt. */
export function setLang(l) {
  try { localStorage.setItem('ws.lang', l); } catch { /* ignore */ }
  const u = new URL(location.href);
  u.searchParams.set('lang', l);
  location.href = u.toString();
}

// ---------------------------------------------------------------- strings
// value: string, or a function of the interpolated arguments.
const STR = {
  en: {
    // poses
    'pose.open': 'Open hand', 'pose.fist': 'Fist', 'pose.peace': 'Peace', 'pose.point': 'Pointing',
    'pose.moving': 'Moving', 'pose.none': 'No hand', 'pose.pinch': 'Pinch',
    // toasts + events
    'toast.pulled': (l) => `🤏 Pulled out: ${l}`, 'toast.putBack': '🤏 Put back',
    'toast.part': (l, i) => `☝ ${l} — ${i}`,
    'toast.quizStart': '🎓 Quiz: point at the part I name',
    'toast.voiceOff': '🎤 Voice off',
    'toast.voiceOn': '🎤 Listening: say “show me the heart”, “explode”, “next”, “quiz”…',
    'toast.voiceNA': '🎤 Speech recognition is not available here: parts are still read aloud',
    'toast.heard': (text, done) => `🎤 “${text}”${done ? ' → ' + done : ' (not understood)'}`,
    'toast.cutOn': '✂ Cut-away: move your hand (or the mouse) left / right', 'toast.cutOff': '✂ Cut-away off',
    'toast.recNA': 'Recording is not supported in this browser', 'toast.recOn': '⏺ Recording…',
    'toast.recSaved': (mb) => `💾 Saved ${mb} MB video`,
    'toast.camOn': '📷 Camera on — snap your fingers!', 'toast.camOff': 'Camera off',
    'toast.camDenied': 'Camera permission was denied — you can still use the keyboard, mouse and demo.',
    'toast.camMissing': 'No camera found — you can still use the keyboard, mouse and demo.',
    'toast.camError': (m) => `Camera error: ${m}`,
    'toast.demo': '▶ Demo — synthetic hand',
    'toast.handRot': (on) => `🔄 Hand rotation ${on ? 'on' : 'off'}`,
    'toast.snap': '🫰 Snap! Particles summoned',
    'toast.assembling': (n) => `✊ Assembling: ${n}`, 'toast.forming': (n) => `✊ Forming ${n}`,
    'toast.next': (n) => `✌ Next: ${n}`, 'toast.select': (n) => `→ ${n}`,
    'toast.dissolved': '💥 Dissolved',
    'toast.keys': 'Keyboard: Space = snap · F = fist · O = open · E = explode · D = demo · H = help',
    'toast.soundOn': '🔊 Sound on', 'toast.soundOff': '🔇 Sound off',
    'toast.quality': (pct) => `⚡ Frame rate is low — render scale reduced to ${pct}%`,
    'toast.qualityUp': (pct) => `⚡ Render scale restored to ${pct}%`,
    // quiz
    'quiz.score': (s, t) => `🏆 Score ${s} / ${t}`,
    'quiz.correct': (l, i) => `✅ Correct! ${l}: ${i}`,
    'quiz.wrong': (l, tgt) => `❌ That's the ${l}. Here is the ${tgt}.`,
    'quiz.sayDone': (s, t) => `Quiz finished. You scored ${s} out of ${t}.`,
    'quiz.sayFind': (l) => `Find the ${l}`,
    'quiz.sayCorrect': (i) => `Correct! ${i}`,
    'quiz.sayWrong': (l) => `No, that's the ${l}.`,
    'quiz.finished': '🎓 Quiz finished', 'quiz.find': (l) => `🎓 Find: ${l}`, 'quiz.ready': '🎓 Get ready…',
    'quiz.progress': (a, t, s) => `question ${a} / ${t} · score ${s}`,
    'quiz.hint': 'point at it with one finger (or click it)',
    // HUD
    'hud.partOf': (name, i, n) => `${name} · part ${i} of ${n}`,
    'hud.cam': (fps, delegate, ms) => `cam <b>${fps}</b> fps · hands ${delegate} ${ms} ms`,
    'hud.camOff': 'camera off',
    'hud.zoom': (z) => `zoom <b>${z}×</b>`, 'hud.rec': (s) => `● REC ${s} s`, 'hud.listening': '🎤 listening',
    'hud.fps': (fps, k) => `<b>${fps}</b> fps · <b>${k}k</b> particles`,
    'hud.autoQ': (pct) => `· render ${pct}%`,
    // overlay canvas
    'ov.zoom': (z) => `🔍 zoom ${z}×`, 'ov.cut': '✂ cross-section',
    // guide
    'guide.snap': '<b>Snap</b> — summon particles / dissolve',
    'guide.fistM': '<b>Fist</b> — put it together', 'guide.fistW': '<b>Fist</b> — form the wonder',
    'guide.openM': '<b>Open slowly</b> — explode it, see inside', 'guide.openW': '<b>Open hand</b> — morph to the next wonder',
    'guide.twist': '<b>Twist / raise hand</b> — rotate & tilt it',
    'guide.point': '<b>Point</b> at a part to learn it · <b>pinch</b> 🤏 pulls it out',
    'guide.zoom': '<b>Two hands</b> apart / together — zoom',
    'guide.peace': '<b>Peace</b> — jump to the next model',
    // camera status
    'cam.requesting': 'Requesting camera…', 'cam.loading': 'Loading hand tracker…',
    // settings
    'set.title': 'Settings', 'set.lang': 'Language', 'set.particles': 'Particles',
    'set.sound': 'Sound effects', 'set.autoq': 'Auto quality (lowers render scale when slow)',
    'set.trails': 'Particle trails', 'set.reload': 'Changing the particle count reloads the page',
    'set.on': 'On', 'set.off': 'Off',
  },
  ar: {
    'pose.open': 'يد مفتوحة', 'pose.fist': 'قبضة', 'pose.peace': 'علامة النصر', 'pose.point': 'إشارة',
    'pose.moving': 'تتحرك', 'pose.none': 'لا توجد يد', 'pose.pinch': 'قرصة',
    'toast.pulled': (l) => `🤏 تم سحب: ${l}`, 'toast.putBack': '🤏 أُعيد إلى مكانه',
    'toast.part': (l, i) => `☝ ${l} — ${i}`,
    'toast.quizStart': '🎓 اختبار: أشِر إلى الجزء الذي أسمّيه',
    'toast.voiceOff': '🎤 الصوت متوقف',
    'toast.voiceOn': '🎤 أستمع: قل «أرني القلب»، «فكّكه»، «التالي»، «اختبار»…',
    'toast.voiceNA': '🎤 التعرف على الكلام غير متاح هنا: ما زالت الأجزاء تُقرأ بصوت عالٍ',
    'toast.heard': (text, done) => `🎤 «${text}»${done ? ' ← ' + done : ' (لم أفهم)'}`,
    'toast.cutOn': '✂ مقطع عرضي: حرّك يدك (أو الفأرة) يميناً ويساراً', 'toast.cutOff': '✂ تم إيقاف المقطع العرضي',
    'toast.recNA': 'التسجيل غير مدعوم في هذا المتصفح', 'toast.recOn': '⏺ جارٍ التسجيل…',
    'toast.recSaved': (mb) => `💾 تم حفظ فيديو ${mb} م.ب`,
    'toast.camOn': '📷 الكاميرا تعمل — فرقع بأصابعك!', 'toast.camOff': 'الكاميرا متوقفة',
    'toast.camDenied': 'رُفض إذن الكاميرا — ما زال بإمكانك استخدام لوحة المفاتيح والفأرة والعرض التوضيحي.',
    'toast.camMissing': 'لم يتم العثور على كاميرا — ما زال بإمكانك استخدام لوحة المفاتيح والفأرة والعرض التوضيحي.',
    'toast.camError': (m) => `خطأ في الكاميرا: ${m}`,
    'toast.demo': '▶ عرض توضيحي — يد اصطناعية',
    'toast.handRot': (on) => `🔄 التدوير باليد ${on ? 'مفعّل' : 'متوقف'}`,
    'toast.snap': '🫰 فرقعة! تم استدعاء الجزيئات',
    'toast.assembling': (n) => `✊ تجميع: ${n}`, 'toast.forming': (n) => `✊ تشكيل ${n}`,
    'toast.next': (n) => `✌ التالي: ${n}`, 'toast.select': (n) => `← ${n}`,
    'toast.dissolved': '💥 تلاشى',
    'toast.keys': 'لوحة المفاتيح: مسافة = فرقعة · F = قبضة · O = فتح · E = تفكيك · D = عرض · H = مساعدة',
    'toast.soundOn': '🔊 الصوت مفعّل', 'toast.soundOff': '🔇 الصوت متوقف',
    'toast.quality': (pct) => `⚡ معدل الإطارات منخفض — خُفّضت دقة العرض إلى ${pct}٪`,
    'toast.qualityUp': (pct) => `⚡ أُعيدت دقة العرض إلى ${pct}٪`,
    'quiz.score': (s, t) => `🏆 النتيجة ${s} / ${t}`,
    'quiz.correct': (l, i) => `✅ صحيح! ${l}: ${i}`,
    'quiz.wrong': (l, tgt) => `❌ هذا هو ${l}. إليك ${tgt}.`,
    'quiz.sayDone': (s, t) => `انتهى الاختبار. أحرزت ${s} من ${t}.`,
    'quiz.sayFind': (l) => `جِد ${l}`,
    'quiz.sayCorrect': (i) => `صحيح! ${i}`,
    'quiz.sayWrong': (l) => `لا، هذا هو ${l}.`,
    'quiz.finished': '🎓 انتهى الاختبار', 'quiz.find': (l) => `🎓 جِد: ${l}`, 'quiz.ready': '🎓 استعد…',
    'quiz.progress': (a, t, s) => `سؤال ${a} / ${t} · النتيجة ${s}`,
    'quiz.hint': 'أشِر إليه بإصبع واحد (أو انقر عليه)',
    'hud.partOf': (name, i, n) => `${name} · جزء ${i} من ${n}`,
    'hud.cam': (fps, delegate, ms) => `كاميرا <b>${fps}</b> إطار/ث · تتبع ${delegate} ${ms} م.ث`,
    'hud.camOff': 'الكاميرا متوقفة',
    'hud.zoom': (z) => `تكبير <b>‏${z}×</b>`, 'hud.rec': (s) => `● تسجيل ${s} ث`, 'hud.listening': '🎤 أستمع',
    'hud.fps': (fps, k) => `<b>${fps}</b> إطار/ث · <b>${k} ألف</b> جزيء`,
    'hud.autoQ': (pct) => `· دقة ${pct}٪`,
    'ov.zoom': (z) => `🔍 تكبير ${z}×`, 'ov.cut': '✂ مقطع عرضي',
    'guide.snap': '<b>فرقعة</b> — استدعاء الجزيئات / تلاشيها',
    'guide.fistM': '<b>قبضة</b> — جمّعه', 'guide.fistW': '<b>قبضة</b> — شكّل المَعلم',
    'guide.openM': '<b>افتح ببطء</b> — فكّكه وشاهد ما بداخله', 'guide.openW': '<b>يد مفتوحة</b> — تحوّل إلى المَعلم التالي',
    'guide.twist': '<b>لُفّ / ارفع يدك</b> — دوّره وأمِله',
    'guide.point': '<b>أشِر</b> إلى جزء لتتعلمه · <b>القرصة</b> 🤏 تسحبه للخارج',
    'guide.zoom': '<b>يدان</b> تتباعدان / تتقاربان — تكبير',
    'guide.peace': '<b>علامة النصر</b> — انتقل إلى النموذج التالي',
    'cam.requesting': 'جارٍ طلب الكاميرا…', 'cam.loading': 'جارٍ تحميل متتبع اليد…',
    'set.title': 'الإعدادات', 'set.lang': 'اللغة', 'set.particles': 'عدد الجزيئات',
    'set.sound': 'المؤثرات الصوتية', 'set.autoq': 'جودة تلقائية (تخفّض دقة العرض عند البطء)',
    'set.trails': 'ذيول الجزيئات', 'set.reload': 'تغيير عدد الجزيئات يعيد تحميل الصفحة',
    'set.on': 'مفعّل', 'set.off': 'متوقف',
    // static page chrome (applied via data-i18n)
    'brand.sub': 'فرقِع · شكّل · فكّك — بيدك',
    'k.scene': 'المشهد', 'k.hand': 'اليد', 'k.openness': 'انفتاح اليد', 'k.exploded': 'العرض المفكك', 'k.gestures': 'الإيماءات',
    'hint.explode': 'افتح يدك لتفكيكه · أغلقها لإعادة تجميعه',
    'btn.snap': '🫰 فرقعة', 'btn.form': '✊ تشكيل', 'btn.open': '✋ تفكيك', 'btn.next': '✌ التالي',
    'part.pull': '🤏 اسحبه', 'part.speak': '🔊 اقرأه بصوت عالٍ',
    'part.hint': 'أشِر ☝ إلى جزء آخر · اقرص 🤏 لسحب هذا الجزء',
    'start.p': 'معالم ثلاثية الأبعاد متوهجة، جسم الإنسان (الدماغ، قلب ينبض، رئتان تتنفسان، العين، الأذن، الهيكل العظمي…)، الحمض النووي، خلية، محركات ومركبات وآلات مكوّنة من ربع مليون جزيء ضوئي — تتحكم بها يدك أمام الكاميرا.',
    'start.cam': 'ابدأ مع الكاميرا', 'start.nocam': 'تابع بدون كاميرا',
    'title.cam': 'الكاميرا (C)', 'title.labels': 'تسميات الأجزاء (L)', 'title.rotate': 'دوران تلقائي (R)',
    'title.handrot': 'التدوير باليد: لُفّ يدك لتدوير النموذج (G)', 'title.cut': 'مقطع عرضي (X)',
    'title.quiz': 'اختبار: جِد الجزء (Q)', 'title.voice': 'أوامر صوتية + قراءة (M)', 'title.rec': 'تسجيل فيديو (K)',
    'title.demo': 'تشغيل العرض التوضيحي (D)', 'title.help': 'مساعدة لوحة المفاتيح (H)',
    'title.sound': 'المؤثرات الصوتية (S)', 'title.settings': 'الإعدادات',
    'help.title': 'التحكم',
  },
};

/** t('key', ...args) -> localised string (falls back to English, then to the key). */
export const t = (k, ...args) => {
  const v = STR[LANG][k] ?? STR.en[k] ?? k;
  return typeof v === 'function' ? v(...args) : v;
};

// ---------------------------------------------------------------- catalog names + facts (Arabic)
const AR_MODELS = {
  'Turtle Tower': ['برج السلحفاة', 'بحيرة هوان كيم، هانوي · 8.5 م'],
  'Eiffel Tower': ['برج إيفل', 'باريس · 330 م · قاعدة 125 م'],
  'Statue of Liberty': ['تمثال الحرية', 'نيويورك · 93 م من الأرض إلى الشعلة'],
  'Burj Khalifa': ['برج خليفة', 'دبي · 828 م · أعلى مبنى في العالم'],
  'Great Pyramid': ['الهرم الأكبر', 'الجيزة · 146.6 م · قاعدة 230.3 م'],
  'Colosseum': ['الكولوسيوم', 'روما · 189 × 156 م · ارتفاع 48.5 م'],
  'Leaning Tower of Pisa': ['برج بيزا المائل', 'بيزا · 56.7 م · ميل 3.97°'],
  'Taj Mahal': ['تاج محل', 'أغرا · 73 م على قاعدة 95 م'],
  'Big Ben': ['بيغ بن', 'لندن · 96 م · أقراص ساعة بقطر 7 م'],
  'Christ the Redeemer': ['تمثال المسيح الفادي', 'ريو · تمثال 30 م · امتداد ذراعين 28 م'],
  'Sydney Opera House': ['دار أوبرا سيدني', 'سيدني · أصداف حتى 67 م'],
  'Human Brain': ['الدماغ البشري', 'نحو 86 مليار خلية عصبية · 1.4 كغ · يستهلك 20٪ من طاقتك'],
  'Human Heart': ['القلب البشري', '4 حجرات · 4 صمامات · نحو 7000 لتر دم يومياً'],
  'Kidney': ['الكلية', '12 سم · ترشّح نحو 180 لتراً من بلازما الدم يومياً'],
  'Lungs': ['الرئتان', 'نحو 480 مليون حويصلة · 70 م² من سطح تبادل الغازات'],
  'Human Eye': ['العين البشرية', '24 مم · 120 مليون عصية · 6 ملايين مخروط'],
  'Human Ear': ['الأذن البشرية', 'تسمع 20-20000 هرتز · أصغر عظام الجسم'],
  'Tooth (Molar)': ['الضرس', 'مينا وعاج ولب · مثبّت بجذرين'],
  'Skull': ['الجمجمة', '22 عظمة · الفك وحده يتحرك'],
  'Skeleton': ['الهيكل العظمي', '206 عظام · عظم الفخذ هو الأطول'],
  'Human Body': ['جسم الإنسان', '11 جهازاً عضوياً · 37 تريليون خلية'],
  'DNA Double Helix': ['الحمض النووي DNA', '3 مليارات زوج قاعدي · متران في كل خلية · A-T وG-C'],
  'Animal Cell': ['الخلية الحيوانية', 'نحو 20 ميكرومتراً · في الجسم نحو 37 تريليوناً منها'],
  'Inline-4 Engine': ['محرك 4 أسطوانات', 'DOHC بـ16 صماماً · 4 أسطوانات · ترتيب الإشعال 1-3-4-2'],
  'Supercharged HEMI V8': ['محرك HEMI V8 بشاحن', 'V8 بزاوية 90° · غرف احتراق نصف كروية'],
  'Turbofan Jet Engine': ['محرك نفاث توربيني', 'مروحة ← ضواغط ← غرفة احتراق ← توربينات ← فوهة'],
  'Radial Aircraft Engine': ['محرك طائرة شعاعي', '9 أسطوانات · تبريد بالهواء'],
  'Sports Car': ['سيارة رياضية', '440 × 185 × 130 سم · محرك أمامي ودفع خلفي'],
  'Motorcycle': ['دراجة نارية', '210 سم · محرك V مزدوج · نقل بالسلسلة'],
  'Airliner': ['طائرة ركاب', 'طول 37.6 م · باع جناح 34 م · 180 مقعداً'],
  'Saturn V Rocket': ['صاروخ ساترن 5', '110 م · 3 مراحل · حمل أبولو إلى القمر'],
  'Mechanical Watch': ['ساعة ميكانيكية', '40 مم · 28800 ذبذبة في الساعة · احتياطي طاقة 40 ساعة'],
  'EV Battery Pack': ['بطارية سيارة كهربائية', '8 وحدات · 280 خلية · نحو 400 فولت'],
};

const AR_CATS = { Wonders: 'عجائب', Anatomy: 'تشريح', Biology: 'أحياء', Engines: 'محركات', Vehicles: 'مركبات', Machines: 'آلات' };

export const modelName = (def) => (LANG === 'ar' && AR_MODELS[def.name]?.[0]) || def.name;
export const modelFact = (def) => (LANG === 'ar' && AR_MODELS[def.name]?.[1]) || def.fact || '';
export const catName = (c) => (LANG === 'ar' && AR_CATS[c]) || c;

// ---------------------------------------------------------------- static page translation (Arabic only)
const AR_HELP_HTML = `
  <tr><td><kbd>مسافة</kbd></td><td>فرقعة — استدعاء / تلاشي</td></tr>
  <tr><td><kbd>F</kbd> / <kbd>O</kbd></td><td>قبضة (تشكيل) / يد مفتوحة (تحرير)</td></tr>
  <tr><td><kbd>V</kbd> <kbd>→</kbd> <kbd>←</kbd></td><td>النموذج التالي / السابق</td></tr>
  <tr><td><kbd>E</kbd> <kbd>↑</kbd> <kbd>↓</kbd> العجلة</td><td>العرض المفكك (المحركات والسيارة)</td></tr>
  <tr><td>لُفّ اليد</td><td>تدوير النموذج (رفع / خفض = إمالة) · <kbd>G</kbd> تشغيل/إيقاف</td></tr>
  <tr><td>☝ إشارة · 🤏 قرصة</td><td>اختيار جزء (أو النقر عليه) · سحبه للخارج</td></tr>
  <tr><td>🙌 يدان</td><td>تكبير (أيضاً <kbd>+</kbd> <kbd>-</kbd> <kbd>0</kbd>، ctrl + العجلة)</td></tr>
  <tr><td><kbd>X</kbd> <kbd>,</kbd> <kbd>.</kbd></td><td>مقطع عرضي (حرّك اليد / الفأرة)</td></tr>
  <tr><td><kbd>Q</kbd> <kbd>M</kbd> <kbd>K</kbd> <kbd>I</kbd></td><td>اختبار · صوت · تسجيل فيديو · وصف الجزء</td></tr>
  <tr><td>سحب بالفأرة</td><td>تدوير النموذج</td></tr>
  <tr><td><kbd>R</kbd> <kbd>L</kbd> <kbd>T</kbd> <kbd>S</kbd></td><td>دوران تلقائي · تسميات · ذيول · صوت</td></tr>
  <tr><td><kbd>C</kbd> <kbd>D</kbd> <kbd>H</kbd></td><td>الكاميرا · العرض التوضيحي · هذه المساعدة</td></tr>`;

const AR_STEPS_HTML = `
  <li><b>فرقِع</b> بأصابعك لاستدعاء الجزيئات.</li>
  <li>اصنع <b>قبضة</b> لتشكيل مَعلم أو محرك أو سيارة.</li>
  <li><b>افتح</b> يدك: المعالم تتحول إلى التالية — الأعضاء والمحركات والسيارة <b>تتفكك</b> لتُظهر كل جزء بداخلها مع اسمه ووظيفته. أغلق يدك لإعادة تجميعها.</li>
  <li><b>لُفّ</b> يدك لتدوير النموذج، ارفعها أو اخفضها لإمالته؛ <b>يدان</b> للتكبير.</li>
  <li><b>أشِر</b> ☝ إلى جزء لتعرف وظيفته، <b>اقرص</b> 🤏 لسحبه. جرّب الاختبار 🎓 والصوت 🎤 والمقطع العرضي ✂ والتسجيل ⏺.</li>
  <li>أظهر <b>✌</b> للانتقال إلى النموذج التالي.</li>`;

/** Apply the static translations + RTL direction. Call once at boot; no-op in English. */
export function applyStatic() {
  if (!hasDom || LANG !== 'ar') return;
  document.documentElement.lang = 'ar';
  document.documentElement.dir = 'rtl';
  for (const el of document.querySelectorAll('[data-i18n]')) el.textContent = t(el.dataset.i18n);
  for (const el of document.querySelectorAll('[data-i18n-title]')) el.title = t(el.dataset.i18nTitle);
  const help = document.querySelector('#help table');
  if (help) help.innerHTML = AR_HELP_HTML;
  document.querySelector('#help h2') && (document.querySelector('#help h2').textContent = t('help.title'));
  const steps = document.querySelector('#start .steps');
  if (steps) steps.innerHTML = AR_STEPS_HTML;
}
