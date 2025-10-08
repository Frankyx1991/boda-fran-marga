// uploader.js — subida directa con constantes embebidas
(function(){
  // === CONFIG EMBEBIDA (no se pide nada al usuario) ===
  const ENDPOINT = "https://script.google.com/macros/s/AKfycbxIPYutBtB1wSUOXymWVLYKxPruemIoBCHiABfpl6GUWrLFTe-ysTooJ_EUp8qsFn5NSg/exec";
  const SECRET   = "FranMarga2025";            // “no lo toque”: mantenemos el mismo valor del backend
  const ALBUM    = "Boda Fran & Marga";        // subcarpeta destino dentro de la carpeta raíz

  const $ = (sel) => document.querySelector(sel);
  const statusEl  = () => document.getElementById('status');
  const resultsEl = () => document.getElementById('results');

  function logStatus(msg){ const el = statusEl(); if (el) el.textContent = msg; }
  function addResult(text, ok=true){
    const el = resultsEl(); if (!el) return;
    const li = document.createElement("li");
    li.textContent = text;
    li.style.color = ok ? "#9ff18b" : "#ff9f9f";
    el.prepend(li);
  }

  async function uploadFile(file){
    const fd = new FormData();
    fd.append("secret", SECRET);
    if (ALBUM) fd.append("album", ALBUM);
    fd.append("file", file, file.name);

    const res = await fetch(ENDPOINT, { method: "POST", body: fd });
    if (!res.ok) {
      const txt = await res.text().catch(()=> "");
      throw new Error(`HTTP ${res.status} ${res.statusText} → ${txt}`);
    }
    return res.json();
  }

  async function uploadSingle(file){
    try{
      if (!file) { logStatus("No se seleccionó archivo."); return; }
      logStatus(`Subiendo ${file.name}…`);
      const json = await uploadFile(file);
      if (json.ok) {
        addResult(`✔ ${file.name} → ${json.fileUrl || "(privado)"}`, true);
        logStatus("Listo.");
      } else {
        addResult(`✖ Error (${file.name}): ${json.error || "Desconocido"}`, false);
        logStatus("Ocurrió un error.");
      }
    } catch (e) {
      addResult(`✖ Exception: ${e.message}`, false);
      logStatus("Ocurrió un error.");
    }
  }

  window.POVUploader = { uploadSingle };
})();