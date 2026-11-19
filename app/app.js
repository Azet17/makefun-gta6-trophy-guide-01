// Leonida Legend — GTA 6 trophy guide & tracker.
// Offline static app: loads app/data/trophies.json at run time, keeps the
// checklist in localStorage, and never makes a network request of its own.
const PROGRESS_KEY = 'leonida-legend-earned-v1';
const SPOILER_KEY = 'leonida-legend-hide-spoilers-v1';

const listEl = document.getElementById('trophy-list');
const detailEl = document.getElementById('detail');
const searchEl = document.getElementById('search');
const kindEl = document.getElementById('kind');
const gradeEl = document.getElementById('grade');
const earnedOnlyEl = document.getElementById('earned-only');
const spoilersEl = document.getElementById('hide-spoilers');

const params = new URLSearchParams(location.search);
let earned = new Set(readStoredList(PROGRESS_KEY));
let hideSpoilers = readStoredFlag(SPOILER_KEY, true);
spoilersEl.checked = hideSpoilers;
let selectedId = Number(params.get('open')) || null;

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;

function readStoredList(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'number') : [];
  } catch {
    return [];
  }
}

function readStoredFlag(key, fallback) {
  const raw = localStorage.getItem(key);
  return raw === null ? fallback : raw === '1';
}

function saveProgress() {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

function isStorySpoiler(t) {
  return t.kind === 'story' && t.hidden;
}

function displayName(t) {
  if (hideSpoilers && isStorySpoiler(t) && !earned.has(t.id)) return 'Hidden story trophy';
  return t.name;
}

function displayDescription(t) {
  if (hideSpoilers && isStorySpoiler(t) && !earned.has(t.id)) {
    return 'Hidden until earned — finish the story to reveal this trophy.';
  }
  return t.description;
}

function kindLabel(kind) {
  const labels = {
    story: 'Story', collectibles: 'Collectibles', activities: 'Activities',
    crime: 'Crime & robbery', exploration: 'Exploration', economy: 'Money & shops',
  };
  return labels[kind] ?? kind;
}

function stageLabel(stage) {
  const labels = {
    ch1: 'Chapter 1', ch2: 'Chapter 2', ch3: 'Chapter 3', ch4: 'Chapter 4',
    story: 'Story missions', finale: 'Finale', cleanup: 'After the story', platinum: 'Platinum',
  };
  return labels[stage] ?? stage;
}

function filteredTrophies() {
  const q = searchEl.value.trim().toLowerCase();
  return trophies.filter((t) => {
    if (kindEl.value === 'online') return false;
    if (kindEl.value === 'missable' && !t.missable) return false;
    if (kindEl.value !== 'all' && kindEl.value !== 'missable' && t.kind !== kindEl.value) return false;
    if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
    if (earnedOnlyEl.checked && !earned.has(t.id)) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.guide.toLowerCase().includes(q))) return false;
    return true;
  });
}

function renderProgress() {
  const total = trophies.length;
  const done = earned.size;
  document.getElementById('earned-count').textContent = String(done);
  const fill = document.getElementById('progress-fill');
  fill.style.width = `${(done / total) * 100}%`;
  const bar = document.getElementById('progress-bar');
  bar.setAttribute('aria-valuenow', String(done));
  const byGrade = {};
  for (const t of trophies) {
    if (earned.has(t.id)) byGrade[t.grade] = (byGrade[t.grade] ?? 0) + 1;
  }
  const totals = {};
  for (const t of trophies) totals[t.grade] = (totals[t.grade] ?? 0) + 1;
  document.getElementById('grade-line').textContent =
    ['platinum', 'gold', 'silver', 'bronze'].map((g) => `${byGrade[g] ?? 0}/${totals[g]} ${g}`).join(' · ');
  document.getElementById('platinum-line').innerHTML =
    done === total
      ? '<strong>Platinum earned — you are a Leonida Legend.</strong>'
      : `${total - done} to go until <strong>Vice Got a Price!</strong>`;
}

function renderList() {
  const shown = filteredTrophies();
  listEl.replaceChildren();
  const status = document.getElementById('status-line');
  if (kindEl.value === 'online') {
    status.textContent = 'Showing 0 of 55 — there are no online trophies. All 55 are single-player, per the official list.';
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = 'No online trophies exist for GTA 6 at launch. Every trophy on this list is earned in single-player.';
    listEl.append(li);
  } else {
    status.textContent = `Showing ${shown.length} of ${trophies.length} trophies · ${earned.size} earned`;
  }
  for (const t of shown) {
    const li = document.createElement('li');
    li.className = 'trophy' + (earned.has(t.id) ? ' earned' : '') + (selectedId === t.id ? ' selected' : '');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.id);
    box.setAttribute('aria-label', `Mark ${t.name} earned`);
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.id);
      else earned.delete(t.id);
      saveProgress();
      renderProgress();
      renderList();
      renderDetail();
    });
    const body = document.createElement('div');
    const h = document.createElement('h3');
    h.textContent = displayName(t);
    const desc = document.createElement('p');
    desc.className = 'desc';
    desc.textContent = displayDescription(t);
    const tags = document.createElement('div');
    tags.className = 'tags';
    for (const [text, cls] of [
      [t.grade, t.grade],
      [kindLabel(t.kind), ''],
      [stageLabel(t.stage), ''],
      ...(t.missable ? [['Missable', 'missable']] : []),
      ...(t.hidden ? [['Hidden on PSN', 'hidden-flag']] : []),
    ]) {
      const b = document.createElement('span');
      b.className = `badge ${cls}`.trim();
      b.textContent = text;
      tags.append(b);
    }
    body.append(h, desc, tags);
    const open = document.createElement('span');
    open.className = 'open';
    open.textContent = 'Guide ›';
    li.append(box, body, open);
    li.addEventListener('click', (event) => {
      if (event.target === box) return;
      selectedId = t.id;
      renderList();
      renderDetail();
      detailEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
    listEl.append(li);
  }
}

function renderDetail() {
  const t = trophies.find((x) => x.id === selectedId);
  if (!t) {
    detailEl.innerHTML = '<p class="detail-empty">Select a trophy to read its guide and sources.</p>';
    return;
  }
  detailEl.replaceChildren();
  const h = document.createElement('h2');
  h.textContent = displayName(t);
  const official = document.createElement('p');
  official.className = 'official';
  official.textContent = `Official: “${displayDescription(t)}” — ${t.grade}, ${t.hidden ? 'hidden on PSN' : 'visible on PSN'}, ${kindLabel(t.kind)}, ${stageLabel(t.stage)}${t.missable ? ', MISSABLE' : ''}.`;
  detailEl.append(h, official);
  if (hideSpoilers && isStorySpoiler(t) && !earned.has(t.id)) {
    const p = document.createElement('p');
    p.textContent = 'Spoilers are hidden. Earn this trophy (or turn off “Hide story spoilers”) to read its guide.';
    detailEl.append(p);
  } else {
    const gh = document.createElement('h3');
    gh.textContent = 'Guide';
    const gp = document.createElement('p');
    gp.textContent = t.guide;
    const sh = document.createElement('h3');
    sh.textContent = 'Sources';
    const sp = document.createElement('p');
    sp.className = 'sources';
    sp.textContent = t.sources;
    detailEl.append(gh, gp, sh, sp);
  }
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'earn-btn';
  btn.textContent = earned.has(t.id) ? '✓ Earned — mark as not earned' : 'Mark as earned';
  btn.addEventListener('click', () => {
    if (earned.has(t.id)) earned.delete(t.id);
    else earned.add(t.id);
    saveProgress();
    renderProgress();
    renderList();
    renderDetail();
  });
  detailEl.append(btn);
}

const ROADMAP_STAGES = [
  {
    title: 'Before you start — saves and settings',
    text: 'Turn on “Hide story spoilers” if you want the story trophies concealed until you earn them. Then set up saves: the game has no mission replay, so keep a manual save at the start of every chapter and one untouched save from just before the final mission.',
    ids: [],
  },
  {
    title: 'Chapter 1 — the one missable step',
    text: 'Finish Chapter 1, but do the balcony meditation before it ends (see Positive Mental Attitude — the only missable trophy). Also finish the Gone Fishing mission for Just Like Paradise.',
    ids: [3, 2, 28],
  },
  {
    title: 'Chapter 2 — the list opens up',
    text: 'Switching between Jason and Lucia unlocks, and with it the partner trophies, the Scooter Bros app (Moses mission) and the Real Estate app (Daily Driver mission). Start the long grinds: stunts, vehicle scans, Challenges.',
    ids: [4, 46, 54, 55],
  },
  {
    title: 'Chapter 3 — robbery tools and races',
    text: 'Yasmani’s Jewelry Jobs hands you the Snap Gun and opens jewelry robberies. Do the time-sensitive Race Against Yago the moment its hourglass appears.',
    ids: [5, 39, 34, 25],
  },
  {
    title: 'Chapter 4 — bank vaults',
    text: 'That’s Where The Money Is, near the end of Chapter 4, opens bank vaults. Bring your partner: vault escapes hand you a 4-star Wanted Level, which sets up Hot Together.',
    ids: [6, 40, 33],
  },
  {
    title: 'The finale and the named missions',
    text: 'Complete the final mission for the gold, and the six named story missions (Breakfast Run, The Cartel Heist, Child’s Play, Headliners, VCIA Takedown, Operation Savage Glory) as they come. The five side-character finales stay open after the credits.',
    ids: [7, 8, 9, 10, 11, 12, 13, 22, 23, 24, 26, 27],
  },
  {
    title: 'After the credits — the long cleanup',
    text: 'Everything left is free-roam: collectibles, stunts, Challenges, races, robberies, hunting, meditation spots and exploration. Work the list in any order; check Progress counters so you do not repeat finished sets.',
    ids: [15, 16, 17, 18, 19, 20, 21, 29, 30, 31, 32, 35, 36, 37, 38, 41, 42, 43, 44, 45, 47, 48, 49, 50, 51, 52, 53],
  },
  {
    title: '100% completion and the Platinum',
    text: 'The 100% checklist (Progress, Stats, 100% Completion) only appears after the story: 300 stunts, 70 of 80 Challenges, 200 of 277 vehicles, all 8 vaults, all 39 illegal operations. When A Long Road pops, Vice Got a Price! follows immediately.',
    ids: [14, 1],
  },
];

function renderRoadmap() {
  const ol = document.getElementById('roadmap');
  ol.replaceChildren();
  for (const stage of ROADMAP_STAGES) {
    const li = document.createElement('li');
    const h = document.createElement('h2');
    h.textContent = stage.title;
    const p = document.createElement('p');
    p.textContent = stage.text;
    li.append(h, p);
    if (stage.ids.length) {
      const ul = document.createElement('ul');
      for (const id of stage.ids) {
        const t = trophies.find((x) => x.id === id);
        if (!t) continue;
        const item = document.createElement('li');
        const jump = document.createElement('button');
        jump.type = 'button';
        jump.className = 'roadmap-jump';
        jump.textContent = `${displayName(t)} — ${t.grade}${earned.has(t.id) ? ' ✓' : ''}${t.missable ? ' — MISSABLE' : ''}`;
        jump.addEventListener('click', () => {
          selectedId = t.id;
          switchView('checklist');
          renderList();
          renderDetail();
        });
        item.append(jump);
        ul.append(item);
      }
      li.append(ul);
    }
    ol.append(li);
  }
}

function renderMissables() {
  const wrap = document.getElementById('missable-list');
  wrap.replaceChildren();
  for (const t of trophies.filter((x) => x.missable)) {
    const card = document.createElement('article');
    card.className = 'missable-card';
    const h = document.createElement('h2');
    h.textContent = `⚠ ${t.name} — ${t.grade}`;
    const desc = document.createElement('p');
    desc.textContent = `Official: “${t.description}”`;
    const guide = document.createElement('p');
    guide.textContent = t.guide;
    const src = document.createElement('p');
    src.className = 'sources';
    src.textContent = t.sources;
    const state = document.createElement('p');
    state.innerHTML = earned.has(t.id)
      ? '<strong>✓ Earned — safe.</strong>'
      : '<strong>Not earned yet — do it in Chapter 1.</strong>';
    card.append(h, desc, guide, src, state);
    wrap.append(card);
  }
}

function switchView(view) {
  for (const btn of document.querySelectorAll('.tabs button')) {
    const active = btn.dataset.view === view;
    btn.classList.toggle('active', active);
    if (active) btn.setAttribute('aria-current', 'page');
    else btn.removeAttribute('aria-current');
  }
  for (const section of document.querySelectorAll('.view')) {
    section.hidden = section.id !== `view-${view}`;
  }
}

document.querySelectorAll('.tabs button').forEach((btn) => {
  btn.addEventListener('click', () => switchView(btn.dataset.view));
});
spoilersEl.addEventListener('change', () => {
  hideSpoilers = spoilersEl.checked;
  localStorage.setItem(SPOILER_KEY, hideSpoilers ? '1' : '0');
  renderList();
  renderDetail();
});
for (const el of [searchEl, kindEl, gradeEl, earnedOnlyEl]) {
  el.addEventListener('input', renderList);
  el.addEventListener('change', renderList);
}
document.getElementById('export').addEventListener('click', () => {
  const payload = {
    game: 'Grand Theft Auto VI',
    exportedAt: new Date().toISOString(),
    earned: [...earned].sort((a, b) => a - b),
  };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
document.getElementById('import').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    const ids = Array.isArray(parsed) ? parsed : parsed.earned;
    if (!Array.isArray(ids)) throw new Error('bad file');
    const known = new Set(trophies.map((t) => t.id));
    earned = new Set(ids.filter((id) => known.has(id)));
    saveProgress();
    renderProgress();
    renderList();
    renderDetail();
  } catch {
    document.getElementById('status-line').textContent = 'Import failed: that file is not a trophy progress export.';
  }
  event.target.value = '';
});

renderProgress();
renderList();
renderDetail();
renderRoadmap();
renderMissables();
if (params.get('view') === 'roadmap' || params.get('view') === 'missables') {
  switchView(params.get('view'));
}
if (selectedId) renderDetail();
