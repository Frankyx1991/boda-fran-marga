// uploader.js — subida directa con constantes embebidas
(function(){
  // === CONFIG EMBEBIDA ===
  const ENDPOINT = "https://script.google.com/macros/s/AKfycbxIPYutBtB1wSUOXymWVLYKxPruemIoBCHiABfpl6GUWrLFTe-ysTooJ_EUp8qsFn5NSg/exec";
  const SECRET   = "FranMarga2025";     // Debe coincidir con Apps Script
  const ALBUM    = "Boda Fran & Marga"; // Subcarpeta destino

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

    const res = await fetch(ENDPOINT, { method: "POST", body: fd });
    const txt = await res.text().catch(()=> "");
    let json = null; try { json = JSON.parse(txt); } catch {}
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} → ${txt}`);
    if (!json || json.ok !== true) throw new Error(json && json.error ? json.error : "Respuesta no válida");
    return json;
  }

  async function uploadSingle(file){
    try{
      if (!file) { logStatus("No se seleccionó archivo."); return; }
      logStatus(`Subiendo ${file.name}…`);
      const json = await uploadFile(file);
      addResult(`✔ ${file.name} → ${json.fileUrl || "(privado)"}`, true);
      logStatus("Listo.");
    } catch (e) {
      addResult(`✖ ${file?.name || 'archivo'}: ${e.message}`, false);
      logStatus("Ocurrió un error.");
      alert(e.message); // diagnóstico visible
    }
  }

  window.POVUploader = { uploadSingle };
})();