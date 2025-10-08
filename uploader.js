// uploader.js — versión con alertas para diagnóstico
(function(){
  // === CONFIG EMBEBIDA (confirma que coinciden con tu backend) ===
  const ENDPOINT = "https://script.google.com/macros/s/AKfycbxIPYutBtB1wSUOXymWVLYKxPruemIoBCHiABfpl6GUWrLFTe-ysTooJ_EUp8qsFn5NSg/exec";
  const SECRET   = "FranMarga2025";
  const ALBUM    = "Boda Fran & Marga";

  const $ = (sel) => document.querySelector(sel);
  const statusEl  = () => document.getElementById('status');
  const resultsEl = () => document.getElementById('results');

  function logStatus(msg){ const el = statusEl(); if (el) el.textContent = msg; }
  function addResult(text, ok=true){
    const el = resultsEl(); if (!el) { try{ console.log(text); }catch(_){} return; }
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

    // Importante: no headers extra para evitar preflight
    const res = await fetch(ENDPOINT, { method: "POST", body: fd });

    const txt = await res.text().catch(()=> "");
    let json = null;
    try { json = JSON.parse(txt); } catch { /* si no es JSON (403/HTML), cae aquí */ }

    if (!res.ok) {
      alert(`Error HTTP ${res.status} ${res.statusText}\n\nRespuesta:\n${txt.slice(0,500)}${txt.length>500?'…':''}`);
      throw new Error(`HTTP ${res.status} ${res.statusText} → ${txt}`);
    }
    if (!json || json.ok !== true) {
      const msg = json && json.error ? json.error : 'Respuesta no válida del backend';
      alert(`Backend respondió error:\n${msg}`);
      throw new Error(msg);
    }
    return json;
  }

  async function uploadSingle(file){
    try{
      if (!file) { logStatus("No se seleccionó archivo."); return; }
      logStatus(`Subiendo ${file.name}…`);
      const json = await uploadFile(file);
      addResult(`✔ ${file.name} → ${json.fileUrl || "(privado)"}`, true);
      logStatus("Listo.");
      alert("Subida correcta ✅");
    } catch (e) {
      addResult(`✖ ${file?.name || 'archivo'}: ${e.message}`, false);
      logStatus("Ocurrió un error.");
      // El alert detallado ya se mostró en uploadFile()
    }
  }

  window.POVUploader = { uploadSingle };
})();