// Utilitaires
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function getAssistant(id) {
  return ASSISTANTS.find((a) => a.id === id);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ----- Cours -----
function renderCourses() {
  const list = $("#course-list");
  const search = $("#course-search");
  const subject = $("#course-subject");
  const level = $("#course-level");
  if (!list) return;

  function paint() {
    const q = (search.value || "").trim().toLowerCase();
    const subj = subject.value;
    const lvl = level.value;
    const filtered = COURSES.filter((c) => {
      if (subj && c.subject !== subj) return false;
      if (lvl && c.level !== lvl) return false;
      if (q && !(`${c.title} ${c.chapter} ${c.subject}`.toLowerCase().includes(q))) return false;
      return true;
    });
    if (filtered.length === 0) {
      list.innerHTML = `<div class="empty">Aucun cours ne correspond à votre recherche.</div>`;
      return;
    }
    list.innerHTML = filtered
      .map((c) => {
        const a = getAssistant(c.assistant);
        return `
          <article class="card" style="--accent:${a.color}">
            <div class="card-tag">${escapeHtml(c.subject)}</div>
            <h3>${escapeHtml(c.title)}</h3>
            <div class="card-meta">
              <span>${escapeHtml(c.level)}</span>
              <span>·</span>
              <span>${escapeHtml(c.chapter)}</span>
              <span>·</span>
              <span>${escapeHtml(c.duration)}</span>
            </div>
            <div class="card-actions">
              <a class="btn btn-ghost" href="#">Lire la fiche</a>
              <a class="btn btn-primary"
                 href="chat.html?assistant=${a.id}&course=${c.id}">
                 ${escapeHtml(a.icon)} Travailler avec l'IA
              </a>
            </div>
          </article>
        `;
      })
      .join("");
  }

  [search, subject, level].forEach((el) => el && el.addEventListener("input", paint));
  paint();
}

// ----- Exercices -----
function renderExercises() {
  const list = $("#exercise-list");
  const search = $("#ex-search");
  const subject = $("#ex-subject");
  const diff = $("#ex-difficulty");
  if (!list) return;

  function paint() {
    const q = (search.value || "").trim().toLowerCase();
    const subj = subject.value;
    const d = diff.value;
    const filtered = EXERCISES.filter((e) => {
      if (subj && e.subject !== subj) return false;
      if (d && e.difficulty !== d) return false;
      if (q && !(`${e.title} ${e.description} ${e.subject}`.toLowerCase().includes(q))) return false;
      return true;
    });
    if (filtered.length === 0) {
      list.innerHTML = `<div class="empty">Aucun exercice ne correspond.</div>`;
      return;
    }
    list.innerHTML = filtered
      .map((e) => {
        const a = getAssistant(e.assistant);
        return `
          <article class="exercise" style="--accent:${a.color}">
            <div class="exercise-left">
              <div class="card-tag">${escapeHtml(e.subject)}</div>
              <h3>${escapeHtml(e.title)}</h3>
              <p class="muted">${escapeHtml(e.description)}</p>
              <div class="card-meta">
                <span class="badge badge-${e.difficulty.toLowerCase()}">${escapeHtml(e.difficulty)}</span>
                <span>·</span>
                <span>${escapeHtml(e.duration)}</span>
              </div>
            </div>
            <div class="exercise-right">
              <a class="btn btn-primary"
                 href="chat.html?assistant=${a.id}&exercise=${e.id}">
                ${escapeHtml(a.icon)} Travailler avec l'IA
              </a>
            </div>
          </article>
        `;
      })
      .join("");
  }

  [search, subject, diff].forEach((el) => el && el.addEventListener("input", paint));
  paint();
}

// ----- Assistants -----
function renderAssistants() {
  const list = $("#assistant-list");
  if (!list) return;
  list.innerHTML = ASSISTANTS.map(
    (a) => `
      <a href="chat.html?assistant=${a.id}" class="assistant-card" style="--accent:${a.color}">
        <div class="assistant-icon">${escapeHtml(a.icon)}</div>
        <h3>${escapeHtml(a.name)}</h3>
        <p class="muted">${escapeHtml(a.description)}</p>
        <div class="assistant-meta">
          <span class="pill">${escapeHtml(a.subject)}</span>
          <span class="pill pill-model">${escapeHtml(a.model)}</span>
        </div>
        <span class="assistant-cta">Démarrer une conversation →</span>
      </a>
    `
  ).join("");
}

// ----- Chat -----
function initChat() {
  const params = new URLSearchParams(location.search);
  const id = params.get("assistant") || "maths";
  const courseId = params.get("course");
  const exerciseId = params.get("exercise");
  const assistant = getAssistant(id) || ASSISTANTS[0];

  document.documentElement.style.setProperty("--accent", assistant.color);
  $("#chat-avatar").textContent = assistant.icon;
  $("#chat-name").textContent = assistant.name;
  $("#chat-sub").textContent = `${assistant.subject} · ${assistant.model}`;
  document.title = `${assistant.name} — StudIA`;

  const ctx = $("#chat-context");
  let contextText = "";
  if (courseId) {
    const c = COURSES.find((x) => x.id === courseId);
    if (c) {
      contextText = `Cours : ${c.title}`;
      ctx.innerHTML = `
        <div class="context-title">📘 Cours</div>
        <div class="context-name">${escapeHtml(c.title)}</div>
        <div class="muted">${escapeHtml(c.subject)} · ${escapeHtml(c.level)} · ${escapeHtml(c.chapter)}</div>
      `;
    }
  } else if (exerciseId) {
    const e = EXERCISES.find((x) => x.id === exerciseId);
    if (e) {
      contextText = `Exercice : ${e.title}`;
      ctx.innerHTML = `
        <div class="context-title">✏️ Exercice</div>
        <div class="context-name">${escapeHtml(e.title)}</div>
        <div class="muted">${escapeHtml(e.subject)} · ${escapeHtml(e.difficulty)}</div>
        <p>${escapeHtml(e.description)}</p>
      `;
    }
  } else {
    ctx.innerHTML = `<div class="muted">Aucun cours ni exercice sélectionné. Posez directement votre question.</div>`;
  }

  // Suggestions
  const sugg = $("#chat-suggestions");
  sugg.innerHTML = assistant.suggestions
    .map((s) => `<button type="button" class="suggestion">${escapeHtml(s)}</button>`)
    .join("");
  sugg.addEventListener("click", (e) => {
    const btn = e.target.closest(".suggestion");
    if (!btn) return;
    $("#chat-input").value = btn.textContent;
    $("#chat-input").focus();
  });

  // Messages
  const msgs = $("#chat-messages");
  pushMessage("bot", assistant.intro);
  if (contextText) {
    pushMessage("bot", `Je vois que tu travailles sur : « ${contextText} ». On commence par où ?`);
  }

  function pushMessage(who, text) {
    const el = document.createElement("div");
    el.className = `bubble bubble-${who}`;
    el.innerHTML = escapeHtml(text);
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function pushTyping() {
    const el = document.createElement("div");
    el.className = "bubble bubble-bot typing-bubble";
    el.innerHTML = `<span class="typing"><span></span><span></span><span></span></span>`;
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
    return el;
  }

  let replyIndex = 0;
  $("#chat-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = $("#chat-input");
    const text = input.value.trim();
    if (!text) return;
    pushMessage("user", text);
    input.value = "";
    const typing = pushTyping();
    setTimeout(() => {
      typing.remove();
      const pool = FAKE_RESPONSES[assistant.id] || ["Je réfléchis à ta question…"];
      const reply = pool[replyIndex % pool.length];
      replyIndex++;
      pushMessage("bot", reply);
    }, 700 + Math.random() * 600);
  });
}
