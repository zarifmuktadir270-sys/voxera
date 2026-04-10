(function () {
  const script = document.currentScript;
  const agentId = script.getAttribute("data-agent-id");
  const baseUrl = script.src.replace("/widget.js", "");

  if (!agentId) return console.error("Voxera: Missing data-agent-id");

  // Styles
  const style = document.createElement("style");
  style.textContent = `
    #voxera-widget-btn{position:fixed;bottom:24px;right:24px;width:60px;height:60px;border-radius:50%;background:#6d28d9;border:none;cursor:pointer;box-shadow:0 4px 24px rgba(109,40,217,0.4);display:flex;align-items:center;justify-content:center;z-index:99999;transition:transform .2s}
    #voxera-widget-btn:hover{transform:scale(1.1)}
    #voxera-widget-btn svg{width:28px;height:28px;fill:white}
    #voxera-widget-panel{position:fixed;bottom:100px;right:24px;width:380px;height:520px;background:#0a0a0f;border:1px solid #27272a;border-radius:16px;z-index:99999;display:none;flex-direction:column;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.5)}
    #voxera-widget-panel.open{display:flex}
    .vxr-header{padding:16px;border-bottom:1px solid #27272a;display:flex;align-items:center;justify-content:space-between}
    .vxr-header h3{color:#fafafa;font:600 15px/1 system-ui,sans-serif;margin:0}
    .vxr-header button{background:none;border:none;color:#71717a;cursor:pointer;font-size:20px}
    .vxr-messages{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:8px}
    .vxr-msg{max-width:80%;padding:10px 14px;border-radius:16px;font:14px/1.5 system-ui,sans-serif}
    .vxr-msg.assistant{background:#27272a;color:#e4e4e7;align-self:flex-start;border-bottom-left-radius:4px}
    .vxr-msg.user{background:#6d28d9;color:#fff;align-self:flex-end;border-bottom-right-radius:4px}
    .vxr-controls{padding:16px;border-top:1px solid #27272a;display:flex;align-items:center;justify-content:center;gap:12px}
    .vxr-mic{width:48px;height:48px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s}
    .vxr-mic.idle{background:#22c55e}
    .vxr-mic.listening{background:#ef4444;animation:vxr-pulse 1s infinite}
    .vxr-mic svg{width:24px;height:24px;fill:white}
    .vxr-status{color:#71717a;font:12px system-ui,sans-serif}
    @keyframes vxr-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}
  `;
  document.head.appendChild(style);

  // Button
  const btn = document.createElement("button");
  btn.id = "voxera-widget-btn";
  btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 15c1.66 0 2.99-1.34 2.99-3L15 6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 15 6.7 12H5c0 3.42 2.72 6.23 6 6.72V22h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/></svg>';
  document.body.appendChild(btn);

  // Panel
  const panel = document.createElement("div");
  panel.id = "voxera-widget-panel";
  panel.innerHTML = `
    <div class="vxr-header"><h3>Voice Assistant</h3><button id="vxr-close">&times;</button></div>
    <div class="vxr-messages" id="vxr-messages"></div>
    <div class="vxr-controls">
      <span class="vxr-status" id="vxr-status">Click mic to start</span>
      <button class="vxr-mic idle" id="vxr-mic">
        <svg viewBox="0 0 24 24"><path d="M12 15c1.66 0 2.99-1.34 2.99-3L15 6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 15 6.7 12H5c0 3.42 2.72 6.23 6 6.72V22h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/></svg>
      </button>
    </div>
  `;
  document.body.appendChild(panel);

  let callId = null;
  let messages = [];
  let recognition = null;

  btn.onclick = () => panel.classList.toggle("open");
  document.getElementById("vxr-close").onclick = () => panel.classList.remove("open");

  const mic = document.getElementById("vxr-mic");
  const msgContainer = document.getElementById("vxr-messages");
  const status = document.getElementById("vxr-status");

  function addMessage(role, content) {
    messages.push({ role, content });
    const div = document.createElement("div");
    div.className = `vxr-msg ${role}`;
    div.textContent = content;
    msgContainer.appendChild(div);
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }

  async function startCall() {
    const res = await fetch(`${baseUrl}/api/voice/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentId, source: "widget" }),
    });
    const data = await res.json();
    callId = data.call.id;
    addMessage("assistant", data.greeting);
    speak(data.greeting);
  }

  function speak(text) {
    if (!window.speechSynthesis) return;
    status.textContent = "Speaking...";
    const utter = new SpeechSynthesisUtterance(text);
    utter.onend = () => { status.textContent = "Click mic to speak"; };
    window.speechSynthesis.speak(utter);
  }

  mic.onclick = async () => {
    if (!callId) await startCall();

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { status.textContent = "Speech not supported"; return; }

    if (recognition) { recognition.stop(); recognition = null; mic.className = "vxr-mic idle"; return; }

    recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => { mic.className = "vxr-mic listening"; status.textContent = "Listening..."; };
    recognition.onresult = async (e) => {
      const text = e.results[0][0].transcript;
      recognition = null;
      mic.className = "vxr-mic idle";
      addMessage("user", text);
      status.textContent = "Thinking...";

      const res = await fetch(`${baseUrl}/api/voice/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, messages: messages.map(m => ({ role: m.role, content: m.content })), callId }),
      });

      const reader = res.body.getReader();
      let fullText = "";
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        for (const line of chunk.split("\\n")) {
          if (line.startsWith("data: ") && line.slice(6) !== "[DONE]") {
            try { fullText += JSON.parse(line.slice(6)).text; } catch {}
          }
        }
      }

      addMessage("assistant", fullText);
      speak(fullText);
    };
    recognition.onerror = () => { recognition = null; mic.className = "vxr-mic idle"; status.textContent = "Error. Try again."; };
    recognition.onend = () => { if (recognition) { recognition = null; mic.className = "vxr-mic idle"; } };
    recognition.start();
  };
})();
