(() => {
  const $ = (selector) => document.querySelector(selector);
  const promptInput = $("#promptInput");
  const generateButton = $("#generateButton");
  const previewFrame = $("#previewFrame");
  const emptyState = $("#emptyState");
  const codeEditor = $("#codeEditor");
  const downloadButton = $("#downloadButton");
  const workspaceStatus = $("#workspaceStatus");
  const toast = $("#toast");
  let generatedHtml = "";
  let toastTimer;

  function notify(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
  }
  function setStatus(message) { workspaceStatus.textContent = message; }
  function showGenerated(html) {
    generatedHtml = html;
    codeEditor.value = html;
    previewFrame.srcdoc = html;
    previewFrame.hidden = false;
    emptyState.hidden = true;
    downloadButton.disabled = false;
    setStatus("Website generated successfully");
    switchView("preview");
  }
  function switchView(view) {
    document.querySelectorAll(".view-tab").forEach(tab => tab.classList.toggle("active", tab.dataset.view === view));
    $("#previewStage").hidden = view !== "preview";
    $("#codeStage").hidden = view !== "code";
  }
  function buildFallback(prompt) {
    const safePrompt = prompt.replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
    return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>My AI Website</title>
<style>*{box-sizing:border-box}body{margin:0;font-family:Inter,Arial,sans-serif;background:#0d1322;color:#f4f6fb}header{padding:24px 8%;display:flex;justify-content:space-between;border-bottom:1px solid #ffffff20}header b{letter-spacing:2px;color:#79e4d7}a{color:inherit;text-decoration:none}.hero{min-height:75vh;padding:13vh 9%;display:flex;flex-direction:column;justify-content:center;background:radial-gradient(circle at 80% 20%,#514a9a55,transparent 35%)}.tag{color:#79e4d7;text-transform:uppercase;letter-spacing:3px;font-size:12px}.hero h1{font-size:clamp(42px,8vw,82px);line-height:1.02;max-width:850px;margin:22px 0}.hero p{color:#aab4c7;max-width:590px;line-height:1.8}.cta{display:inline-block;background:#79e4d7;color:#07151b;padding:14px 22px;border-radius:7px;font-weight:700;margin-top:20px;width:max-content}.section{padding:70px 9%}.section h2{font-size:32px}.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:16px}.card{padding:24px;border:1px solid #ffffff22;border-radius:12px;background:#ffffff08}.card p{color:#aab4c7;line-height:1.7}footer{padding:30px 9%;color:#8995aa;border-top:1px solid #ffffff20}@media(max-width:600px){header{padding:20px}.hero{padding:90px 7%}.section{padding:50px 7%}}</style></head>
<body><header><b>NEURAL STUDIO</b><span>MENU&nbsp;&nbsp; ☰</span></header><main><section class="hero"><span class="tag">A new digital experience</span><h1>Your next big idea starts here.</h1><p> ${safePrompt} </p><a class="cta" href="#discover">Explore the experience →</a></section><section class="section" id="discover"><span class="tag">Made for momentum</span><h2>Everything you need to move forward.</h2><div class="cards"><article class="card"><h3>Thoughtful design</h3><p>A clear, modern experience that puts your content first.</p></article><article class="card"><h3>Built to adapt</h3><p>Responsive layouts designed for every screen size.</p></article><article class="card"><h3>Ready to grow</h3><p>A flexible foundation for your next chapter.</p></article></div></section></main><footer>© 2026 — Built with NEURAL WEB AI</footer></body></html>`;
  }
  async function generate() {
    const prompt = promptInput.value.trim();
    if (!prompt) { notify("Describe your website first."); promptInput.focus(); return; }
    if (prompt.length > 2000) { notify("Please keep your prompt under 2,000 characters."); return; }
    const endpoint = localStorage.getItem("neural-web-ai-endpoint") || "/api/generate";
    const oldLabel = generateButton.innerHTML;
    generateButton.disabled = true;
    generateButton.innerHTML = "✳ Generating your website...";
    setStatus("AI is working on your idea");
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({prompt})
      });
      if (!response.ok) {
        const detail = await response.text();
        throw new Error(detail || `Request failed (${response.status})`);
      }
      const data = await response.json();
      if (!data.html || typeof data.html !== "string") throw new Error("The AI response did not contain HTML.");
      showGenerated(data.html);
      notify("Your website is ready!");
    } catch (error) {
      console.error(error);
      if (endpoint === "/api/generate" && (error instanceof TypeError || /404|Failed to fetch/i.test(error.message))) {
        showGenerated(buildFallback(prompt));
        setStatus("Preview generated · AI proxy not connected");
        notify("Preview created. Connect your AI endpoint in Settings for real AI generation.");
      } else {
        setStatus("Generation failed");
        notify(error.message || "Could not generate the website.");
      }
    } finally {
      generateButton.disabled = false;
      generateButton.innerHTML = oldLabel;
    }
  }

  promptInput.addEventListener("input", () => $("#charCount").textContent = `${promptInput.value.length.toLocaleString()} / 2,000`);
  generateButton.addEventListener("click", generate);
  document.querySelectorAll(".example-chip").forEach(button => button.addEventListener("click", () => {
    promptInput.value = button.dataset.prompt;
    promptInput.dispatchEvent(new Event("input"));
    promptInput.focus();
  }));
  document.querySelectorAll(".view-tab").forEach(button => button.addEventListener("click", () => switchView(button.dataset.view)));
  document.querySelectorAll(".device-button").forEach(button => button.addEventListener("click", () => {
    document.querySelectorAll(".device-button").forEach(item => item.classList.toggle("active", item === button));
    previewFrame.classList.remove("device-tablet", "device-mobile");
    if (button.dataset.device !== "desktop") previewFrame.classList.add(`device-${button.dataset.device}`);
  }));
  $("#refreshButton").addEventListener("click", () => {
    if (generatedHtml) { previewFrame.srcdoc = codeEditor.value; notify("Preview refreshed."); }
  });
  codeEditor.addEventListener("input", () => { generatedHtml = codeEditor.value; previewFrame.srcdoc = generatedHtml; });
  $("#copyCodeButton").addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(codeEditor.value); notify("HTML copied to clipboard."); }
    catch { notify("Clipboard access is unavailable in this browser."); }
  });
  downloadButton.addEventListener("click", () => {
    const blob = new Blob([codeEditor.value], {type:"text/html;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = "neural-web-ai-site.html"; link.click();
    URL.revokeObjectURL(url);
    notify("HTML export downloaded.");
  });
  $("#settingsButton").addEventListener("click", () => {
    $("#apiEndpoint").value = localStorage.getItem("neural-web-ai-endpoint") || "";
    $("#settingsDialog").showModal();
  });
  $("#saveSettingsButton").addEventListener("click", () => {
    const endpoint = $("#apiEndpoint").value.trim();
    if (endpoint) localStorage.setItem("neural-web-ai-endpoint", endpoint);
    else localStorage.removeItem("neural-web-ai-endpoint");
    $("#settingsDialog").close();
    notify("Workspace settings saved.");
  });
})();