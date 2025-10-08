// uploader.js — lógica común de subida (Apps Script Web App)
(function(){
  const $ = (sel) => document.querySelector(sel);
  const statusEl  = () => document.getElementById('status');
  const resultsEl = () => document.getElementById('results');

  function logStatus(msg){
    const el = statusEl(); if (el) el.textContent = msg;
  }
  function addResult(text, ok=true){
    const el = resultsEl(); if (!el) return;
    const li = document.createElement("li");
    li.textContent = text;
    li.style.color = ok ? "#9ff18b" : "#ff9f9f";
    el.prepend(li);
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

  async function uploadSingle(file){
    try{
      const endpoint = (document.getElementById('endpoint')?.value || localStorage.getItem('endpoint') || '').trim();
      const secret   = (document.getElementById('secret')?.value   || localStorage.getItem('secret')   || '').trim();
      const album    = (document.getElementById('album')?.value    || localStorage.getItem('album')    || '').trim();

      if (!endpoint) { logStatus("Configura el endpoint /exec en Configuración."); return; }
      if (!secret)   { logStatus("Configura el token secreto en Configuración."); return; }
      if (!file)     { logStatus("No se seleccionó archivo."); return; }

      logStatus(`Subiendo ${file.name}…`);
      const json = await uploadFile(file, endpoint, secret, album);
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

  // API pública
  window.POVUploader = { uploadSingle };
})();