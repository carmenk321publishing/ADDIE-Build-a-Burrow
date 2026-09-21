/* ==========================================================
   Build-a-Burrow — ADDIE Workspace
   Atlantis Learning Archives interaction model:
   Explore -> Choose -> Build -> Review -> Continue.
   Blocks record progress. Stars mark reviewed completion.
   Neither is a score, and nothing is withheld behind them.
   ========================================================== */

const STAGES = ['analyze', 'design', 'develop', 'implement', 'evaluate'];

const state = {
  courseName: '',
  done: new Set(),
  stars: new Set(),
  owned: new Set(),
  title: '',
  design: { aud: '', sub: '', bp: '' },
};

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const val = id => (document.getElementById(id)?.value || '').trim();
const words = t => t.split(/\s+/).filter(Boolean).length;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const sym = id => `<svg class="sym" aria-hidden="true"><use href="#s-${id}"/></svg>`;
const SYMARROW = sym('arrow');
const SYMCARE = sym('care');

/* ==========================================================
   Navigation
   ========================================================== */
/* Fields that belong to each phase, used for the "you didn't check this" nudge */
const STAGE_FIELDS = {
  analyze: '#a_problem, #a_audience, #a_root, #a_solution, #a_success',
  design: '#d_aud, #d_obj, #d_form',
  develop: '#vehicles input, #a11y input, #v_chunk',
  implement: '#i_mode, #i_home, #i_stake, #i_time',
  evaluate: '#e_sum, #e_track, #e_level, #e_data',
};
const nudged = new Set();

function hasWork(key) {
  if (key === 'design' && state.design.bp) return true;
  return $$(STAGE_FIELDS[key] || '').some(el =>
    el.type === 'checkbox' ? el.checked : (el.value || '').trim().length > 0);
}

function nudgeIfUnchecked() {
  const current = $('.stage.is-active')?.dataset.stage;
  if (!current || !STAGES.includes(current)) return;
  if (state.done.has(current) || nudged.has(current) || !hasWork(current)) return;
  nudged.add(current);
  const label = current.charAt(0).toUpperCase() + current.slice(1);
  toast(`${label} has notes waiting. Ask for a review there when you are ready.`, 'review');
}

function goto(name) {
  if (name !== $('.stage.is-active')?.dataset.stage) nudgeIfUnchecked();
  $$('.stage').forEach(s => s.classList.toggle('is-active', s.dataset.stage === name));
  $$('.tab').forEach(t => t.classList.toggle('is-active', t.dataset.goto === name));
  if (name === 'finale') renderScroll();
  saveProgress();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
document.addEventListener('click', e => {
  const g = e.target.closest('[data-goto]');
  if (g) { goto(g.dataset.goto); return; }
});

/* ==========================================================
   Theme
   ========================================================== */
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
let theme = prefersDark.matches ? 'dark' : 'light';
document.documentElement.dataset.theme = theme;
$('#themeBtn').addEventListener('click', () => {
  theme = theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = theme;
});

/* ==========================================================
   Toast
   ========================================================== */
let toastTimer;
function toast(msg, kind = 'note') {
  const t = $('#toast');
  const sym = kind === 'completion' ? 's-star' : kind === 'review' ? 's-care' : 's-continuity';
  t.classList.toggle('is-completion', kind === 'completion');
  t.innerHTML = `<svg class="sym" aria-hidden="true"><use href="#${sym}"/></svg><span></span>`;
  t.querySelector('span').textContent = msg;
  t.hidden = false;
  t.style.animation = 'none';
  void t.offsetWidth;
  t.style.animation = '';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, 3200);
}

/* ==========================================================
   Modals
   ========================================================== */
function openModal(id) {
  const m = document.getElementById(id);
  if (!m) return;
  if (id === 'shopModal') renderShop();
  m.hidden = false;
  m.querySelector('.modal-x')?.focus();
}
function closeModals() { $$('.modal').forEach(m => (m.hidden = true)); }
document.addEventListener('click', e => {
  const opener = e.target.closest('[data-modal]');
  if (opener) { openModal(opener.dataset.modal); return; }
  if (e.target.closest('[data-close]') || e.target.classList.contains('modal')) closeModals();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModals(); });
$('#shopBtn').addEventListener('click', () => openModal('shopModal'));

/* ==========================================================
   Phase cards: hover, focus or tap for a fuller description
   ========================================================== */
const PHASE_DETAIL = {
  analyze: {
    n: 1, title: 'Analyze — find the real problem',
    body: 'Name the gap between what people do now and what they need to do, then ask why it exists. Knowledge and skill gaps respond to learning; motivation, tooling and process problems do not. Decide the smallest thing that could close it — sometimes a one-page job aid beats a course.',
    fields: 'Problem and cause · learners · type of gap · chosen solution · definition of success',
  },
  design: {
    n: 2, title: 'Design — set the goal and the shape',
    body: 'Write what learners will be able to do, not what they will sit through. Strong objectives carry a condition, an action and a standard, and open with a verb you can observe. Then choose a lesson blueprint and plan the small checks along the way.',
    fields: 'Audience · blueprint (ESA, TTT, CLIL, task-based, exam prep) · objectives · formative checks',
  },
  develop: {
    n: 3, title: 'Develop — build it so everyone can use it',
    body: 'Choose the formats that will carry the content, and make sure at least one of them is something learners do rather than receive. Chunk it, caption it, describe your images, and pilot with two people before you build forty screens.',
    fields: 'Materials and formats · accessibility checklist · chunking and pilot plan',
  },
  implement: {
    n: 4, title: 'Implement — launch it properly',
    body: 'The unglamorous part that decides whether anyone finishes: who facilitates, where it lives, when it goes live and who needs to know. Live sessions need a facilitator guide, and anything without tracking needs a manual way to capture who completed it.',
    fields: 'Delivery mode · where it lives · stakeholders · timeline and communication',
  },
  evaluate: {
    n: 5, title: 'Evaluate — check whether it worked',
    body: 'Formative checks happen during, summative evidence comes after, and both should point back at the objectives you wrote in Design. Most teams stop at whether people enjoyed it. One level up — did they learn it, do they do it at work — is where the useful information starts.',
    fields: 'Summative assessment · completion tracking · level measured · evidence and reinforcement',
  },
};

const IDLE_DETAIL = '<span class="pd-idle-text">Hover, focus or tap a phase above to see what it involves.</span>';

function showPhaseDetail(key) {
  const panel = $('#phaseDetail');
  const d = PHASE_DETAIL[key];
  if (!panel || !d) return;
  panel.classList.remove('is-idle');
  panel.innerHTML = `
    <span class="pd-num" aria-hidden="true">${d.n}</span>
    <span class="pd-body">
      <h4>${d.title}</h4>
      <p>${d.body}</p>
      <span class="pd-fields"><strong>You will fill in:</strong> ${d.fields}</span>
      <button type="button" class="pd-open" data-goto="${key}">Open ${key.charAt(0).toUpperCase() + key.slice(1)}${SYMARROW}</button>
    </span>`;
  $$('.phase-card').forEach(c => c.setAttribute('aria-expanded', String(c.dataset.phase === key)));
}

function idlePhaseDetail() {
  const panel = $('#phaseDetail');
  if (!panel) return;
  panel.classList.add('is-idle');
  panel.innerHTML = IDLE_DETAIL;
  $$('.phase-card').forEach(c => c.setAttribute('aria-expanded', 'false'));
}

$$('.phase-card').forEach(card => {
  const key = card.dataset.phase;
  card.addEventListener('mouseenter', () => showPhaseDetail(key));
  card.addEventListener('focus', () => showPhaseDetail(key));
  card.addEventListener('click', e => {
    if (e.target.closest('.pd-open')) return;
    showPhaseDetail(key);
  });
});
idlePhaseDetail();

/* ==========================================================
   Design stage: audience branching + blueprints
   ========================================================== */
const SUBS = {
  kids: [
    ['young-mono', 'Ages 4–7, mostly monolingual class'],
    ['young-bi', 'Ages 4–7, bilingual or mixed-language class'],
    ['primary', 'Ages 8–11, primary'],
    ['teens', 'Ages 12–17, teens'],
  ],
  adults: [
    ['general', 'General English / everyday communication'],
    ['business', 'Business or workplace English'],
    ['exam', 'Exam or certification prep'],
    ['esp', 'English for a specific field (medical, legal, technical, safety)'],
  ],
  teachers: [
    ['onboarding', 'New-hire onboarding'],
    ['pd', 'Ongoing professional development'],
    ['tool', 'Tool or platform training'],
    ['compliance', 'Policy, safety or compliance'],
  ],
};

$('#d_aud').addEventListener('change', e => {
  const v = e.target.value;
  state.design.aud = v;
  const wrap = $('#subBranchWrap');
  const sel = $('#d_sub');
  if (!v) { wrap.hidden = true; sel.innerHTML = '<option value="">Choose one…</option>'; state.design.sub = ''; return; }
  sel.innerHTML = '<option value="">Choose one…</option>' +
    SUBS[v].map(([k, label]) => `<option value="${label}">${label}</option>`).join('');
  wrap.hidden = false;
});
$('#d_sub').addEventListener('change', e => { state.design.sub = e.target.value; });

const BP_NAMES = {
  esa: 'ESA — Engage, Study, Activate',
  ttt: 'TTT — Test, Teach, Test',
  clil: 'CLIL — Content and Language Integrated Learning',
  task: 'Task-Based / Business English',
  prep: 'Exam-Prep Cycle',
};
$$('.bp').forEach(b => b.addEventListener('click', () => {
  $$('.bp').forEach(x => x.classList.remove('is-picked'));
  b.classList.add('is-picked');
  state.design.bp = BP_NAMES[b.dataset.bp];
}));

/* ==========================================================
   Glossary — select any text to look it up
   ========================================================== */
const GLOSSARY = {
  addie: 'A five-phase model for building learning: Analyze, Design, Develop, Implement, Evaluate. Iterative in practice — findings in later phases send you back to earlier ones.',
  analyze: 'Phase one. Work out what the real performance gap is, why it exists, and whether learning is the right fix at all.',
  analysis: 'The work of diagnosing a problem before designing a solution — including who the learners are and what they already know.',
  design: 'Phase two. Decide what learners will be able to do, how you will know, and what shape the learning takes.',
  develop: 'Phase three. Build the actual materials: storyboard, script, media, practice, assessments — then pilot before launch.',
  implement: 'Phase four. Launch it. Facilitator prep, environment and platform setup, enrolment, communication, and data collection from day one.',
  evaluate: 'Phase five. Judge whether it worked, using both formative checks during and summative evidence after.',
  formative: 'Low-stakes checking that happens during learning so you can adjust: knowledge checks, practice, reflection prompts, observation.',
  summative: 'The assessment at the end that provides evidence of whether the objectives were met.',
  objective: 'A statement of what a learner will be able to do, written with an observable verb. Strongest form: condition + action + standard.',
  objectives: 'Statements of what learners will be able to do after the learning, written with observable verbs.',
  udl: 'Universal Design for Learning. Design for learner variability from the start by offering multiple means of engagement, representation, and action/expression.',
  bloom: "Bloom's taxonomy — a ladder of thinking from remembering and understanding up through applying, analysing, evaluating and creating. Used to pick precise objective verbs.",
  blooms: "Bloom's taxonomy — a ladder of thinking from remembering up through applying, analysing, evaluating and creating.",
  taxonomy: 'A classification system. In learning design it usually means Bloom\'s levels of thinking.',
  scaffolding: 'Temporary support that lets a learner do something they could not yet do alone — sentence frames, worked examples, guided steps — removed as competence grows.',
  clil: 'Content and Language Integrated Learning. Teaching subject content and the language needed to access it at the same time.',
  esa: 'Engage, Study, Activate. A lesson shape that hooks interest, examines the language or content closely, then puts it to use in a task.',
  ttt: 'Test, Teach, Test. Learners attempt first so you can teach into the actual gaps, then attempt again.',
  lms: 'Learning Management System — the platform that hosts courses, enrols learners, and tracks completion and scores.',
  microlearning: 'Short, focused learning built around a single objective, usually a few minutes long and usable at the point of need.',
  chunking: 'Breaking content into small, digestible pieces so working memory is not overloaded.',
  storyboard: 'A screen-by-screen or slide-by-slide plan of a course made before building, so structure problems surface cheaply.',
  prototype: 'A rough working sample of part of the course, built to test the approach before committing to the whole thing.',
  pilot: 'A trial run with a small group of real learners to catch problems before full launch.',
  kirkpatrick: 'A four-level way of evaluating training: reaction, learning, behaviour, and results.',
  accessibility: 'Designing so people with disabilities can perceive, operate and understand your content — alt text, captions, contrast, keyboard access.',
  contrast: 'The difference in luminance between text and its background. Aim for about 4.5:1 for body text and 3:1 for large text.',
  transcript: 'A full text version of spoken audio or video, useful for deaf learners, second-language learners, and anyone searching for a phrase.',
  captions: 'Synchronised on-screen text of the audio, essential for deaf and hard-of-hearing learners.',
  stakeholder: 'Anyone with a stake in the training: the requester, the approver, facilitators, the learners, and whoever owns the business problem.',
  rubric: 'A scoring guide that spells out what each level of performance looks like, so marking is consistent and transparent.',
  asynchronous: 'Learning learners do on their own schedule, without a live facilitator present.',
  blended: 'A mix of live sessions and self-paced material.',
  gamification: 'Using game mechanics — progress, points, rewards, narrative — to increase engagement, ideally tied to genuine learning actions.',
  variability: 'The natural spread of learners in any group. UDL treats it as the norm to design for, not an exception to accommodate later.',
  'job aid': 'A short reference used at the moment of need — a checklist, one-pager, or quick-reference card — often a better fit than a course.',
  'front-end analysis': 'Structured investigation before design: problem analysis, needs analysis, audience analysis and task analysis.',
  'knowledge check': 'A quick question or two inside a lesson to confirm understanding and prompt retrieval.',
  'train-the-trainer': 'Preparing the people who will deliver your course, so they teach it as designed.',
  synchronous: 'Learning that happens live, with everyone present at the same time.',
  andragogy: 'The practice of teaching adults — who bring experience, want relevance, and prefer to direct their own learning.',
  pedagogy: 'The method and practice of teaching, and the reasoning behind the choices a teacher makes.',
  differentiation: 'Adjusting content, process, or output to meet learners where they are. UDL builds the flexibility in up front; differentiation adapts in the moment.',
  scaffold: 'Temporary support — a sentence frame, a worked example, a guided step — that lets a learner do something they could not yet do alone, then gets removed.',
  'cognitive load': 'The amount of mental effort a task demands. Too much at once and nothing sticks, which is why chunking and clean design matter.',
  'retrieval practice': 'Making learners pull information out of memory rather than re-reading it. One of the most reliable ways to make learning last.',
  'spaced practice': 'Spreading practice out over time instead of cramming it into one session. Feels slower, remembers longer.',
  'backward design': 'Starting from the outcome you want, then designing the assessment, then the lessons — rather than starting with content and hoping.',
  sme: 'Subject Matter Expert — the person who knows the content. Your job is to turn what they know into something learnable.',
  scorm: 'A technical standard that lets a course package talk to an LMS so completion and scores are tracked.',
  xapi: 'A newer tracking standard that can record learning activity beyond a single course, including things done outside the LMS.',
  'smile sheet': 'The end-of-course satisfaction survey. It tells you whether people enjoyed it, which is not the same as whether they learned anything.',
  'needs analysis': 'Working out the gap between what people currently do and what the situation requires, and what would actually close it.',
  'task analysis': 'Breaking a job task into its component steps and decisions, so you teach the real sequence rather than your assumptions.',
  'design document': 'The agreed plan before building: purpose, audience, objectives, structure, media, measures. It is what stops scope drifting.',
  facilitator: 'The person who runs a live session. Their job is to guide, not to present at people.',
  persona: 'A short sketch of a representative learner — role, context, constraints — used to keep design decisions grounded in someone real.',
  refresher: 'A short revisit of something already taught, designed to bring a skill back rather than introduce it.',
  'completion rate': 'The share of enrolled learners who finish. Low rates are usually a design or relevance problem, not a motivation problem.',
  'job task': 'The actual thing someone has to do at work. Good objectives are written in terms of these, not in terms of topics.',
  audience: 'The specific people you are designing for — how many, what they already know, what constraints they work under. Vague audience, vague course.',
  gap: 'The distance between what people do now and what they need to do. Naming it precisely is the whole job of the Analyze phase.',
  cause: 'Why the gap exists. Symptoms are easy to spot, causes take asking. Only knowledge and skill causes are fixed by training.',
  symptom: 'The visible result of a problem rather than the problem itself. Designing for the symptom is how you build a course nobody needed.',
  condition: 'The circumstances a learner will perform in, such as "given a live class" or "with no reference sheet". It tells you what practice has to look like.',
  standard: 'How well the task must be done: how fast, how accurately, how independently. Without it, "done" is a matter of opinion.',
  artefact: 'Something a learner produces that shows what they can do — a recording, a plan, a worked example. Often better evidence than a quiz.',
  modality: 'The form learning takes: live, self-paced, blended, on the job. Chosen to fit the constraints rather than out of habit.',
  vehicle: 'The format carrying the content — video, text, practice, scenario, job aid. Vary them so one format failing does not fail the learner.',
  chunk: 'A small, self-contained piece of content. Short segments with a check at each seam beat one long stretch.',
  blueprint: 'The lesson shape you build on, such as ESA, TTT, CLIL or task-based. Having any structure beats improvising slides.',
  reinforcement: 'What happens after the course to keep the behaviour alive: manager check-ins, reminders, practice at work. Usually the deciding factor.',
  observation: 'Watching someone do the real task. Slower than a quiz, and far better evidence that the learning transferred.',
  transfer: 'Whether learning actually shows up in the job. The point of the whole exercise, and the thing least often measured.',
  onboarding: 'The first stretch of time in a new role. Dense, high-stakes, and where learning design earns its keep.',
};

const ACRONYMS = new Set(['addie', 'udl', 'clil', 'esa', 'ttt', 'lms']);

function prettyTerm(t) {
  return ACRONYMS.has(t) ? t.toUpperCase() : t.replace(/\b\w/g, c => c.toUpperCase());
}

/* Curated instructional-design glossary first */
function lookupLocal(raw) {
  const clean = raw.toLowerCase().replace(/[^a-z' -]/g, '').replace(/\s+/g, ' ').trim();
  if (!clean || clean.length < 2 || words(clean) > 4) return null;
  if (GLOSSARY[clean]) return [clean, GLOSSARY[clean]];
  const stems = [
    clean.replace(/ies$/, 'y'),
    clean.replace(/(ing|ed|es|s)$/, ''),
    clean.replace(/(ing|ed)$/, 'e'),
  ];
  for (const st of stems) if (st && GLOSSARY[st]) return [st, GLOSSARY[st]];
  const hit = Object.keys(GLOSSARY).find(k => k === clean + 's' || k.split(' ')[0] === clean);
  return hit ? [hit, GLOSSARY[hit]] : null;
}

/* Plain-English fallback for ordinary words, via free public dictionaries */
const dictCache = new Map();

/* Strip markup safely: we only ever read text back out, never inject the HTML */
function plainText(html) {
  const stripped = String(html).replace(/<[^>]*>/g, '');
  const ta = document.createElement('textarea');
  ta.innerHTML = stripped;
  return ta.value.replace(/\s+/g, ' ').trim();
}

async function getJSON(url, ms) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/* Wiktionary first — fast and reliable. Falls back to a second dictionary. */
async function lookupDictionary(raw) {
  const word = raw.toLowerCase().replace(/[^a-z'-]/g, '').trim();
  if (!word || word.length < 2) return null;
  if (dictCache.has(word)) return dictCache.get(word);

  const senses = [];

  const wikt = await getJSON('https://en.wiktionary.org/api/rest_v1/page/definition/' + encodeURIComponent(word), 7000);
  const entries = wikt?.en || [];
  for (const entry of entries) {
    for (const d of entry.definitions || []) {
      const def = plainText(d.definition || '');
      if (def && def.length > 2) senses.push({ pos: (entry.partOfSpeech || '').toLowerCase(), def });
      if (senses.length >= 3) break;
    }
    if (senses.length >= 3) break;
  }

  if (!senses.length) {
    const alt = await getJSON('https://api.dictionaryapi.dev/api/v2/entries/en/' + encodeURIComponent(word), 9000);
    for (const entry of Array.isArray(alt) ? alt : []) {
      for (const m of entry.meanings || []) {
        for (const d of m.definitions || []) {
          if (d.definition) senses.push({ pos: (m.partOfSpeech || '').toLowerCase(), def: d.definition });
          if (senses.length >= 3) break;
        }
        if (senses.length >= 3) break;
      }
      if (senses.length >= 3) break;
    }
  }

  const out = senses.length ? { word, senses } : null;
  dictCache.set(word, out);
  return out;
}

/* ==========================================================
   Glossary popup — appears next to the highlighted word
   ========================================================== */
const pop = document.createElement('div');
pop.className = 'gloss-pop';
pop.setAttribute('role', 'dialog');
pop.setAttribute('aria-live', 'polite');
pop.hidden = true;
document.body.appendChild(pop);

let popLocked = false;

function placePop(rect) {
  pop.hidden = false;
  pop.style.visibility = 'hidden';
  pop.style.left = '0px';
  pop.style.top = '0px';
  const pw = Math.min(pop.offsetWidth || 320, window.innerWidth - 24);
  const ph = pop.offsetHeight || 140;
  let left = rect.left + rect.width / 2 - pw / 2;
  left = Math.max(12, Math.min(left, window.innerWidth - pw - 12));
  let top = rect.bottom + 10;
  let flip = false;
  if (top + ph > window.innerHeight - 12) {
    const above = rect.top - ph - 10;
    if (above > 12) { top = above; flip = true; }
    else top = Math.max(12, window.innerHeight - ph - 12);
  }
  top = Math.max(12, Math.min(top, window.innerHeight - ph - 12));
  pop.classList.toggle('is-above', flip);
  pop.style.left = Math.round(left) + 'px';
  pop.style.top = Math.round(top) + 'px';
  pop.style.visibility = 'visible';
}

function renderPop(html, rect) {
  pop.innerHTML = `<button class="gloss-x" type="button" aria-label="Close">✕</button>${html}`;
  placePop(rect);
}

function hidePop() { pop.hidden = true; popLocked = false; }

pop.addEventListener('click', e => { if (e.target.closest('.gloss-x')) hidePop(); });

async function showDefinition(text, rect) {
  const local = lookupLocal(text);
  if (local) {
    renderPop(`
      <span class="gloss-tag">Instructional-design glossary</span>
      <h4>${esc(prettyTerm(local[0]))}</h4>
      <p>${esc(local[1])}</p>`, rect);
    return;
  }

  const label = text.length > 32 ? text.slice(0, 32) + '…' : text;
  renderPop(`
    <span class="gloss-tag">Looking it up…</span>
    <h4>${esc(label)}</h4>
    <p class="gloss-loading"><span></span><span></span><span></span></p>`, rect);

  const entry = await lookupDictionary(text);
  if (pop.hidden) return;

  const q = encodeURIComponent(text.slice(0, 60));

  if (entry) {
    const senses = entry.senses.map(s => `
      <p class="gloss-sense">${s.pos ? `<em class="gloss-pos">${esc(s.pos)}</em> ` : ''}${esc(s.def)}
      ${s.example ? `<span class="gloss-eg">“${esc(s.example)}”</span>` : ''}</p>`).join('');
    renderPop(`
      <span class="gloss-tag">Dictionary</span>
      <h4>${esc(entry.word)}</h4>
      ${senses}`, rect);
  } else {
    renderPop(`
      <span class="gloss-tag">Not found here</span>
      <h4>${esc(label)}</h4>
      <p>No definition for this one — it may be a phrase, a name, or a typo.</p>
      <p><a href="https://www.merriam-webster.com/dictionary/${q}" target="_blank" rel="noopener">Try Merriam-Webster →</a></p>`, rect);
  }
}

/* Trigger: works for mouse drag-select and mobile tap-and-hold */
let selTimer;
function handleSelection() {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
  const text = sel.toString().trim();
  if (!text || text.length < 2 || words(text) > 4) return;
  const node = sel.anchorNode;
  const host = node?.nodeType === 1 ? node : node?.parentElement;
  if (host?.closest('textarea, input, select, .gloss-pop')) return;
  const rect = sel.getRangeAt(0).getBoundingClientRect();
  if (!rect || (!rect.width && !rect.height)) return;
  popLocked = true;
  showDefinition(text, rect);
}

document.addEventListener('selectionchange', () => {
  clearTimeout(selTimer);
  selTimer = setTimeout(handleSelection, 320);
});
document.addEventListener('mousedown', e => {
  if (!pop.hidden && !e.target.closest('.gloss-pop')) hidePop();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') hidePop(); });
window.addEventListener('resize', hidePop);
window.addEventListener('scroll', () => { if (!pop.hidden) hidePop(); }, { passive: true });

/* ==========================================================
   Feedback engine (rule-based)
   Each checker returns { tone, title, notes[] }
   tone: 'good' | 'almost' | 'revise'
   ========================================================== */
const BLOOM_VERBS = ['identify','list','name','recall','label','define','select','state','recognise','recognize','match',
  'describe','summarise','summarize','paraphrase','classify','interpret','illustrate','explain','distinguish',
  'demonstrate','use','apply','carry','solve','implement','perform','execute','operate','calculate','complete','share','write','present',
  'compare','contrast','differentiate','organise','organize','analyse','analyze','attribute','diagnose','examine','deconstruct',
  'judge','critique','justify','recommend','prioritise','prioritize','defend','evaluate','assess','appraise','select',
  'create','design','compose','plan','construct','produce','devise','adapt','develop','formulate','build'];
const VAGUE_VERBS = ['understand','know','be aware','appreciate','learn about','be familiar','realise','realize','grasp','comprehend','get a feel'];
const METHOD_WORDS = ['watch','read the','listen to the','attend','complete the module','click through','review the slides','sit through'];

function tone(score) { return score >= 2 ? 'good' : score >= 1 ? 'almost' : 'revise'; }

const CHECKS = {
  analyze() {
    const p = val('a_problem'), a = val('a_audience'), r = val('a_root'), s = val('a_solution'), su = val('a_success');
    const notes = [];
    let score = 2;

    if (words(p) < 12) { notes.push('Your problem statement is very short. Push it to a full sentence or two — who is doing what now, and what does that cost?'); score -= 1; }
    else notes.push({ ok: 'You described the problem in enough detail to work with.' });

    const hasCause = /(because|due to|since|as a result of|the reason|caused by|nobody |no one |never )/i.test(p);
    if (!hasCause) { notes.push('I can see the symptom but not the cause. Add a "because…" clause — a gap with no cause behind it usually gets solved with the wrong tool.'); score -= 1; }
    else notes.push({ ok: 'You named a cause, not just a symptom. That is the part most people skip.' });

    if (words(a) < 8) { notes.push('Sharpen the audience. How many people, what do they already know, and how much time do they realistically have?'); score -= 0.5; }
    else notes.push({ ok: 'The audience is concrete enough to design for.' });

    if (!r) { notes.push('Pick a gap type. It changes everything downstream.'); score -= 1; }
    else if (r === 'motivation' || r === 'tools' || r === 'process') {
      notes.push(`You have identified a ${r === 'motivation' ? 'motivation' : r} problem — which training usually cannot fix on its own. That is a genuinely useful finding: flag it to your stakeholder and pair any learning with the real fix.`);
    } else notes.push({ ok: `A ${r} gap is squarely in learning-design territory. Good — a course can actually move this.` });

    if (!s) { notes.push('Choose the smallest solution that could work. Reaching for "full course" by default is the most expensive habit in this field.'); score -= 1; }
    else if (s === 'course' && /^(knowledge)$/.test(r) && words(p) < 25) {
      notes.push('You have gone straight to a full course off a fairly short diagnosis. Worth a sanity check: would a one-pager or a single microlesson get most of the result for a tenth of the effort?');
      score -= 0.5;
    } else notes.push({ ok: 'You matched the size of the solution to the size of the problem.' });

    if (words(su) < 6) { notes.push('Write down how you would know it worked, in observable terms. This sentence becomes your Evaluate phase later, so it is worth two minutes now.'); score -= 1; }
    else if (!/\d|half|fewer|drop|reduce|increase|within|per |rate|less|more/i.test(su)) {
      notes.push('Your success measure is directional but not measurable. Add a number, a timeframe, or a "compared to what".');
      score -= 0.5;
    } else notes.push({ ok: 'Your success measure is specific enough to actually check later.' });

    const t = tone(score);
    return { tone: t, title: t === 'good' ? 'The foundation is sound' : t === 'almost' ? 'Nearly sound — two things to firm up' : 'Worth digging a little deeper first', notes };
  },

  design() {
    const objRaw = val('d_obj');
    const objs = objRaw.split('\n').map(l => l.trim()).filter(l => l.length > 3);
    const form = val('d_form');
    const notes = [];
    let score = 2;

    if (!state.design.aud) { notes.push('Choose an audience. A lesson for seven-year-olds and a lesson for compliance officers are not the same lesson.'); score -= 1; }
    else notes.push({ ok: `Audience locked in — ${state.design.sub || state.design.aud}. Clear enough to make design decisions with.` });

    if (!state.design.bp) { notes.push('Pick a blueprint. Any of them beats "some slides and a quiz" — and you can adapt once it is chosen.'); score -= 1; }
    else notes.push({ ok: `${state.design.bp} chosen — you now have a shape to hang content on.` });

    if (!objs.length) { notes.push('Write at least one objective. Everything in Develop and Evaluate hangs off this line.'); score -= 2; }
    else {
      const bad = [], noVerb = [], methody = [];
      objs.forEach(o => {
        const low = o.toLowerCase();
        if (VAGUE_VERBS.some(v => low.includes(v))) bad.push(o);
        const first = low.replace(/^(given|when|during|after|before|while|in|with|using|by)\b[^,]*,\s*/, '').replace(/^(the )?(learner|learners|teacher|teachers|participant|participants|student|students)\s+(will be able to|will|can|should)\s*/, '').trim().split(/\s+/)[0] || '';
        if (!BLOOM_VERBS.includes(first.replace(/[^a-z]/g, ''))) noVerb.push(o);
        if (METHOD_WORDS.some(m => low.includes(m))) methody.push(o);
      });

      if (bad.length) {
        notes.push(`"${esc(bad[0].slice(0, 70))}" uses a verb you cannot observe. Ask yourself: what would I actually see them do if they understood? Use that verb instead.`);
        score -= 1;
      }
      if (noVerb.length && !bad.length) {
        notes.push(`"${esc(noVerb[0].slice(0, 70))}" does not start with a clear action verb. Open the Bloom's cheat sheet and swap the opening word — the rest of the sentence is probably fine.`);
        score -= 0.5;
      }
      if (methody.length) {
        notes.push(`"${esc(methody[0].slice(0, 70))}" describes an activity rather than a capability. Watching a video is the how; write the what, and leave yourself more than one route to it.`);
        score -= 0.5;
      }
      const conditioned = objs.some(o => /^(given|when|during|after|before|while)\b|\b(in a|with a|using a|during a)\b/i.test(o));
      const standard = objs.some(o => /\b(within|without|at\s+least|no\s+more\s+than|correctly|accurately|unaided|independently|first\s+time|in\s+under|under\s+\d|in\s+\d|to\s+standard|per\s+\w+)\b/i.test(o));
      if (!bad.length && !noVerb.length) notes.push({ ok: 'Your objectives open with observable verbs. That is the hard part done.' });
      if (!conditioned) notes.push('Add a condition to at least one objective — "Given a live class…", "When a learner asks…". It tells you what practice has to look like.');
      else notes.push({ ok: 'At least one objective sets the condition, so you know what practice must simulate.' });
      if (!standard) { notes.push('None of your objectives has a standard yet. How well, how fast, or how many times? Without it, "done" is a matter of opinion.'); score -= 0.5; }
      else notes.push({ ok: 'You included a standard, so success is checkable rather than debatable.' });
    }

    if (words(form) < 6) { notes.push('Plan your formative checks here rather than bolting a quiz on at the end. Two knowledge checks and one reflection prompt is enough to start.'); score -= 0.5; }
    else notes.push({ ok: 'Formative checks are planned in, not tacked on.' });

    const t = tone(score);
    return { tone: t, title: t === 'good' ? 'A blueprint someone else could follow' : t === 'almost' ? 'Good structure — tighten the objectives' : 'The blueprint needs another pass', notes };
  },

  develop() {
    const veh = $$('#vehicles input:checked').map(i => i.value);
    const a11y = $$('#a11y input:checked').map(i => i.value);
    const chunk = val('v_chunk');
    const notes = [];
    let score = 2;

    if (veh.length === 0) { notes.push('Choose at least a couple of materials. A course that is only one format will always lose somebody.'); score -= 2; }
    else if (veh.length === 1) { notes.push(`Only ${esc(veh[0].toLowerCase())} so far. Add a second route to the same content — that is the whole point of designing for variability rather than trying to predict "learning styles".`); score -= 1; }
    else notes.push({ ok: `${veh.length} formats selected — learners have more than one way in.` });

    const hasPractice = veh.some(v => /practice|scenario|knowledge check|live/i.test(v));
    if (!hasPractice) { notes.push('Everything you picked is something learners receive; nothing is something they do. Add practice, a scenario, or knowledge checks — people do not learn a skill by watching it.'); score -= 1; }
    else notes.push({ ok: 'You included something learners actually do, not just consume.' });

    if (a11y.length < 4) { notes.push(`Only ${a11y.length} of 8 accessibility items ticked. Each unticked box is a learner locked out. Captions, alt text and contrast are the three that pay off fastest.`); score -= 1; }
    else if (a11y.length < 7) { notes.push(`${a11y.length} of 8 ticked — good, and the remaining ones are usually the cheapest. Worth finishing the set.`); }
    else notes.push({ ok: 'Accessibility is genuinely covered rather than promised. This is rarer than it should be.' });

    const capImportant = veh.some(v => /video|narrated|audio/i.test(v));
    if (capImportant && !a11y.some(v => /Captions/i.test(v))) {
      notes.push('You have video or narration but no captions or transcripts. That is the single most common accessibility failure in e-learning — and the easiest to fix.');
      score -= 1;
    }

    if (words(chunk) < 8) { notes.push('Say how you will chunk it and who will pilot it. "Four lessons of eight minutes, piloted by two colleagues in week three" is enough.'); score -= 1; }
    else {
      if (!/pilot|test|try|review|colleague|feedback|watch/i.test(chunk)) { notes.push('No pilot mentioned. Two real learners clicking through a draft will find more problems in ten minutes than you will in a day of proofreading.'); score -= 0.5; }
      else notes.push({ ok: 'You planned a pilot. Watch where they hesitate rather than asking whether they liked it.' });
      if (!/\d/.test(chunk)) notes.push('Add numbers to your chunking — how many segments, how many minutes each. Vague length becomes 45 minutes by accident.');
      else notes.push({ ok: 'Your chunking has actual numbers, so scope is controlled.' });
    }

    const t = tone(score);
    return { tone: t, title: t === 'good' ? 'Well built, and open to everyone' : t === 'almost' ? 'Sound build — a couple of doors to widen' : 'Some walls are still missing', notes };
  },

  implement() {
    const mode = val('i_mode'), home = val('i_home'), stake = val('i_stake'), time = val('i_time');
    const notes = [];
    let score = 2;

    if (!mode) { notes.push('Pick a delivery mode. It determines almost every logistic that follows.'); score -= 1; }
    else notes.push({ ok: `${mode === 'async' ? 'Self-paced' : mode === 'live' ? 'Live' : 'Blended'} delivery chosen.` });

    if (!home) { notes.push('Decide where it lives. A course with no home gets shared once and lost.'); score -= 1; }
    else if (home === 'link' || home === 'live-only') {
      notes.push('Without an LMS you will have no completion data, which makes your Evaluate phase much harder. If that is the constraint, plan a manual way to capture who finished.');
      score -= 0.5;
    } else notes.push({ ok: 'It has a home with tracking, so completion data will exist when you need it.' });

    if (words(stake) < 8) { notes.push('Name your stakeholders and what each one needs. Unnamed approvers are how launch dates slip.'); score -= 1; }
    else {
      notes.push({ ok: 'Stakeholders are named with their needs attached.' });
      if (mode !== 'async' && !/facilitat|trainer|lead|deliver|host|present/i.test(stake)) {
        notes.push('This has a live component but no facilitator mentioned. If someone else delivers it, they need a train-the-trainer pass and a facilitator guide, or your design gets improvised away.');
        score -= 0.5;
      }
    }

    if (words(time) < 8) { notes.push('Add dates and a launch channel. "Soon" is not a timeline, and learners cannot take a course they never hear about.'); score -= 1; }
    else {
      if (!/\d|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|week|quarter/i.test(time)) { notes.push('Your timeline has no actual dates. Put a real day on the launch, even a provisional one.'); score -= 0.5; }
      else notes.push({ ok: 'There is a real timeline attached.' });
      if (!/email|announce|pin|post|newsletter|meeting|slack|community|onboarding|invite/i.test(time)) notes.push('How will learners find out? Name the channel, and lead with why it matters to them rather than that it exists.');
      else notes.push({ ok: 'You planned how learners will hear about it.' });
    }

    const t = tone(score);
    return { tone: t, title: t === 'good' ? 'Ready for people to move in' : t === 'almost' ? 'Nearly ready — tighten the logistics' : 'The launch plan needs specifics', notes };
  },

  evaluate() {
    const sum = val('e_sum'), track = val('e_track'), level = val('e_level'), data = val('e_data');
    const notes = [];
    let score = 2;

    if (words(sum) < 8) { notes.push('Describe the summative assessment properly. What exactly does a learner do to show they have got it?'); score -= 1; }
    else {
      notes.push({ ok: 'You have a concrete summative assessment.' });
      if (!/or |alternativ|instead|either|another way|option|choice|recording|submit|demonstrat/i.test(sum)) {
        notes.push('Only one way to demonstrate learning. For content knowledge, offer a second route — a short recording, a worked example, a submitted artefact — marked against the same objectives. Same standard, different door.');
        score -= 0.5;
      } else notes.push({ ok: 'You offered more than one way to demonstrate the same standard. That is UDL doing real work.' });
      if (!/objective|standard|criteri|rubric|against/i.test(sum)) notes.push('Tie the assessment explicitly back to your objectives. If it does not test what you wrote in Design, one of the two is wrong.');
    }

    if (!track) { notes.push('Decide how completion is tracked, or you will be guessing in three months.'); score -= 1; }
    else if (track === 'self') { notes.push('Self-report tracking is fine for a low-stakes refresher, but it will not survive a stakeholder asking "did it work?". Pair it with something observable.'); score -= 0.5; }
    else notes.push({ ok: 'Completion tracking is defined.' });

    if (!level) { notes.push('Choose how far up you will measure. Being honest about it now is better than discovering later that you only have smile-sheet data.'); score -= 1; }
    else if (level === '1') { notes.push('Reaction data only tells you whether people enjoyed it, which barely correlates with whether they learned anything. One level up — a short check against your objectives — costs very little.'); score -= 1; }
    else if (level === '2') { notes.push({ ok: 'Measuring learning, not just satisfaction. That is already better than most.' }); notes.push('If you can, add one on-the-job signal later — even a single manager check-in counts as behaviour-level evidence.'); }
    else notes.push({ ok: `Measuring at the ${level === '3' ? 'behaviour' : 'results'} level — this is the evidence that earns your next project.` });

    if (words(data) < 8) { notes.push('Name the data you will look at, and who else has to change for the behaviour to stick.'); score -= 1; }
    else {
      notes.push({ ok: 'You identified the data that will answer the question.' });
      if (!/manager|lead|supervisor|team|coach|stakeholder|reinforce|follow.?up|check.?in/i.test(data)) {
        notes.push('One last thing, and it is the one everybody forgets: a course can build skill and confidence, but whether people keep doing it on the job is mostly down to their manager. Name who will reinforce it.');
        score -= 0.5;
      } else notes.push({ ok: 'You named who reinforces the behaviour after the course ends. That is what makes it stick.' });
    }

    const t = tone(score);
    return { tone: t, title: t === 'good' ? 'The roof holds, and you can show it' : t === 'almost' ? 'A good plan — measure one level higher' : 'This is a survey, not an evaluation yet', notes };
  },
};

const BADGE = { good: 's-check', almost: 's-reflection', revise: 's-care' };

$$('.check-btn').forEach(btn => btn.addEventListener('click', () => {
  const key = btn.dataset.check;
  const res = CHECKS[key]();
  const box = $(`[data-fb="${key}"]`);
  box.dataset.tone = res.tone;
  box.hidden = false;

  const items = res.notes.map(n =>
    typeof n === 'string' ? `<li>${n}</li>` : `<li class="ok">${n.ok}</li>`
  ).join('');

  const advance = res.tone !== 'revise';
  const nextIdx = STAGES.indexOf(key) + 1;
  const nextName = nextIdx < STAGES.length ? STAGES[nextIdx] : 'finale';
  const nextLabel = nextIdx < STAGES.length
    ? `Continue to ${nextName.charAt(0).toUpperCase() + nextName.slice(1)}`
    : 'Review the outline';

  box.innerHTML = `
    <div class="fb-head">
      <span class="fb-badge" aria-hidden="true"><svg class="sym"><use href="#${BADGE[res.tone]}"/></svg></span>
      <span class="fb-title">${res.title}</span>
    </div>
    <ul>${items}</ul>
    ${res.tone === 'almost' ? '<p class="hint">Recorded, and the phase is built. The open notes above are worth one more pass before you develop anything.</p>' : ''}
    ${advance
      ? `<button class="btn btn-primary" data-goto="${nextName}">${nextLabel}${SYMARROW}</button>`
      : `<p class="hint" style="margin:0">Revise what you can above and ask for another review when you are ready. This is your judgment to make \u2014 you can also record the phase as it stands and come back to it.</p>
         <div style="margin-top:.75rem"><button class="btn btn-secondary" data-partial="${key}" data-goto="${nextName}">Record as it stands and continue${SYMARROW}</button></div>`}
  `;

  if (advance) completeStage(key);
  box.scrollIntoView({ behavior: 'smooth', block: 'center' });
}));

/* Half credit when someone chooses to move on without a clean pass */
document.addEventListener('click', e => {
  const p = e.target.closest('[data-partial]');
  if (p) completeStage(p.dataset.partial, false);
});

/* Make it obvious where the scoring happens */
$$('.check-btn').forEach(btn => {
  const note = document.createElement('p');
  note.className = 'check-hint';
  note.innerHTML = `${SYMCARE}<span>Ask for a review here before you move on. Reviewing is what records the phase and adds the next block to the burrow \u2014 moving between tabs on its own does not.</span>`;
  btn.closest('.stage-foot').insertAdjacentElement('beforebegin', note);
});

/* ==========================================================
   Progress, apples, burrow building
   ========================================================== */
const LABELS = ['Nothing built yet', 'Foundation dug', 'Blueprint drawn', 'Door and chimney in', 'Path and garden laid', 'Burrow complete'];

function completeStage(key, reviewed = true) {
  const isNew = !state.done.has(key);
  state.done.add(key);
  if (reviewed) state.stars.add(key);

  if (isNew) {
    const label = key.charAt(0).toUpperCase() + key.slice(1);
    const nextIdx = STAGES.indexOf(key) + 1;
    const next = nextIdx < STAGES.length
      ? STAGES[nextIdx].charAt(0).toUpperCase() + STAGES[nextIdx].slice(1)
      : 'review your outline';
    toast(
      reviewed
        ? `${label} recorded. One archive star added. Next: ${next}.`
        : `${label} recorded with open notes. Next: ${next}.`,
      reviewed ? 'completion' : 'note'
    );
  }
  refresh();
  if (state.done.size === 5) setTimeout(() => goto('finale'), 1100);
}

function refresh() {
  const n = state.done.size;
  $('#doneCount').textContent = n;
  $('#progressLabel').textContent = LABELS[n];

  /* Build blocks — the ADDIE signature element */
  $$('#progressTrack .blk').forEach((b, i) => b.classList.toggle('is-set', state.done.has(STAGES[i])));

  /* Archive stars — quiet acknowledgement, one per reviewed phase */
  const stars = state.stars.size;
  const row = $('#starsRow');
  if (stars > 0) {
    row.hidden = false;
    row.innerHTML = STAGES.map((_, i) =>
      `<svg class="sym${i < stars ? '' : ' is-empty'}" aria-hidden="true"><use href="#s-star"/></svg>`
    ).join('') + `<span>${stars} of 5 phases reviewed</span>`;
  } else {
    row.hidden = true;
  }

  $$('#checklist li').forEach(li => li.classList.toggle('is-done', state.done.has(li.dataset.c)));
  $$('.tab').forEach(t => t.classList.toggle('is-done', state.done.has(t.dataset.goto)));

  const built = STAGES.map((s, i) => (state.done.has(s) ? i + 1 : '')).join('');
  $('#burrowStage').dataset.built = built || '0';

  const tb = $('#titleBadge');
  if (state.title) { tb.hidden = false; tb.querySelector('span').textContent = state.title; }

  saveProgress();
}

/* ==========================================================
   Shop
   ========================================================== */
const SHOP = [
  { id: 'window', name: 'Round window', blurb: 'A second window on the hillside, for watching the weather.', cls: 'shop-window' },
  { id: 'flowers', name: 'Flower patch', blurb: 'Wildflowers along the front path.', cls: 'shop-flowers' },
  { id: 'bench', name: 'Garden bench', blurb: 'Somewhere to sit and reconsider your objectives.', cls: 'shop-bench' },
  { id: 'mailbox', name: 'Mailbox', blurb: 'For stakeholder feedback.', cls: 'shop-mailbox' },
  { id: 'tree', name: 'Old oak', blurb: 'A broad tree by the fence.', cls: 'shop-tree' },
  { id: 'title', name: 'Archive title', blurb: 'Adds "Course Builder" beside your progress.', cls: null },
];

function renderShop() {
  $('#shopGrid').innerHTML = SHOP.map(it => {
    const owned = state.owned.has(it.id);
    return `<article class="shop-item ${owned ? 'owned' : ''}">
      <h4>${it.name}</h4>
      <p>${it.blurb}</p>
      <button class="buy" data-buy="${it.id}">
        <svg class="sym"><use href="#s-${owned ? 'check' : 'plus'}"/></svg>${owned ? 'Placed' : 'Add to the hillside'}
      </button>
    </article>`;
  }).join('');
}

document.addEventListener('click', e => {
  const b = e.target.closest('[data-buy]');
  if (!b) return;
  const item = SHOP.find(i => i.id === b.dataset.buy);
  if (!item || state.owned.has(item.id)) return;
  state.owned.add(item.id);
  if (item.cls) $('.' + item.cls)?.classList.add('is-owned');
  if (item.id === 'title') state.title = 'Course Builder';
  toast(`${item.name} placed on the hillside.`);
  refresh();
  renderShop();
});

/* ==========================================================
   Course Design Scroll
   ========================================================== */
const NONE = '— not answered —';
const pick = (id, map) => map[val(id)] || NONE;

function scrollData() {
  const veh = $$('#vehicles input:checked').map(i => i.value);
  const a11y = $$('#a11y input:checked').map(i => i.value);
  const missing = $$('#a11y input:not(:checked)').map(i => i.value);
  return [
    ['1 · Analyze — the foundation', [
      ['Problem and cause', val('a_problem') || NONE],
      ['Learners', val('a_audience') || NONE],
      ['Type of gap', pick('a_root', { knowledge: 'Knowledge gap — they don’t know', skill: 'Skill gap — they know but can’t do it yet', motivation: 'Motivation gap — they can, but won’t', tools: 'Tools or environment problem', process: 'Process or policy problem' })],
      ['Chosen solution', pick('a_solution', { 'job-aid': 'A one-page job aid or checklist', micro: 'A single microlesson (5–10 min)', course: 'A full self-paced course', live: 'A live workshop or webinar', blend: 'A blend of live and self-paced', 'not-training': 'Not training — a fix elsewhere' })],
      ['Definition of success', val('a_success') || NONE],
    ]],
    ['2 · Design — the blueprint', [
      ['Audience', state.design.sub || state.design.aud || NONE],
      ['Blueprint / methodology', state.design.bp || NONE],
      ['Learning objectives', val('d_obj') || NONE],
      ['Formative checks', val('d_form') || NONE],
    ]],
    ['3 · Develop — the build', [
      ['Materials and formats', veh.length ? veh.join(', ') : NONE],
      ['Accessibility committed to', a11y.length ? a11y.join(', ') : NONE],
      ['Accessibility still open', missing.length ? missing.join(', ') : 'Nothing outstanding'],
      ['Chunking and pilot plan', val('v_chunk') || NONE],
    ]],
    ['4 · Implement — moving in', [
      ['Delivery mode', pick('i_mode', { async: 'Self-paced / asynchronous', live: 'Live (in person or virtual)', blend: 'Blended — live plus self-paced' })],
      ['Where it lives', pick('i_home', { lms: 'An LMS with tracking', kb: 'A knowledge base or help centre', link: 'A shared link or intranet page', 'live-only': 'Live only' })],
      ['Stakeholders and their needs', val('i_stake') || NONE],
      ['Timeline and communication', val('i_time') || NONE],
    ]],
    ['5 \u00b7 Evaluate \u2014 does the roof hold', [
      ['Summative assessment', val('e_sum') || NONE],
      ['Completion tracking', pick('e_track', { lms: 'LMS completion and quiz scores', submit: 'A submitted artefact reviewed by a person', observe: 'On-the-job observation or coaching notes', self: 'Self-report / honour system' })],
      ['Level measured', pick('e_level', { 1: 'Reaction — did they like it', 2: 'Learning — did they learn it', 3: 'Behaviour — did they do it on the job', 4: 'Results — did the original problem shrink' })],
      ['Evidence and reinforcement', val('e_data') || NONE],
    ]],
    ['6 \u00b7 Improve \u2014 the next pass', [
      ['Changes for the next iteration', val('im_next') || NONE],
      ['Phases reviewed', `${state.stars.size} of 5`],
    ]],
  ];
}

function courseTitle() {
  return val('courseName') || 'Untitled course';
}

function renderScroll() {
  const today = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  const body = scrollData().map(([heading, rows]) => `
    <section class="scroll-section">
      <h4>${heading}</h4>
      <dl>${rows.map(([k, v]) => `<div class="scroll-row"><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
    </section>`).join('');

  $('#scrollWrap').innerHTML = `
    <h3 class="display">Course design outline &mdash; ${esc(courseTitle())}</h3>
    <p class="scroll-meta">An ADDIE design outline drafted in Build-a-Burrow on ${today}${state.title ? ', ' + state.title : ''}</p>
    ${body}
    <section class="scroll-section">
      <h4>Continue</h4>
      <ul class="tick-list">
        <li>Turn the objectives into a screen-by-screen storyboard before building anything.</li>
        <li>Close out any accessibility items still listed as open above.</li>
        <li>Arrange the pilot: two learners, ten minutes, and watch where they hesitate.</li>
        <li>Put the evaluation date in your calendar now. It is the step most often skipped.</li>
      </ul>
    </section>`;
  fireConfetti();
}


/* ---------- Download as .doc ---------- */
$('#dlDoc').addEventListener('click', () => {
  const today = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  const sections = scrollData().map(([h, rows]) => `
    <h2>${esc(h)}</h2>
    <table><tbody>
      ${rows.map(([k, v]) => `<tr><td class="k">${esc(k)}</td><td>${esc(v).replace(/\n/g, '<br>')}</td></tr>`).join('')}
    </tbody></table>`).join('');

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(courseTitle())} — ADDIE Design Outline</title>
  <style>
    body { font-family: Georgia, serif; color:#222; line-height:1.5; }
    h1 { font-size:22pt; margin-bottom:2pt; }
    .meta { color:#666; font-size:10pt; margin-bottom:18pt; }
    h2 { font-size:13pt; border-bottom:1pt solid #999; padding-bottom:3pt; margin-top:22pt; }
    table { width:100%; border-collapse:collapse; margin-top:6pt; }
    td { vertical-align:top; padding:6pt 8pt; border-bottom:0.5pt solid #ddd; font-size:11pt; }
    td.k { width:30%; font-weight:bold; color:#444; }
    ul { font-size:11pt; }
  </style></head><body>
  <h1>${esc(courseTitle())}</h1>
  <p class="meta">ADDIE design outline, drafted in Build-a-Burrow on ${today}</p>
  ${sections}
  <h2>Next steps</h2>
  <ul>
    <li>Turn the objectives into a screen-by-screen storyboard before building.</li>
    <li>Close out any accessibility items still listed as open.</li>
    <li>Book the pilot: two learners, ten minutes, watch where they hesitate.</li>
    <li>Diarise the evaluation date now.</li>
  </ul>
  </body></html>`;

  const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = courseTitle().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').toLowerCase() + '-addie-outline.doc';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  toast('Outline exported to your downloads.');
});

$('#printBtn').addEventListener('click', () => window.print());

$('#restartBtn').addEventListener('click', () => {
  $$('textarea, input[type="text"]').forEach(el => (el.value = ''));
  $$('select').forEach(el => (el.value = ''));
  $$('input[type="checkbox"]').forEach(el => (el.checked = false));
  $$('.bp').forEach(b => b.classList.remove('is-picked'));
  $$('.feedback').forEach(f => { f.hidden = true; f.innerHTML = ''; });
  $$('.shop').forEach(s => s.classList.remove('is-owned'));
  $('#subBranchWrap').hidden = true;
  $('#titleBadge').hidden = true;
  state.done = new Set(); state.stars = new Set(); state.owned = new Set(); state.title = '';
  nudged.clear();
  state.design = { aud: '', sub: '', bp: '' };
  clearProgress();
  refresh();
  goto('start');
  toast('Fresh hillside. Your previous outline is cleared from this browser.');
});

/* ---------- Completion moment ----------
   One archive star rises, expands once and settles, with a short ripple
   beneath it. Under prefers-reduced-motion the same star and message
   appear without movement. Never repeats while the view stays open. */
function fireConfetti() {
  const moment = $('#completionMoment');
  if (!moment) return;
  const star = moment.querySelector('.archive-star');
  const ripple = moment.querySelector('.ripple');
  [star, ripple].forEach(el => {
    if (!el) return;
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = '';
  });
}

/* ==========================================================
   Saved progress (browser storage, degrades quietly)
   ========================================================== */
const SAVE_KEY = 'burrow.v1';
const TEXT_IDS = ['courseName', 'a_problem', 'a_audience', 'a_root', 'a_solution', 'a_success',
  'd_aud', 'd_sub', 'd_obj', 'd_form', 'v_chunk', 'i_mode', 'i_home', 'i_stake', 'i_time',
  'e_sum', 'e_track', 'e_level', 'e_data', 'im_next'];

function store() {
  try { return window.localStorage; } catch (err) { return null; }
}

let saveTimer;
function saveProgress() {
  const ls = store();
  if (!ls) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      const fields = {};
      TEXT_IDS.forEach(id => { const el = document.getElementById(id); if (el) fields[id] = el.value; });
      ls.setItem(SAVE_KEY, JSON.stringify({
        v: 1,
        savedAt: Date.now(),
        fields,
        checks: {
          vehicles: $$('#vehicles input:checked').map(i => i.value),
          a11y: $$('#a11y input:checked').map(i => i.value),
        },
        design: state.design,
        done: [...state.done],
        stars: [...state.stars],
        owned: [...state.owned],
        title: state.title,
        stage: $('.stage.is-active')?.dataset.stage || 'start',
      }));
    } catch (err) { /* storage full or blocked — carry on */ }
  }, 400);
}

function loadProgress() {
  const ls = store();
  if (!ls) return false;
  let data;
  try { data = JSON.parse(ls.getItem(SAVE_KEY) || 'null'); } catch (err) { return false; }
  if (!data || data.v !== 1) return false;

  Object.entries(data.fields || {}).forEach(([id, v]) => {
    const el = document.getElementById(id);
    if (!el || !v) return;
    if (id === 'd_sub') return; // needs its options rebuilt first
    el.value = v;
  });

  // rebuild the Design sub-branch options, then restore the choice
  if (data.fields?.d_aud) {
    $('#d_aud').dispatchEvent(new Event('change'));
    if (data.fields.d_sub) $('#d_sub').value = data.fields.d_sub;
  }
  state.design = data.design || { aud: '', sub: '', bp: '' };
  if (state.design.bp) {
    const match = Object.entries(BP_NAMES).find(([, name]) => name === state.design.bp);
    if (match) $(`.bp[data-bp="${match[0]}"]`)?.classList.add('is-picked');
  }

  (data.checks?.vehicles || []).forEach(v => {
    const el = $$('#vehicles input').find(i => i.value === v); if (el) el.checked = true;
  });
  (data.checks?.a11y || []).forEach(v => {
    const el = $$('#a11y input').find(i => i.value === v); if (el) el.checked = true;
  });

  state.done = new Set(data.done || []);
  state.stars = new Set(data.stars || []);
  state.owned = new Set(data.owned || []);
  state.title = data.title || '';
  state.owned.forEach(id => {
    const item = SHOP.find(i => i.id === id);
    if (item?.cls) $('.' + item.cls)?.classList.add('is-owned');
  });

  refresh();

  const filled = TEXT_IDS.some(id => (data.fields?.[id] || '').trim()) || state.done.size > 0;
  if (!filled) return false;

  if (data.stage && data.stage !== 'start') goto(data.stage);

  const when = new Date(data.savedAt || Date.now());
  const day = when.toDateString() === new Date().toDateString()
    ? when.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
    : when.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  toast(`Your saved work is here, from ${day}. Continue where you left off.`);
  return true;
}

function clearProgress() {
  const ls = store();
  try { ls?.removeItem(SAVE_KEY); } catch (err) { /* nothing to do */ }
}

document.addEventListener('input', saveProgress);
document.addEventListener('change', saveProgress);

/* ---------- init ---------- */
refresh();
loadProgress();
