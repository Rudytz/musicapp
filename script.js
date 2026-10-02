const $ = id => document.getElementById(id);
const audio = $("audio");

/* ---------- 1. SONG DATA ----------
   Songs with a file: play that mp3 from the "songs" folder (see songs/README.txt).
   Songs without a file are demo melodies the browser makes itself. */
const songs = [
  {title:"God's Plan", artist:"Drake", mood:"hyped", file:"songs/gods-plan.mp3"},
  {title:"One Dance", artist:"Drake", mood:"chill", file:"songs/one-dance.mp3"},
  {title:"Hotline Bling", artist:"Drake", mood:"chill", file:"songs/hotline-bling.mp3"},
  {title:"Passionfruit", artist:"Drake", mood:"chill", file:"songs/passionfruit.mp3"},
  {title:"Come and See Me", artist:"PARTYNEXTDOOR", mood:"sad", file:"songs/come-and-see-me.mp3"},
  {title:"Recognize", artist:"PARTYNEXTDOOR", mood:"chill", file:"songs/recognize.mp3"},
  {title:"Persian Rugs", artist:"PARTYNEXTDOOR", mood:"hyped", file:"songs/persian-rugs.mp3"},
  {title:"No Idea", artist:"Don Toliver", mood:"chill", file:"songs/no-idea.mp3"},
  {title:"After Party", artist:"Don Toliver", mood:"hyped", file:"songs/after-party.mp3"},
  {title:"Cardigan", artist:"Don Toliver", mood:"chill", file:"songs/cardigan.mp3"},
  {title:"Rainy Window", artist:"Demo Band", mood:"chill", root:220, scale:[0,3,5,7,10], bpm:80, wave:"sine", pat:[0,2,4,2,1,3,2,-1,0,2,4,3,2,1,0,-1]},
  {title:"Night Drive", artist:"Demo Band", mood:"chill", root:196, scale:[0,2,3,7,8], bpm:92, wave:"triangle", pat:[0,-1,2,3,4,-1,3,2,0,-1,2,3,1,-1,0,-1]},
  {title:"Rocket Fuel", artist:"Demo Band", mood:"hyped", root:261.6, scale:[0,2,4,7,9], bpm:150, wave:"square", pat:[0,2,4,2,4,3,4,2,0,2,4,3,4,2,1,0]},
  {title:"Sprint Finish", artist:"Demo Band", mood:"hyped", root:293.7, scale:[0,2,4,5,7], bpm:140, wave:"square", pat:[4,3,2,4,3,2,1,2,4,3,2,4,2,1,0,0]},
  {title:"Deep Work", artist:"Demo Band", mood:"focus", root:174.6, scale:[0,2,4,7,9], bpm:100, wave:"sine", pat:[0,-1,-1,2,-1,-1,4,-1,3,-1,-1,2,-1,-1,1,-1]},
  {title:"Empty Hallway", artist:"Demo Band", mood:"sad", root:164.8, scale:[0,3,5,7,8], bpm:64, wave:"triangle", pat:[4,3,2,-1,3,2,1,-1,2,1,0,-1,1,0,0,-1]}
];
const moods = ["chill", "hyped", "focus", "sad"];

/* Builds a short WAV melody from a song's note pattern */
function makeWav(s) {
  const sr = 22050, beat = 60 / s.bpm / 2;
  const n = Math.floor(sr * beat * s.pat.length * 2); // plays the pattern twice
  const buf = new Int16Array(n);
  for (let i = 0; i < n; i++) {
    const d = s.pat[Math.floor(i / sr / beat) % s.pat.length];
    if (d < 0) continue;
    const t = (i / sr) % beat;
    const p = (s.root * 2 ** (s.scale[d] / 12) * t) % 1;
    const v = s.wave === "sine" ? Math.sin(2 * Math.PI * p)
            : s.wave === "square" ? (p < .5 ? .5 : -.5)
            : 4 * Math.abs(p - .5) - 1;
    buf[i] = v * Math.min(1, t / .01) * Math.exp(-t * 3) * 0.35 * 32767;
  }
  const h = new DataView(new ArrayBuffer(44));
  const w = (o, txt) => [...txt].forEach((c, k) => h.setUint8(o + k, c.charCodeAt(0)));
  w(0, "RIFF"); h.setUint32(4, 36 + n * 2, true); w(8, "WAVEfmt ");
  h.setUint32(16, 16, true); h.setUint16(20, 1, true); h.setUint16(22, 1, true);
  h.setUint32(24, sr, true); h.setUint32(28, sr * 2, true); h.setUint16(32, 2, true);
  h.setUint16(34, 16, true); w(36, "data"); h.setUint32(40, n * 2, true);
  return URL.createObjectURL(new Blob([h, buf], {type: "audio/wav"}));
}

/* ---------- 2. PLAYER ---------- */
let queue = songs, cur = -1, mood = "chill";
let saved = [];
try { saved = JSON.parse(localStorage.getItem("playlist") || "[]"); } catch (e) {}

function playSong(i, list) {
  if (list) queue = list;
  cur = i;
  const s = queue[i];
  audio.src = s.src || (s.src = s.file || makeWav(s));
  audio.play().catch(() => {});
  $("nowTitle").textContent = s.title;
  $("nowArtist").textContent = s.artist;
  startViz();
}
const step = dir => { if (queue.length) playSong((cur + dir + queue.length) % queue.length); };
$("play").onclick = () => cur < 0 ? playSong(0, songs) : audio.paused ? audio.play() : audio.pause();
$("next").onclick = () => step(1);
$("prev").onclick = () => step(-1);
audio.onplay = () => { $("play").textContent = "⏸"; $("play").setAttribute("aria-label", "Pause"); };
audio.onpause = () => { $("play").textContent = "▶"; $("play").setAttribute("aria-label", "Play"); };
audio.onended = () => step(1);
audio.onerror = () => {
  const s = queue[cur];
  if (s && s.file) $("nowArtist").textContent = "File not found. Add " + s.file + " to your folder.";
};
audio.ontimeupdate = () => { $("seek").value = audio.duration ? audio.currentTime / audio.duration * 100 : 0; };
$("seek").oninput = e => { if (audio.duration) audio.currentTime = e.target.value / 100 * audio.duration; };
$("vol").oninput = e => { audio.volume = e.target.value; };
audio.volume = 0.8;

/* ---------- 3. LISTS, MOODS, PLAYLIST ---------- */
const inPlaylist = title => saved.includes(title);

function renderList(ul, list) {
  ul.innerHTML = "";
  list.forEach((s, i) => {
    const li = document.createElement("li");
    li.innerHTML = `<button class="song"><b>${s.title}</b><span>${s.artist} · ${s.mood}</span></button>
      <button class="add" aria-label="Add or remove from playlist">${inPlaylist(s.title) ? "✓" : "+"}</button>`;
    li.children[0].onclick = () => playSong(i, list);
    li.children[1].onclick = () => {
      saved = inPlaylist(s.title) ? saved.filter(t => t !== s.title) : [...saved, s.title];
      try { localStorage.setItem("playlist", JSON.stringify(saved)); } catch (e) {}
      renderAll();
    };
    ul.append(li);
  });
}

function renderAll() {
  renderList($("libList"), songs);
  renderList($("moodList"), songs.filter(s => s.mood === mood));
  const mine = songs.filter(s => inPlaylist(s.title));
  renderList($("plList"), mine);
  $("emptyMsg").style.display = mine.length ? "none" : "block";
  $("moodBtns").innerHTML = "";
  moods.forEach(m => {
    const b = document.createElement("button");
    b.textContent = m;
    b.className = m === mood ? "on" : "";
    b.onclick = () => { mood = m; renderAll(); };
    $("moodBtns").append(b);
  });
}
renderAll();

/* ---------- 4. NAVIGATION ---------- */
document.querySelectorAll("nav button").forEach(b => b.onclick = () => {
  document.querySelectorAll("nav button, .view").forEach(el => el.classList.remove("on"));
  b.classList.add("on");
  $(b.dataset.view).classList.add("on");
});

/* ---------- 5. QUIZ ---------- */
const questions = [
  {q: "How many keys does a standard piano have?", a: ["66", "76", "88", "96"], c: 2},
  {q: "How many strings does a standard guitar have?", a: ["4", "6", "8", "12"], c: 1},
  {q: "In music, what does tempo describe?", a: ["Loudness", "Speed", "Pitch", "Mood"], c: 1},
  {q: "Which genre began in the Bronx in the 1970s?", a: ["Hip-hop", "Reggae", "Techno", "Country"], c: 0},
  {q: "What does the word forte mean?", a: ["Slow", "Soft", "Loud", "Sweet"], c: 2}
];
let qi = 0, score = 0;
function showQuestion() {
  const box = $("quizBox");
  if (qi >= questions.length) {
    box.innerHTML = `<p>Your score</p><div class="score">${score} / ${questions.length}</div><button id="again">Play again</button>`;
    $("again").onclick = () => { qi = 0; score = 0; showQuestion(); };
    return;
  }
  const item = questions[qi];
  box.innerHTML = `<p>Question ${qi + 1} of ${questions.length}</p><h3>${item.q}</h3>`;
  item.a.forEach((text, i) => {
    const b = document.createElement("button");
    b.textContent = text;
    b.onclick = () => {
      box.querySelectorAll("button").forEach(x => x.disabled = true);
      b.classList.add(i === item.c ? "right" : "wrong");
      if (i === item.c) score++;
      else box.querySelectorAll("button")[item.c].classList.add("right");
      setTimeout(() => { qi++; showQuestion(); }, 1100);
    };
    box.append(b);
  });
}
showQuestion();

/* ---------- 6. VISUALIZER ----------
   Browsers silence local files (opened by double-click) when they are routed
   through the analyser, so on file:// the bars use a simple animation instead.
   Run the site with a local server (e.g. VS Code Live Server) for real audio bars. */
let ctx, analyser, drawing = false;
function startViz() {
  if (ctx) ctx.resume();
  if (!ctx && location.protocol !== "file:") {
    ctx = new AudioContext();
    const src = ctx.createMediaElementSource(audio);
    analyser = ctx.createAnalyser();
    analyser.fftSize = 128;
    src.connect(analyser);
    analyser.connect(ctx.destination);
  }
  if (!drawing) { drawing = true; draw(); }
}
function draw() {
  requestAnimationFrame(draw);
  const cv = $("cv"), g = cv.getContext("2d");
  const data = new Uint8Array(analyser ? analyser.frequencyBinCount : 64);
  if (analyser) analyser.getByteFrequencyData(data);
  else if (!audio.paused) data.forEach((_, i) => data[i] = 120 + 100 * Math.sin(Date.now() / 250 + i * .5) * Math.cos(i / 9));
  g.clearRect(0, 0, cv.width, cv.height);
  const w = cv.width / data.length;
  data.forEach((v, i) => {
    const h = v / 255 * cv.height;
    g.fillStyle = `hsl(${45 + i * 3}, 90%, 65%)`;
    g.fillRect(i * w + 1, cv.height - h, w - 2, h);
  });
}

/* ---------- 7. TIMELINE ---------- */
const eras = [
  ["1950s", "Rock 'n' roll arrives", "Electric guitars and teen culture change pop music for good."],
  ["1960s", "The British Invasion", "Bands write their own songs, and albums become works of art."],
  ["1970s", "Disco and hip-hop", "Dance floors fill up while block parties in the Bronx start a new genre."],
  ["1980s", "Synths and MTV", "Music videos make how an artist looks as important as how they sound."],
  ["1990s", "Alternative and R&B", "Grunge, boy bands, and hip-hop all reach the mainstream."],
  ["2000s", "Digital music", "MP3s, iPods, and later streaming put every song in your pocket."],
  ["2010s-now", "Streaming and social media", "Playlists and short videos decide which songs go viral."]
];
$("tl").innerHTML = eras.map(e => `<li><h3>${e[0]}: ${e[1]}</h3><p>${e[2]}</p></li>`).join("");