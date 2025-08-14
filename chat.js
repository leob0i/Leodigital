// chat.js
// Vaatii seuraavat elementit HTML:ssä:
// #chat-widget, #chat-toggle, #chat-box, #chat-messages, #chat-input, #send-chat
// CSS:ssä olet ennestään .close-mode -luokka ikoninvaihtoon (💬 <-> ❌),
// ja #chat-boxille slide-up -animaatiot (transform/opacity/pointer-events).

(() => {
  "use strict";

  const API_URL = "https://leobot-gpaj.onrender.com/webchat";

  // ---- Elementit ----
  const toggleBtn     = document.getElementById("chat-toggle");
  const chatBox       = document.getElementById("chat-box");
  const chatMessages  = document.getElementById("chat-messages");
  const chatInput     = document.getElementById("chat-input");
  const sendBtn       = document.getElementById("send-chat");

  if (!toggleBtn || !chatBox || !chatMessages || !chatInput || !sendBtn) {
    console.error("[chat.js] Puuttuvia elementtejä. Tarkista ID:t.");
    return;
  }

  // ---- Apurit ----
  const scrollToBottom = () => {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  };

  const addMessage = (text, who /* 'user' | 'bot' */) => {
    const div = document.createElement("div");
    div.className = `message ${who}`;
    div.textContent = String(text ?? "");
    chatMessages.appendChild(div);
    scrollToBottom();
  };

  const addUser = (text) => addMessage(text, "user");
  const addBot  = (text) => addMessage(text, "bot");

  const getOrCreateSessionId = () => {
    let id = localStorage.getItem("webchat_session");
    if (!id) {
      id = (crypto.randomUUID?.() ?? Date.now() + Math.random().toString(16).slice(2));
      localStorage.setItem("webchat_session", id);
    }
    return id;
  };

  // ---- Auki/Kiinni ----
  let isOpen = false;

  const openChat = () => {
    // Näytä laatikko (pidetään JS:llä hallinta, ettei rikota olemassa olevaa CSS:ää)
    chatBox.style.transform = "translateY(0)";
    chatBox.style.opacity = "1";
    chatBox.style.pointerEvents = "auto";
    toggleBtn.classList.add("close-mode");
    isOpen = true;
  };

  const closeChat = () => {
    // Piilota laatikko
    chatBox.style.transform = "translateY(16px)";
    chatBox.style.opacity = "0";
    chatBox.style.pointerEvents = "none";
    toggleBtn.classList.remove("close-mode");
    isOpen = false;
  };

  // Alkuasento: kiinni (jos CSS ei jo hoida tätä, JS varmistaa)
  closeChat();

  // ---- Tervetuloviesti (aina lokaalisti, kerran per sivulataus) ----
  const greetOnce = () => {
    if (sessionStorage.getItem("webchat_greeted") === "1") return;
    addBot("Hei! 👋 Olen Leo Digital Bot. Kysy rohkeasti — autan 24/7.");
    sessionStorage.setItem("webchat_greeted", "1");
  };

  // ---- Lähetys ----
  const setInputEnabled = (enabled) => {
    chatInput.disabled = !enabled;
    sendBtn.disabled = !enabled;
  };

  const sendCurrentMessage = async () => {
    const text = chatInput.value.trim();
    if (!text) return;

    addUser(text);
    chatInput.value = "";
    setInputEnabled(false);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          channel: "web",
          sessionId: getOrCreateSessionId()
        })
      });

      let data = {};
      try { data = await res.json(); } catch (_) {}

      let reply =
        data?.reply ??
        data?.message ??
        data?.answer ??
        data?.text ??
        null;

      if (Array.isArray(reply)) reply = reply.join("\n");
      if (!reply || typeof reply !== "string" || !reply.trim()) {
        reply = "Pahoittelut, en saanut vastausta juuri nyt.";
      }

      addBot(reply);
    } catch (err) {
      addBot("Hups, yhteys katkesi. Yritä pian uudelleen.");
    } finally {
      setInputEnabled(true);
      chatInput.focus();
    }
  };

  // ---- Tapahtumat ----
  toggleBtn.addEventListener("click", () => {
    if (isOpen) {
      closeChat();
      return;
    }
    openChat();
    // Odotetaan hetki, että avausanimaatio ehtii, sitten tervehdys (vain kerran per sivulataus)
    setTimeout(greetOnce, 250);
  });

  sendBtn.addEventListener("click", (e) => {
    e.preventDefault();
    sendCurrentMessage();
  });

  chatInput.addEventListener("keydown", (e) => {
    // Enter lähettää, Shift+Enter tekee rivinvaihdon
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendCurrentMessage();
    }
  });
})();
