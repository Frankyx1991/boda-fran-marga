const $ = (sel) => document.querySelector(sel);
const webAppUrlInput = $("#webAppUrl");
const secretInput = $("#secret");
const albumInput = $("#album");
const filesInput = $("#files");
const uploadBtn = $("#uploadBtn");
const statusEl = $("#status");
const resultsEl = $("#results");

function logStatus(msg){ statusEl.textContent = msg; }
function addResult(text, ok=true){
  const li = document.createElement("li");
  li.textContent = text;
  li.style.color = ok ? "#9ff18b" : "#ff9f9f";
  resultsEl.prepend(li);
}

async function uploadFile(file, endpoint, secret, album){
  const fd = new FormData();
  fd.append("secret", secret);
  if (album) fd.append("album", album);
  fd.append("file", file, file.name);

  const res = await fetch(endpoint, { method: "POST", body: fd });
  if (!res.ok) {
    const txt = await res.text().catch(()=> "");
    throw new Error(`HTTP ${res.status} ${res.statusText} → ${txt}`);
  }
  return res.json();
}

uploadBtn.addEventListener("click", async () => {
  const endpoint = webAppUrlInput.value.trim();
  const secret = secretInput.value.trim();
  const album = albumInput.value.trim();
  const files = Array.from(filesInput.files || []);

  resultsEl.innerHTML = "";
  if (!endpoint) return logStatus("Configura el endpoint de Apps Script.");
  if (!secret) return logStatus("Configura el token de seguridad (secret).");
  if (!files.length) return logStatus("Selecciona al menos 1 archivo.");

  uploadBtn.disabled = true;
  logStatus(`Subiendo ${files.length} archivo(s)…`);

  let ok = 0, ko = 0;
  for (const f of files) {
    try {
      const json = await uploadFile(f, endpoint, secret, album);
      if (json.ok) {
        ok++;
        addResult(`✔ Subido: ${f.name} → ${json.fileUrl || "(privado)"} `, true);
      } else {
        ko++;
        addResult(`✖ Error (${f.name}): ${json.error || "Desconocido"}`, false);
      }
    } catch (e) {
      ko++;
      addResult(`✖ Exception (${f.name}): ${e.message}`, false);
    }
  }
  logStatus(`Hecho. OK: ${ok} | KO: ${ko}`);
  uploadBtn.disabled = false;
});