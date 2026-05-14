// ===== Utilitaires =====
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

// ===== Mini parseur Markdown =====
function md(text) {
  let s = escapeHtml(text);

  // Blocs de code ```
  const codeBlocks = [];
  s = s.replace(/```([\s\S]*?)```/g, (_, code) => {
    codeBlocks.push(code.replace(/^\n+|\n+$/g, ""));
    return `\x00CB${codeBlocks.length - 1}\x00`;
  });

  // Code inline `
  const inlines = [];
  s = s.replace(/`([^`\n]+)`/g, (_, code) => {
    inlines.push(code);
    return `\x00IC${inlines.length - 1}\x00`;
  });

  // Tableaux GitHub-flavored (très simplifiés)
  s = s.replace(/((?:^\|.+\|\s*\n)+)/gm, (block) => {
    const rows = block.trim().split(/\n/).map((r) => r.trim());
    if (rows.length < 2) return block;
    const splitRow = (r) => r.replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
    const header = splitRow(rows[0]);
    const sepOk = /^\s*:?-+:?\s*$/.test(splitRow(rows[1])[0]);
    if (!sepOk) return block;
    const body = rows.slice(2).map(splitRow);
    const ths = header.map((c) => `<th>${c}</th>`).join("");
    const trs = body
      .map((cells) => `<tr>${cells.map((c) => `<td>${c}</td>`).join("")}</tr>`)
      .join("");
    return `<table><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>`;
  });

  // Titres
  s = s.replace(/^#### (.+)$/gm, "<h5>$1</h5>");
  s = s.replace(/^### (.+)$/gm, "<h4>$1</h4>");
  s = s.replace(/^## (.+)$/gm, "<h3>$1</h3>");
  s = s.replace(/^# (.+)$/gm, "<h2>$1</h2>");

  // Citations >
  s = s.replace(/(?:^&gt; .+(?:\n|$))+/gm, (block) => {
    const inner = block
      .split(/\n/)
      .filter(Boolean)
      .map((l) => l.replace(/^&gt; /, ""))
      .join(" ");
    return `<blockquote>${inner}</blockquote>`;
  });

  // Gras / italique
  s = s.replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/(?:^|[^*\w])\*([^*\n]+)\*(?!\w)/g, (m, inner, off, full) => {
    const prev = full[off];
    return (prev === "*" || prev === undefined ? "" : prev) + `<em>${inner}</em>`;
  });

  // Liens
  s = s.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  // Listes non ordonnées
  s = s.replace(/((?:^- .+(?:\n|$))+)/gm, (block) => {
    const items = block
      .trim()
      .split(/\n/)
      .map((l) => `<li>${l.replace(/^- /, "")}</li>`)
      .join("");
    return `<ul>${items}</ul>`;
  });

  // Listes ordonnées
  s = s.replace(/((?:^\d+\. .+(?:\n|$))+)/gm, (block) => {
    const items = block
      .trim()
      .split(/\n/)
      .map((l) => `<li>${l.replace(/^\d+\. /, "")}</li>`)
      .join("");
    return `<ol>${items}</ol>`;
  });

  // Paragraphes
  s = s
    .split(/\n{2,}/)
    .map((p) => {
      const t = p.trim();
      if (!t) return "";
      if (/^<(h\d|ul|ol|pre|blockquote|table)/.test(t)) return t;
      return `<p>${t.replace(/\n/g, "<br>")}</p>`;
    })
    .join("\n");

  // Restauration code
  s = s.replace(/\x00IC(\d+)\x00/g, (_, i) => `<code>${inlines[+i]}</code>`);
  s = s.replace(
    /\x00CB(\d+)\x00/g,
    (_, i) => `<pre><code>${codeBlocks[+i]}</code></pre>`
  );

  return s;
}

// ===== Persistance =====
const STORAGE = {
  history: (id) => `studia.chat.${id}`,
  activity: "studia.activity",
  theme: "studia.theme",
};

function loadHistory(id) {
  try {
    const raw = localStorage.getItem(STORAGE.history(id));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function saveHistory(id, messages) {
  try {
    localStorage.setItem(STORAGE.history(id), JSON.stringify(messages));
  } catch {}
}
function clearHistory(id) {
  try {
    localStorage.removeItem(STORAGE.history(id));
  } catch {}
}

function loadActivity() {
  try {
    const raw = localStorage.getItem(STORAGE.activity);
    return raw
      ? JSON.parse(raw)
      : { messages: {}, coursesViewed: [], exercisesStarted: [], lastActive: null };
  } catch {
    return { messages: {}, coursesViewed: [], exercisesStarted: [], lastActive: null };
  }
}
function saveActivity(a) {
  try {
    localStorage.setItem(STORAGE.activity, JSON.stringify(a));
  } catch {}
}
function trackMessage(assistantId) {
  const a = loadActivity();
  a.messages[assistantId] = (a.messages[assistantId] || 0) + 1;
  a.lastActive = new Date().toISOString();
  saveActivity(a);
}
function trackCourse(id) {
  const a = loadActivity();
  a.coursesViewed = [id, ...a.coursesViewed.filter((c) => c !== id)].slice(0, 10);
  a.lastActive = new Date().toISOString();
  saveActivity(a);
}
function trackExercise(id) {
  const a = loadActivity();
  a.exercisesStarted = [id, ...a.exercisesStarted.filter((e) => e !== id)].slice(0, 10);
  a.lastActive = new Date().toISOString();
  saveActivity(a);
}

// ===== Thème =====
function initTheme() {
  const saved = localStorage.getItem(STORAGE.theme) || "dark";
  document.documentElement.dataset.theme = saved;
  const btn = $("#theme-toggle");
  if (btn) {
    btn.textContent = saved === "dark" ? "☀️" : "🌙";
    btn.addEventListener("click", () => {
      const cur = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = cur;
      localStorage.setItem(STORAGE.theme, cur);
      btn.textContent = cur === "dark" ? "☀️" : "🌙";
    });
  }
}

// ===== Cours =====
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
      if (q && !`${c.title} ${c.chapter} ${c.subject} ${c.summary || ""}`.toLowerCase().includes(q))
        return false;
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
            ${c.summary ? `<p class="muted">${escapeHtml(c.summary)}</p>` : ""}
            <div class="card-meta">
              <span>${escapeHtml(c.level)}</span>
              <span>·</span>
              <span>${escapeHtml(c.chapter)}</span>
              <span>·</span>
              <span>${escapeHtml(c.duration)}</span>
            </div>
            <div class="card-actions">
              <a class="btn btn-ghost" href="fiche.html?id=${c.id}">Lire la fiche</a>
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

// ===== Exercices =====
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
      if (q && !`${e.title} ${e.description} ${e.subject}`.toLowerCase().includes(q))
        return false;
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

// ===== Assistants =====
function renderAssistants() {
  const list = $("#assistant-list");
  if (!list) return;
  const activity = loadActivity();
  list.innerHTML = ASSISTANTS.map((a) => {
    const msgs = activity.messages[a.id] || 0;
    return `
      <a href="chat.html?assistant=${a.id}" class="assistant-card" style="--accent:${a.color}">
        <div class="assistant-icon">${escapeHtml(a.icon)}</div>
        <h3>${escapeHtml(a.name)}</h3>
        <p class="muted">${escapeHtml(a.description)}</p>
        <div class="assistant-meta">
          <span class="pill">${escapeHtml(a.subject)}</span>
          <span class="pill pill-model">${escapeHtml(a.model)}</span>
          ${msgs ? `<span class="pill pill-count">${msgs} message${msgs > 1 ? "s" : ""}</span>` : ""}
        </div>
        <span class="assistant-cta">Démarrer une conversation →</span>
      </a>
    `;
  }).join("");
}

// ===== Fiche de cours =====
function renderFiche() {
  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  const course = COURSES.find((c) => c.id === id);
  const container = $("#fiche-container");
  if (!container) return;

  if (!course) {
    container.innerHTML = `
      <div class="empty">
        Cours introuvable.
        <a href="cours.html" class="btn btn-primary" style="margin-left:12px">← Retour au catalogue</a>
      </div>`;
    return;
  }

  trackCourse(course.id);
  const assistant = getAssistant(course.assistant);
  document.documentElement.style.setProperty("--accent", assistant.color);
  document.title = `${course.title} — StudIA`;

  container.innerHTML = `
    <article class="fiche">
      <div class="fiche-head">
        <a class="back-link" href="cours.html">← Tous les cours</a>
        <div class="fiche-tags">
          <span class="card-tag">${escapeHtml(course.subject)}</span>
          <span class="pill">${escapeHtml(course.level)}</span>
          <span class="pill">${escapeHtml(course.chapter)}</span>
          <span class="pill">⏱ ${escapeHtml(course.duration)}</span>
        </div>
        <h1>${escapeHtml(course.title)}</h1>
        ${course.summary ? `<p class="lead">${escapeHtml(course.summary)}</p>` : ""}
      </div>
      <div class="fiche-body markdown">${md(course.content || "")}</div>
      <div class="fiche-footer">
        <div class="fiche-tutor">
          <div class="assistant-avatar" style="background:${assistant.color}22;border-color:${assistant.color}55">
            ${escapeHtml(assistant.icon)}
          </div>
          <div>
            <div class="chat-name">${escapeHtml(assistant.name)}</div>
            <div class="chat-sub muted">Tuteur dédié à cette matière</div>
          </div>
        </div>
        <a class="btn btn-primary btn-lg" href="chat.html?assistant=${assistant.id}&course=${course.id}">
          ${escapeHtml(assistant.icon)} Travailler ce cours avec l'IA
        </a>
      </div>
    </article>
  `;
}

// ===== Tableau de bord =====
function renderDashboard() {
  const container = $("#dashboard");
  if (!container) return;
  const activity = loadActivity();

  const totalMsgs = Object.values(activity.messages).reduce((s, n) => s + n, 0);
  const ranked = Object.entries(activity.messages)
    .map(([id, n]) => ({ id, n, a: getAssistant(id) }))
    .filter((x) => x.a)
    .sort((x, y) => y.n - x.n);
  const top = ranked[0];

  const lastDate = activity.lastActive ? new Date(activity.lastActive) : null;
  const lastStr = lastDate
    ? lastDate.toLocaleDateString("fr-FR", { day: "numeric", month: "long" }) +
      " à " +
      lastDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    : "—";

  const recentCourses = activity.coursesViewed
    .map((id) => COURSES.find((c) => c.id === id))
    .filter(Boolean)
    .slice(0, 5);
  const recentExos = activity.exercisesStarted
    .map((id) => EXERCISES.find((e) => e.id === id))
    .filter(Boolean)
    .slice(0, 5);

  container.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Messages échangés</div>
        <div class="stat-value">${totalMsgs}</div>
        <div class="stat-sub muted">toutes matières confondues</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Assistant le plus utilisé</div>
        <div class="stat-value">${top ? escapeHtml(top.a.icon) + " " + escapeHtml(top.a.subject) : "—"}</div>
        <div class="stat-sub muted">${top ? top.n + " messages" : "Commence à discuter !"}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Cours consultés</div>
        <div class="stat-value">${activity.coursesViewed.length}</div>
        <div class="stat-sub muted">${recentCourses.length ? "dont " + recentCourses.length + " récents" : "—"}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Dernière activité</div>
        <div class="stat-value stat-small">${lastStr}</div>
        <div class="stat-sub muted">${activity.lastActive ? "Continue sur ta lancée" : "—"}</div>
      </div>
    </div>

    <div class="dash-grid">
      <section class="dash-block">
        <h2>Progression par matière</h2>
        ${
          ranked.length
            ? `<div class="progress-list">
                ${ranked
                  .map((r) => {
                    const pct = Math.min(100, Math.round((r.n / Math.max(totalMsgs, 1)) * 100));
                    return `
                      <div class="progress-row" style="--accent:${r.a.color}">
                        <div class="progress-label">
                          <span>${escapeHtml(r.a.icon)} ${escapeHtml(r.a.subject)}</span>
                          <span class="muted">${r.n} message${r.n > 1 ? "s" : ""}</span>
                        </div>
                        <div class="progress-track"><div class="progress-bar" style="width:${pct}%"></div></div>
                      </div>`;
                  })
                  .join("")}
              </div>`
            : `<div class="empty">Aucune discussion pour l'instant. <a href="assistants.html">Démarrer un chat</a>.</div>`
        }
      </section>

      <section class="dash-block">
        <h2>Cours récents</h2>
        ${
          recentCourses.length
            ? `<ul class="recent-list">
                ${recentCourses
                  .map((c) => {
                    const a = getAssistant(c.assistant);
                    return `<li style="--accent:${a.color}">
                      <a href="fiche.html?id=${c.id}">
                        <span class="recent-icon">${escapeHtml(a.icon)}</span>
                        <span class="recent-title">${escapeHtml(c.title)}</span>
                        <span class="muted recent-sub">${escapeHtml(c.subject)}</span>
                      </a>
                    </li>`;
                  })
                  .join("")}
              </ul>`
            : `<div class="empty">Aucun cours consulté. <a href="cours.html">Voir le catalogue</a>.</div>`
        }
      </section>

      <section class="dash-block">
        <h2>Exercices démarrés</h2>
        ${
          recentExos.length
            ? `<ul class="recent-list">
                ${recentExos
                  .map((e) => {
                    const a = getAssistant(e.assistant);
                    return `<li style="--accent:${a.color}">
                      <a href="chat.html?assistant=${a.id}&exercise=${e.id}">
                        <span class="recent-icon">${escapeHtml(a.icon)}</span>
                        <span class="recent-title">${escapeHtml(e.title)}</span>
                        <span class="muted recent-sub">${escapeHtml(e.difficulty)}</span>
                      </a>
                    </li>`;
                  })
                  .join("")}
              </ul>`
            : `<div class="empty">Aucun exercice démarré. <a href="exercices.html">Voir les exercices</a>.</div>`
        }
      </section>

      <section class="dash-block">
        <h2>Données</h2>
        <p class="muted">Toutes ces statistiques sont stockées <strong>localement</strong> dans ton navigateur (aucune donnée envoyée). Tu peux les remettre à zéro :</p>
        <button class="btn btn-ghost" id="reset-activity">Réinitialiser mes statistiques</button>
      </section>
    </div>
  `;

  const reset = $("#reset-activity");
  if (reset) {
    reset.addEventListener("click", () => {
      if (confirm("Réinitialiser toutes les statistiques ?")) {
        localStorage.removeItem(STORAGE.activity);
        ASSISTANTS.forEach((a) => clearHistory(a.id));
        renderDashboard();
      }
    });
  }
}

// ===== Réponse intelligente =====
const rotationIndex = {};
function smartReply(assistantId, userText) {
  const text = (userText || "").toLowerCase();
  const smart = SMART_RESPONSES[assistantId] || [];
  const hit = smart.find((entry) =>
    entry.keywords.some((kw) => text.includes(kw.toLowerCase()))
  );
  if (hit) return hit.answer;

  const pool = FALLBACK_RESPONSES[assistantId] || ["Je réfléchis à ta question…"];
  const idx = rotationIndex[assistantId] || 0;
  rotationIndex[assistantId] = idx + 1;
  return pool[idx % pool.length];
}

// ===== Chat =====
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
  let contextLabel = "";
  let prefillPrompt = "";

  if (courseId) {
    const c = COURSES.find((x) => x.id === courseId);
    if (c) {
      contextLabel = `Cours : ${c.title}`;
      trackCourse(c.id);
      ctx.innerHTML = `
        <div class="context-title">📘 Cours</div>
        <div class="context-name">${escapeHtml(c.title)}</div>
        <div class="muted">${escapeHtml(c.subject)} · ${escapeHtml(c.level)} · ${escapeHtml(c.chapter)}</div>
        <a class="context-link" href="fiche.html?id=${c.id}">Ouvrir la fiche →</a>
      `;
    }
  } else if (exerciseId) {
    const e = EXERCISES.find((x) => x.id === exerciseId);
    if (e) {
      contextLabel = `Exercice : ${e.title}`;
      prefillPrompt = e.prompt || "";
      trackExercise(e.id);
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
    const input = $("#chat-input");
    input.value = btn.textContent;
    input.focus();
  });

  // Bouton "Nouvelle conversation"
  const newBtn = $("#new-conversation");
  if (newBtn) {
    newBtn.addEventListener("click", () => {
      if (!confirm("Démarrer une nouvelle conversation ? L'historique sera effacé.")) return;
      clearHistory(assistant.id);
      const msgs = $("#chat-messages");
      msgs.innerHTML = "";
      bootstrapConversation();
    });
  }

  // Rendu d'un message en bulle
  const msgs = $("#chat-messages");
  function pushBubble(role, text, persist = true) {
    const el = document.createElement("div");
    el.className = `bubble bubble-${role === "user" ? "user" : "bot"}`;
    if (role === "user") {
      el.textContent = text;
    } else {
      el.innerHTML = `<div class="markdown">${md(text)}</div>`;
    }
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
    if (persist) {
      const history = loadHistory(assistant.id);
      history.push({ role, text, ts: Date.now() });
      saveHistory(assistant.id, history);
    }
  }

  function pushTyping() {
    const el = document.createElement("div");
    el.className = "bubble bubble-bot typing-bubble";
    el.innerHTML = `<span class="typing"><span></span><span></span><span></span></span>`;
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
    return el;
  }

  function bootstrapConversation() {
    const history = loadHistory(assistant.id);
    if (history.length === 0) {
      pushBubble("bot", assistant.intro);
      if (contextLabel) {
        pushBubble(
          "bot",
          `Je vois que tu travailles sur : « **${contextLabel}** ». On commence par où ?`
        );
      }
      if (prefillPrompt) {
        $("#chat-input").value = prefillPrompt;
      }
    } else {
      history.forEach((m) => pushBubble(m.role, m.text, false));
    }
  }

  bootstrapConversation();

  // Soumission
  $("#chat-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = $("#chat-input");
    const text = input.value.trim();
    if (!text) return;
    pushBubble("user", text);
    input.value = "";
    trackMessage(assistant.id);
    const typing = pushTyping();
    setTimeout(() => {
      typing.remove();
      pushBubble("bot", smartReply(assistant.id, text));
      trackMessage(assistant.id);
    }, 600 + Math.random() * 700);
  });
}

// ===== Bootstrap global =====
document.addEventListener("DOMContentLoaded", initTheme);
