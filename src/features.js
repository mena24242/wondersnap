// Voice control (Web Speech API), spoken part descriptions, session recording (MediaRecorder) and the
// command parser that turns a sentence into app actions. Kept free of app state so it is easy to test.

/** Spoken nicknames -> catalog names. */
export const ALIASES = {
  heart: 'Human Heart', brain: 'Human Brain', kidney: 'Kidney', kidneys: 'Kidney', lung: 'Lungs', lungs: 'Lungs',
  eye: 'Human Eye', eyes: 'Human Eye', ear: 'Human Ear', ears: 'Human Ear', tooth: 'Tooth (Molar)', teeth: 'Tooth (Molar)', molar: 'Tooth (Molar)',
  skull: 'Skull', skeleton: 'Skeleton', bones: 'Skeleton', body: 'Human Body', human: 'Human Body', dna: 'DNA Double Helix', helix: 'DNA Double Helix',
  cell: 'Animal Cell', car: 'Sports Car', motorcycle: 'Motorcycle', motorbike: 'Motorcycle', bike: 'Motorcycle', plane: 'Airliner',
  airplane: 'Airliner', aeroplane: 'Airliner', airliner: 'Airliner', jet: 'Turbofan Jet Engine', turbofan: 'Turbofan Jet Engine', rocket: 'Saturn V Rocket',
  saturn: 'Saturn V Rocket', watch: 'Mechanical Watch', battery: 'EV Battery Pack', v8: 'Supercharged HEMI V8', hemi: 'Supercharged HEMI V8',
  engine: 'Inline-4 Engine', radial: 'Radial Aircraft Engine', eiffel: 'Eiffel Tower', pyramid: 'Great Pyramid', colosseum: 'Colosseum',
  pisa: 'Leaning Tower of Pisa', taj: 'Taj Mahal', ben: 'Big Ben', liberty: 'Statue of Liberty', burj: 'Burj Khalifa', christ: 'Christ the Redeemer',
  redeemer: 'Christ the Redeemer', opera: 'Sydney Opera House', turtle: 'Turtle Tower',
  // Arabic nicknames (normalised: tashkeel stripped, أ/إ/آ→ا, ى→ي, ة→ه, leading ال removed)
  'قلب': 'Human Heart', 'دماغ': 'Human Brain', 'مخ': 'Human Brain', 'كليه': 'Kidney', 'كلي': 'Kidney',
  'رئه': 'Lungs', 'رئتين': 'Lungs', 'عين': 'Human Eye', 'اذن': 'Human Ear', 'ضرس': 'Tooth (Molar)', 'اسنان': 'Tooth (Molar)',
  'جمجمه': 'Skull', 'هيكل': 'Skeleton', 'عظام': 'Skeleton', 'جسم': 'Human Body', 'دنا': 'DNA Double Helix', 'حمض': 'DNA Double Helix',
  'خليه': 'Animal Cell', 'سياره': 'Sports Car', 'دراجه': 'Motorcycle', 'طائره': 'Airliner', 'طياره': 'Airliner',
  'صاروخ': 'Saturn V Rocket', 'ساعه': 'Mechanical Watch', 'بطاريه': 'EV Battery Pack', 'محرك': 'Inline-4 Engine', 'نفاث': 'Turbofan Jet Engine',
  'ايفل': 'Eiffel Tower', 'هرم': 'Great Pyramid', 'كولوسيوم': 'Colosseum', 'بيزا': 'Leaning Tower of Pisa', 'تاج': 'Taj Mahal',
  'بيغ': 'Big Ben', 'بيج': 'Big Ben', 'حريه': 'Statue of Liberty', 'خليفه': 'Burj Khalifa', 'مسيح': 'Christ the Redeemer',
  'اوبرا': 'Sydney Opera House', 'سلحفاه': 'Turtle Tower',
};
const STOP = new Set(['the', 'and', 'of', 'lobe', 'lobes', 'part', 'parts', 'show', 'me', 'with', 'what', 'this', 'that']);
const words = (s) => s.toLowerCase()
  .replace(/[\u064B-\u0652\u0640]/g, '')                       // Arabic diacritics + tatweel
  .replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه') // normalise letter variants
  .replace(/[^a-z0-9\u0621-\u064a\u0660-\u0669 ]+/g, ' ')      // keep Arabic letters/digits, drop ؟ ، punctuation
  .split(/\s+/).filter(Boolean)
  .map((w) => (/^و.{3,}/.test(w) ? w.slice(1) : w))            // strip the conjunction و ("and…")
  .map((w) => (/^ال.{2,}/.test(w) ? w.slice(2) : w));          // strip the definite article ال

/**
 * Parse a spoken sentence. catalog: [{name}], labels: labels of the current model ([{label}]).
 * Returns a list of actions: {type: 'model', name} | {type: 'part', index} | {type: 'explode'|'assemble'|'next'|'prev'|
 * 'snap'|'dissolve'|'quiz'|'stopQuiz'|'cut'|'zoomIn'|'zoomOut'|'rotate'|'describe'|'record'}.
 */
export function parseCommand(text, catalog, labels = []) {
  const t = ` ${words(text).join(' ')} `, has = (...ws) => ws.some((w) => t.includes(` ${words(w).join(' ')} `));
  const acts = [];
  if (has('stop quiz', 'end quiz', 'quit quiz', 'اوقف الاختبار', 'انه الاختبار')) return [{ type: 'stopQuiz' }];
  if (has('quiz', 'test me', 'اختبار', 'اختبرني', 'كويز')) return [{ type: 'quiz' }];
  if (has('what is this', 'what is that', 'tell me', 'explain', 'describe', 'what does it do', 'ما هذا', 'اشرح', 'وصف', 'ما وظيفته')) acts.push({ type: 'describe' });
  // a part of the current model ("show me the hippocampus")
  let bestPart = -1, bestLen = 0;                          // score = total length of the label's words that were said
  labels.forEach((L, i) => {
    let score = 0;
    for (const w of new Set(words(L.label))) if (w.length >= 4 && !STOP.has(w) && t.includes(` ${w} `)) score += w.length;
    if (score > bestLen) { bestLen = score; bestPart = i; }
  });
  // a model: full name first, then a nickname
  let model = catalog.find((d) => t.includes(` ${words(d.name).join(' ')} `))?.name;
  if (!model) for (const [k, v] of Object.entries(ALIASES)) if (t.includes(` ${k} `)) { model = v; break; }
  if (bestPart >= 0 && (!model || bestLen >= 5)) acts.push({ type: 'part', index: bestPart });
  else if (model) acts.push({ type: 'model', name: model });
  if (has('explode', 'open', 'apart', 'inside', 'expand', 'break', 'فكك', 'فككه', 'فكه', 'فك', 'افتح', 'افتحه', 'فجر', 'بعثر', 'بعثره')) acts.push({ type: 'explode' });
  else if (has('assemble', 'close', 'together', 'contract', 'collapse', 'build', 'جمع', 'جمعه', 'ركب', 'ركبه', 'اغلق', 'سكر', 'ضم')) acts.push({ type: 'assemble' });
  if (has('next', 'تالي', 'الجاي')) acts.push({ type: 'next' });
  if (has('previous', 'go back', 'last one', 'سابق', 'ارجع', 'رجوع')) acts.push({ type: 'prev' });
  if (has('snap', 'summon', 'start', 'فرقع', 'ابدا', 'سناب', 'استدعي')) acts.push({ type: 'snap' });
  if (has('dissolve', 'clear', 'vanish', 'امسح', 'اخف', 'تلاشي')) acts.push({ type: 'dissolve' });
  if (has('cut', 'slice', 'section', 'قص', 'مقطع', 'شريحه')) acts.push({ type: 'cut' });
  if (has('zoom in', 'bigger', 'closer', 'كبر', 'قرب', 'زوم')) acts.push({ type: 'zoomIn' });
  if (has('zoom out', 'smaller', 'further', 'صغر', 'ابعد')) acts.push({ type: 'zoomOut' });
  if (has('rotate', 'spin', 'دور', 'لف')) acts.push({ type: 'rotate' });
  if (has('record', 'recording', 'سجل', 'تسجيل')) acts.push({ type: 'record' });
  return acts;
}

/** Continuous speech recognition (Chrome / Edge: webkitSpeechRecognition). */
export class Voice {
  constructor(onText, lang = 'en-US') {
    this.SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;
    this.supported = !!this.SR;
    this.lang = lang;
    this.onText = onText; this.on = false; this.rec = null; this.last = '';
  }
  start() {
    if (!this.SR) return false;
    const rec = new this.SR();
    rec.continuous = true; rec.interimResults = false; rec.lang = this.lang;
    rec.onresult = (e) => { const r = e.results[e.results.length - 1]; if (r.isFinal !== false) { this.last = r[0].transcript; this.onText(this.last); } };
    rec.onend = () => { if (this.on) { try { rec.start(); } catch { /* already running */ } } };
    rec.onerror = (e) => { if (e.error === 'not-allowed' || e.error === 'service-not-allowed') this.on = false; };
    this.rec = rec; this.on = true;
    try { rec.start(); } catch { /* ignore double start */ }
    return true;
  }
  stop() { this.on = false; try { this.rec?.stop(); } catch { /* ignore */ } }
}

/** Read text aloud (Speech Synthesis). Returns false when the browser has no voice output. */
export function speak(text, lang) {
  if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') return false;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 1.02; u.pitch = 1.0;
  if (lang) u.lang = lang;
  window.speechSynthesis.speak(u);
  return true;
}

/** Records the particle canvas + overlay (labels, hand skeleton) into a WebM video. */
export class Recorder {
  constructor(gl, overlay) { this.gl = gl; this.overlay = overlay; this.on = false; this.t0 = 0; }
  static supported() { return typeof MediaRecorder !== 'undefined' && !!HTMLCanvasElement.prototype.captureStream; }
  start() {
    const W = Math.min(this.gl.width, 1920), H = Math.round((W * this.gl.height) / this.gl.width);
    this.comp = document.createElement('canvas'); this.comp.width = W; this.comp.height = H;
    this.ctx = this.comp.getContext('2d');
    const stream = this.comp.captureStream(30);
    const type = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find((m) => MediaRecorder.isTypeSupported(m)) || '';
    this.type = type || 'video/webm';
    this.chunks = [];
    this.mr = new MediaRecorder(stream, type ? { mimeType: type, videoBitsPerSecond: 8e6 } : undefined);
    this.mr.ondataavailable = (e) => { if (e.data.size) this.chunks.push(e.data); };
    this.mr.start(250);
    this.on = true; this.t0 = performance.now();
  }
  /** Call right after drawing a frame (the WebGL buffer is still valid in the same task). */
  frame() {
    if (!this.on) return;
    const { ctx, comp } = this;
    ctx.drawImage(this.gl, 0, 0, comp.width, comp.height);
    ctx.drawImage(this.overlay, 0, 0, comp.width, comp.height);
  }
  seconds() { return this.on ? (performance.now() - this.t0) / 1000 : 0; }
  stop() {
    return new Promise((resolve) => {
      if (!this.on) { resolve(null); return; }
      this.mr.onstop = () => resolve(new Blob(this.chunks, { type: this.type }));
      this.frame(); this.mr.stop(); this.on = false;
    });
  }
}
