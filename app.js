/* sh… app logic. Data lives in data.js (loaded first). */
(() => {
  const STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1 C13 9 15 11 23 12 C15 13 13 15 12 23 C11 15 9 13 1 12 C9 11 11 9 12 1Z"/></svg>';

  const state = {
    moods: ["swoony"],
    lang: "both",
    tune: { len: 2, era: 2, pop: 2 },
    pool: [],
    page: 0,
    live: null,         // null = unknown, true = Open Library works, false = use built-in shelf
    cache: new Map(),
  };

  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const moodById = (id) => MOODS.find((m) => m.id === id);
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  /* ---------------- mood stickers ---------------- */
  const moodsEl = $("#moods");
  moodsEl.innerHTML = MOODS.map((m) => `
    <button class="sticker" type="button" id="mood-${m.id}" data-id="${m.id}" aria-pressed="false"
      style="--c:${m.color};--on:${m.on}">
      <span class="star">${STAR}</span>${esc(m.label)}
    </button>`).join("");
  moodsEl.addEventListener("click", (e) => {
    const b = e.target.closest(".sticker"); if (!b) return;
    const id = b.dataset.id;
    const i = state.moods.indexOf(id);
    if (i >= 0) state.moods.splice(i, 1);
    else { state.moods.push(id); if (state.moods.length > 2) state.moods.shift(); }
    paintMoods();
  });
  function paintMoods() {
    moodsEl.querySelectorAll(".sticker").forEach((b) => b.setAttribute("aria-pressed", state.moods.includes(b.dataset.id)));
    $("#go").disabled = state.moods.length === 0;
  }

  /* ---------------- tick sliders ---------------- */
  const TICKS = 25; // 5 stops, 6 ticks apart
  $("#tuners").innerHTML = TUNERS.map((t) => `
    <div class="tuner">
      <div class="bubble">${esc(t.ask)}</div>
      <div class="tval" id="val-${t.id}"></div>
      <div class="track">
        <div class="ticks" aria-hidden="true">${Array.from({ length: TICKS }, (_, i) => `<i${i % 6 === 0 ? ' class="major"' : ""}></i>`).join("")}</div>
        <input type="range" id="tune-${t.id}" min="0" max="4" step="1" value="${state.tune[t.id]}" aria-label="${esc(t.ask)}">
      </div>
      <div class="ends"><span>${esc(t.ends[0])}</span><span>${esc(t.ends[1])}</span></div>
    </div>`).join("");
  TUNERS.forEach((t) => {
    const input = $(`#tune-${t.id}`);
    const paint = () => {
      const v = +input.value; state.tune[t.id] = v;
      $(`#val-${t.id}`).textContent = t.stops[v];
      input.setAttribute("aria-valuetext", t.stops[v]);
      const cur = v * 6;
      input.parentElement.querySelectorAll(".ticks i").forEach((el, i) => {
        el.classList.toggle("on", i < cur);
        el.classList.toggle("cur", i === cur);
      });
    };
    input.addEventListener("input", paint);
    paint();
  });

  /* ---------------- language switch ---------------- */
  const segBtns = document.querySelectorAll(".seg button");
  segBtns.forEach((b) => b.addEventListener("click", () => {
    state.lang = b.dataset.lang;
    segBtns.forEach((x) => x.setAttribute("aria-checked", String(x === b)));
  }));

  /* ---------------- quote card ---------------- */
  function paintQuote() {
    const m = moodById(state.moods[state.moods.length - 1]) || MOODS[0];
    const q = $("#quote");
    q.style.setProperty("--c", m.color);
    q.style.setProperty("--top", m.on === "#ffffff" ? `color-mix(in srgb, ${m.color} 72%, #ffffff)` : "#ffffff");
    q.style.color = m.on;
    q.innerHTML = `
      <svg class="sparkles" viewBox="0 0 100 164" preserveAspectRatio="none" aria-hidden="true">
        ${[[12,20],[86,14],[80,60],[16,78],[90,110],[10,140],[55,150],[70,32]].map(([x,y],i)=>`<path transform="translate(${x} ${y}) scale(${0.18 + (i%3)*0.08})" d="M0 -12 C1 -4 4 -1 12 0 C4 1 1 4 0 12 C-1 4 -4 1 -12 0 C-4 -1 -1 -4 0 -12Z" fill="#fff" opacity=".9"/>`).join("")}
      </svg>
      <div class="eyebrow">For the ${esc(m.label.toLowerCase())} reader</div>
      <svg class="big-star" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1 C13 9 15 11 23 12 C15 13 13 15 12 23 C11 15 9 13 1 12 C9 11 11 9 12 1Z" fill="${m.on}"/></svg>
      <div>
        <blockquote>“${esc(m.quote.text)}”</blockquote>
        <cite>${esc(m.quote.who)}<span>${esc(m.quote.book)}</span></cite>
      </div>`;
  }

  /* ---------------- helpers ---------------- */
  const withTimeout = (p, ms) => Promise.race([p, new Promise((_, r) => setTimeout(() => r(new Error("timeout")), ms))]);
  const yearOf = (d) => parseInt(String(d || "").slice(0, 4), 10) || undefined;
  const pick = (arr, n) => shuffle(arr || []).slice(0, n);
  function cleanText(html) {
    // DOMParser never runs scripts or loads images, so it is safe for untrusted HTML
    let d = new DOMParser().parseFromString(html || "", "text/html").body.textContent || "";
    d = d.replace(/\s+/g, " ").trim();
    if (d.length > 260) d = d.slice(0, 257).replace(/\s+\S*$/, "") + "…";
    return d;
  }

  /* ---------------- Google Books (main source) ---------------- */
  async function googleQuery(q, moodId, isSubject) {
    const p = new URLSearchParams({
      q, maxResults: "20", printType: "books",
      orderBy: state.tune.era >= 3 ? "newest" : "relevance",
    });
    // "Hidden gems" digs deeper into subject results; author searches always start at the top
    const start = isSubject ? [20, 10, 0, 0, 0][state.tune.pop] : 0;
    if (start) p.set("startIndex", String(start));
    if (state.lang !== "both") p.set("langRestrict", state.lang);
    if (GOOGLE_BOOKS_KEY) p.set("key", GOOGLE_BOOKS_KEY);
    const res = await withTimeout(fetch(`https://www.googleapis.com/books/v1/volumes?${p}`), 9000);
    if (!res.ok) throw new Error("Google Books " + res.status);
    const data = await res.json();
    return (data.items || []).map((it) => {
      const v = it.volumeInfo || {};
      const thumb = v.imageLinks?.thumbnail || v.imageLinks?.smallThumbnail || "";
      return {
        title: v.title,
        author: (v.authors || []).slice(0, 2).join(", "),
        year: yearOf(v.publishedDate),
        pages: v.pageCount || undefined,
        img: thumb ? thumb.replace(/^http:/, "https:").replace("&edge=curl", "") : "",
        desc: cleanText(v.description),
        lang: v.language,
        link: v.infoLink || v.canonicalVolumeLink || "",
        moods: [moodId],
      };
    }).filter((b) => b.title && b.author && (state.lang !== "both" || b.lang === "fr" || b.lang === "en"));
  }

  async function fetchGoogle() {
    const jobs = [];
    const two = state.moods.length > 1;
    state.moods.forEach((id) => {
      const m = moodById(id);
      pick(m.subjects, two ? 1 : 2).forEach((s) => jobs.push(googleQuery(`subject:"${s}"`, id, true)));
      pick(m.authors, two ? 2 : 3).forEach((a) => jobs.push(googleQuery(`inauthor:"${a}"`, id, false)));
    });
    const results = await Promise.allSettled(jobs);
    const lists = results.filter((r) => r.status === "fulfilled").map((r) => shuffle(r.value));
    if (!lists.length) throw results[0]?.reason || new Error("Google Books failed");
    // Take turns across searches so one author doesn't fill the whole shelf
    const seen = new Map(), out = [];
    const longest = Math.max(0, ...lists.map((l) => l.length));
    for (let i = 0; i < longest; i++) for (const l of lists) {
      const b = l[i]; if (!b) continue;
      const k = (b.title + "|" + b.author.split(",")[0]).toLowerCase().replace(/[^\p{L}\p{N}|]/gu, "");
      const prev = seen.get(k);
      if (prev) {
        b.moods.forEach((x) => { if (!prev.moods.includes(x)) prev.moods.push(x); });
        if (!prev.img && b.img) prev.img = b.img;
        if (!prev.desc && b.desc) prev.desc = b.desc;
        continue;
      }
      seen.set(k, b); out.push(b);
    }
    return out;
  }

  /* ---------------- Open Library (backup source) ---------------- */
  async function fetchOpenLibrary() {
    const subjects = [...new Set(state.moods.flatMap((id) => moodById(id).subjects))];
    const q = `subject:(${subjects.map((s) => `"${s}"`).join(" OR ")})`;
    const sort = TUNERS[2].sort[state.tune.pop];
    const params = new URLSearchParams({
      q, limit: "80",
      fields: "key,title,author_name,cover_i,first_publish_year,number_of_pages_median,first_sentence",
    });
    if (state.lang === "fr") params.set("language", "fre");
    if (state.lang === "en") params.set("language", "eng");
    if (sort) params.set("sort", sort);
    const res = await withTimeout(fetch(`https://openlibrary.org/search.json?${params}`), 9000);
    if (!res.ok) throw new Error("Open Library " + res.status);
    const data = await res.json();
    const list = (data.docs || []).filter((d) => d.title && d.author_name).map((d) => ({
      key: d.key,
      title: d.title,
      author: d.author_name.slice(0, 2).join(", "),
      year: d.first_publish_year,
      pages: d.number_of_pages_median,
      img: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg` : "",
      desc: Array.isArray(d.first_sentence) ? d.first_sentence[0] : "",
      link: `https://openlibrary.org${d.key}`,
      moods: state.moods.slice(),
    }));
    return sort === "rating" || sort === "readinglog" ? list : shuffle(list);
  }

  // Open Library search results have no description, so fetch it for the books on screen
  async function fillDescriptions(books) {
    await Promise.all(books.map(async (b) => {
      if (!b.key || b.full) return;
      if (state.cache.has(b.key)) { b.desc = state.cache.get(b.key) || b.desc; b.full = true; return; }
      try {
        const res = await withTimeout(fetch(`https://openlibrary.org${b.key}.json`), 7000);
        const w = await res.json();
        let d = typeof w.description === "string" ? w.description : w.description?.value || "";
        d = d.split(/\n\s*\n|-{3,}|\(\[source\]/)[0].replace(/\[(.*?)\]\(.*?\)/g, "$1").trim();
        if (d.length > 260) d = d.slice(0, 257).replace(/\s+\S*$/, "") + "…";
        state.cache.set(b.key, d);
        if (d) b.desc = d;
      } catch (_) { /* keep first sentence */ }
      b.full = true;
    }));
  }

  /* ---------------- sliders, applied to any source ---------------- */
  function applySliders(list) {
    const len = TUNERS[0].range[state.tune.len];
    const era = TUNERS[1].range[state.tune.era];
    const ok = (v, r) => !r || (v && v >= r[0] && v <= r[1]);
    return list.filter((b) => ok(b.pages, len) && ok(b.year, era));
  }
  // Books with a cover and a description go first
  const quality = (b) => (b.img ? 0 : 1) + (b.desc || b.key ? 0 : 1);
  const byQuality = (list) => list.slice().sort((a, b) => quality(a) - quality(b));

  function fromShelf() {
    const moodHit = SHELF.filter((b) => b.moods.some((m) => state.moods.includes(m)));
    const score = (b) => state.moods.filter((m) => b.moods.includes(m)).length;
    let list = applySliders(moodHit);
    let relaxed = false;
    if (list.length < 3) { list = moodHit; relaxed = true; }
    list = shuffle(list).sort((a, b) => score(b) - score(a));
    return { list, relaxed };
  }

  /* ---------------- rendering ---------------- */
  function coverHTML(b, m) {
    const plain = `<div class="plain" style="--on:${m.on}"><strong>${esc(b.title)}</strong><span>${esc(b.author)}</span></div>`;
    const img = b.img ? `<img alt="Cover of ${esc(b.title)}" loading="lazy" referrerpolicy="no-referrer" src="${esc(b.img)}" onerror="this.remove()">` : "";
    return `<div class="cover" style="--c:${m.color}">${plain}${img}</div>`;
  }

  function bookLink(b) {
    return b.link || `https://www.google.com/search?tbm=bks&q=${encodeURIComponent(b.title + " " + b.author)}`;
  }

  function renderBooks(books) {
    const shelf = $("#shelf");
    if (!books.length) {
      shelf.innerHTML = `<p class="empty">No books matched those settings. Try moving a slider back toward the middle, switching the language to Both, or picking another mood.</p>`;
      return;
    }
    shelf.innerHTML = `<div class="books">${books.map((b, i) => {
      const m = moodById(b.moods.find((x) => state.moods.includes(x)) || state.moods[0]);
      return `
      <article class="book" style="--i:${i};--c:${m.color}">
        ${coverHTML(b, m)}
        <div class="meta">${b.lang === "fr" ? '<span class="chip">FR</span>' : ""}<span class="chip">${esc(m.label)}</span></div>
        <div>
          <h3>${esc(b.title)}</h3>
          <p class="by">${esc(b.author)}</p>
        </div>
        <p class="desc">${esc(b.desc || "No description yet. Open the book page to find out more.")}</p>
        <div class="foot">
          <a href="${esc(bookLink(b))}" target="_blank" rel="noopener">See the book <span aria-hidden="true">↗</span></a>
          <span class="yr">${b.year ? esc(b.year) : ""}${b.pages ? " · " + esc(b.pages) + "p" : ""}</span>
        </div>
      </article>`;
    }).join("")}</div>`;
  }

  function loading() {
    $("#shelf").innerHTML = `
      <div class="loading" role="status">
        <svg viewBox="0 0 220 60" aria-hidden="true">
          <path class="thread" d="M10 34 H210"/>
          <g class="needle"><rect x="-1.5" y="6" width="3" height="46" rx="1.5" fill="#f3f1ec"/><ellipse cx="0" cy="12" rx="1" ry="3" fill="#0b0b0b"/></g>
        </svg>
        <p>Stitching your shelf…</p>
      </div>`;
  }

  function setNotice(html) { $("#notice").innerHTML = html ? `<p class="notice">${html}</p>` : ""; }

  function paintHead() {
    const names = state.moods.map((id) => moodById(id).label.toLowerCase());
    $("#shelfLabel").textContent = `Your shelf · ${names.join(" + ")}`;
    $("#shelfTitle").innerHTML = names.length > 1
      ? `Books for feeling <em>${esc(names[0])}</em> and <em>${esc(names[1])}</em>`
      : `Books for feeling <em>${esc(names[0])}</em>`;
  }

  function showPage() {
    if (state.page * 6 >= state.pool.length) state.page = 0;
    return state.pool.slice(state.page * 6, state.page * 6 + 6);
  }

  let ticket = 0;
  async function find() {
    if (!state.moods.length) return;
    const my = ++ticket;
    paintQuote(); paintHead(); loading(); setNotice("");
    state.page = 0;

    const sources = [["Google Books", fetchGoogle], ["Open Library", fetchOpenLibrary]];
    for (const [name, fetcher] of sources) {
      try {
        const raw = await fetcher();
        if (my !== ticket) return;
        const fits = applySliders(raw);
        let pool = byQuality(fits), note = "";
        if (fits.length < 6) {
          pool = pool.concat(byQuality(raw.filter((b) => !fits.includes(b))));
          if (raw.length > fits.length) note = "<b>Note</b><span>Only a few books matched every slider, so the closest picks for your mood are mixed in.</span>";
        }
        if (!pool.length) continue;
        if (name !== sources[0][0]) note = "<b>Backup</b><span>Google Books didn't answer, so these picks come from Open Library.</span>";
        state.pool = pool;
        const books = showPage();
        await fillDescriptions(books);
        if (my !== ticket) return;
        setNotice(note);
        renderBooks(books);
        return;
      } catch (_) { /* try the next source */ }
    }
    if (my !== ticket) return;

    const { list, relaxed } = fromShelf();
    state.pool = list;
    setNotice(
      "<b>Offline</b><span>Showing the built-in shelf because Google Books and Open Library couldn't be reached from here, so the language switch has no effect. Hosted on its own site, sh… searches both and shows the real covers." +
      (relaxed ? " Nothing on this shelf matched every slider, so these are the closest picks for your mood." : "") +
      "</span>"
    );
    renderBooks(showPage());
  }

  async function again() {
    if (!state.pool.length) return find();
    state.page++;
    if (state.page * 6 >= state.pool.length) { state.pool = shuffle(state.pool); state.page = 0; }
    const books = showPage();
    if (books.some((b) => b.key && !b.full)) { loading(); await fillDescriptions(books); }
    renderBooks(books);
  }

  $("#go").addEventListener("click", () => { find(); if (innerWidth < 860) $("#results").scrollIntoView({ behavior: "smooth", block: "start" }); });
  $("#again").addEventListener("click", again);

  /* ---------------- cross-stitch logo ---------------- */
  function drawLogo(animate) {
    const cv = $("#logo");
    const W = 320, H = 150, dpr = Math.min(devicePixelRatio || 1, 3);
    cv.width = W * dpr; cv.height = H * dpr;
    const ctx = cv.getContext("2d");
    ctx.scale(dpr, dpr);

    // Rasterize "sh…" in an italic serif at low resolution
    const cols = 40, rows = 19, cell = W / cols;
    const off = document.createElement("canvas");
    off.width = cols; off.height = rows;
    const o = off.getContext("2d");
    o.fillStyle = "#000";
    o.textBaseline = "alphabetic";
    o.font = `italic 400 22px ${getComputedStyle(document.body).getPropertyValue("--serif") || "Georgia, serif"}`;
    const shW = o.measureText("sh").width;
    const totalW = o.measureText("sh…").width;
    const x0 = Math.max(0, (cols - totalW) / 2 - 1);
    o.fillText("sh…", x0, 15.5);
    const px = o.getImageData(0, 0, cols, rows).data;
    const dotColors = ["#fbba00", "#e800b5", "#35c4ea"];

    const stitches = [];
    for (let x = 0; x < cols; x++) for (let y = 0; y < rows; y++) {
      if (px[(y * cols + x) * 4 + 3] > 110) {
        let color = "#f3f1ec";
        if (x - x0 > shW + 0.5) {
          const rel = (x - x0 - shW) / (totalW - shW);
          color = dotColors[Math.min(2, Math.floor(rel * 3))];
        }
        stitches.push({ x, y, color });
      }
    }

    function base() {
      ctx.clearRect(0, 0, W, H);
      // aida cloth holes
      ctx.fillStyle = "#222";
      for (let x = 0; x <= cols; x++) for (let y = 0; y <= rows; y++) {
        ctx.fillRect(x * cell - 0.6, y * cell - 0.6, 1.2, 1.2);
      }
    }
    function stitch(s) {
      const p = cell * 0.16, x = s.x * cell, y = s.y * cell;
      ctx.lineCap = "round";
      ctx.lineWidth = cell * 0.34;
      ctx.strokeStyle = s.color;
      ctx.globalAlpha = 0.82;
      ctx.beginPath(); ctx.moveTo(x + p, y + cell - p); ctx.lineTo(x + cell - p, y + p); ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.beginPath(); ctx.moveTo(x + p, y + p); ctx.lineTo(x + cell - p, y + cell - p); ctx.stroke();
      // tiny thread highlight
      ctx.strokeStyle = "rgba(255,255,255,.35)";
      ctx.lineWidth = cell * 0.08;
      ctx.beginPath(); ctx.moveTo(x + p * 1.4, y + p * 1.9); ctx.lineTo(x + cell - p * 2, y + cell - p * 1.5); ctx.stroke();
    }

    base();
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!animate || reduce) { stitches.forEach(stitch); return; }
    let i = 0;
    const per = Math.ceil(stitches.length / 40);
    (function step() {
      for (let k = 0; k < per && i < stitches.length; k++) stitch(stitches[i++]);
      if (i < stitches.length) requestAnimationFrame(step);
    })();
  }

  /* ---------------- start ---------------- */
  paintMoods();
  paintQuote();
  drawLogo(false);
  (document.fonts ? document.fonts.load('italic 400 22px "Instrument Serif"') : Promise.resolve())
    .catch(() => {}).then(() => drawLogo(true));
  find();
})();
