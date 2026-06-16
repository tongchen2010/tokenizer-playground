// Tokenizer Playground — tokenize text with the real GPT-4 (cl100k_base) BPE,
// entirely in the browser. Shows each token as a colored chip so you can see
// exactly where the model splits words, spaces, numbers and emoji.

const REPO_URL = "https://github.com/tongchen2010/tokenizer-playground";
const TOK_URL = "https://esm.run/gpt-tokenizer"; // cl100k_base (GPT-3.5 / GPT-4)

const COLORS = [
  "rgba(110,168,254,0.28)", "rgba(139,124,255,0.28)", "rgba(63,185,80,0.28)",
  "rgba(210,153,34,0.28)", "rgba(224,108,159,0.28)", "rgba(86,199,199,0.28)",
];

const $ = (id) => document.getElementById(id);
const input = $("input"), output = $("output"), statusEl = $("status");
const tokCount = $("tok-count"), charCount = $("char-count"), ratioEl = $("ratio");
const viewText = $("view-text"), viewIds = $("view-ids");
$("repo-link").href = REPO_URL;

let encode = null, decode = null, mode = "text";

init();
async function init() {
  try {
    const mod = await import(TOK_URL);
    encode = mod.encode;
    decode = mod.decode;
  } catch (e) {
    statusEl.textContent = "Couldn't load the tokenizer library (are you online?).";
    statusEl.classList.add("err");
    console.error(e);
    return;
  }
  statusEl.textContent = "Tokenizer ready (cl100k_base). Type above to tokenize.";
  input.addEventListener("input", debounce(render, 120));
  viewText.addEventListener("click", () => setMode("text"));
  viewIds.addEventListener("click", () => setMode("ids"));
  render();
}

function setMode(m) {
  mode = m;
  viewText.classList.toggle("active", m === "text");
  viewIds.classList.toggle("active", m === "ids");
  render();
}

function render() {
  if (!encode) return;
  const text = input.value;
  const ids = text ? encode(text) : [];
  tokCount.textContent = ids.length.toLocaleString();
  charCount.textContent = text.length.toLocaleString();
  ratioEl.textContent = ids.length ? (text.length / ids.length).toFixed(2) : "0";

  output.innerHTML = "";
  ids.forEach((id, i) => {
    const span = document.createElement("span");
    span.className = "tok" + (mode === "ids" ? " id" : "");
    span.style.background = COLORS[i % COLORS.length];
    if (mode === "ids") {
      span.textContent = String(id);
    } else {
      let piece = "�";
      try { piece = decode([id]); } catch (e) { /* partial byte token */ }
      // make newlines visible while still breaking the line
      span.textContent = piece.replace(/\n/g, "⏎\n");
    }
    span.title = `token #${i + 1} · id ${id}`;
    output.appendChild(span);
  });
}

function debounce(fn, ms) {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}
