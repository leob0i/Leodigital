document.addEventListener('DOMContentLoaded', () => {
  const API_URL = 'https://leobot-gpaj.onrender.com/webchat';

  // ---- Elementit ----
  const toggleBtn = document.getElementById('chat-toggle');
  const chatBox   = document.getElementById('chat-box');
  const sendBtn   = document.getElementById('send-chat');
  const input     = document.getElementById('chat-input');
  const messages  = document.getElementById('chat-messages');

  if (!toggleBtn || !chatBox || !sendBtn || !input || !messages) {
    console.error('[chat] Puuttuvia elementtejä: #chat-toggle, #chat-box, #send-chat, #chat-input, #chat-messages');
    return;
  }

  // ---- Alku: chat varmasti kiinni ----
  chatBox.classList.remove('active');
  toggleBtn.textContent = '💬';
  toggleBtn.classList.remove('close-mode');

  // ---- Aikaleima (HH:MM) ----
  function formatTime(date = new Date()) {
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }

  // ---- Scroller ----
  function scrollToBottom() {
    messages.scrollTop = messages.scrollHeight;
  }

  // ---- Typing-indikaattori ----
  function showTyping() {
    const wrap = document.createElement('div');
    wrap.className = 'message bot';
    const dots = document.createElement('span');
    dots.className = 'dots';
    dots.innerHTML = '<i></i><i></i><i></i>';
    wrap.appendChild(dots);
    messages.appendChild(wrap);
    scrollToBottom();
    return wrap;
  }
  function removeTyping(el) {
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }

  // ---- Viestikuplat ----
  function addUserMessage(text) {
    const div = document.createElement('div');
    div.className = 'message user';
    div.textContent = text;
    const ts = document.createElement('span');
    ts.className = 'timestamp';
    ts.textContent = formatTime();
    div.appendChild(ts);
    messages.appendChild(div);
    scrollToBottom();
    return div;
  }

  function addBotMessage(text) {
    const div = document.createElement('div');
    div.className = 'message bot';
    div.textContent = text || '';
    const ts = document.createElement('span');
    ts.className = 'timestamp';
    ts.textContent = formatTime();
    div.appendChild(ts);
    messages.appendChild(div);
    scrollToBottom();
    return div;
  }

  // ---- Session ID (sama asiakas pysyy samana) ----
  function getOrCreateSessionId() {
    let id = localStorage.getItem('webchat_session');
    if (!id) {
      id = (crypto.randomUUID?.() ?? Date.now() + Math.random().toString(16).slice(2));
      localStorage.setItem('webchat_session', id);
    }
    return id;
  }

  // ---- Ensitervehdys paikallisesti (vain kerran per välilehti) ----
  function greetOnce() {
    if (sessionStorage.getItem('webchat_greeted') === '1') return;
    const typingEl = showTyping();
    setTimeout(() => {
      removeTyping(typingEl);
      addBotMessage('Hei! Miten voin auttaa? 🙂');
      sessionStorage.setItem('webchat_greeted', '1');
    }, 600);
  }

  // ---- Toggle auki/kiinni ----
  toggleBtn.onclick = () => {
    const isVisible = chatBox.classList.contains('active');
    if (isVisible) {
      chatBox.classList.remove('active');
      toggleBtn.textContent = '💬';
      toggleBtn.classList.remove('close-mode');
    } else {
      chatBox.classList.add('active');
      toggleBtn.textContent = '❌';
      toggleBtn.classList.add('close-mode');
      // Tervehdi vain ensimmäisellä avauksella – ilman verkkoa
      greetOnce();
    }
  };

  // ---- Backend-vastauksen purku ----
  function pickReply(data) {
    if (typeof data === 'string') return data;
    const keys = ['reply','message','text','answer','response','output','botReply'];
    for (const k of keys) {
      const v = data?.[k];
      if (typeof v === 'string' && v.trim()) return v.trim();
      if (v && typeof v === 'object') {
        for (const kk of keys) {
          const vv = v?.[kk];
          if (typeof vv === 'string' && vv.trim()) return vv.trim();
        }
      }
    }
    return null;
  }

  // ---- Lähetys botillesi ----
  async function sendCurrentMessage() {
    const userMsg = input.value.trim();
    if (!userMsg) return;

    addUserMessage(userMsg);
    input.value = '';

    const typingEl = showTyping();

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          channel: 'web',
          sessionId: getOrCreateSessionId(),
        }),
      });

      const ct = res.headers.get('content-type') || '';
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      let botText = '';
      if (ct.includes('application/json')) {
        const data = await res.json();
        botText = pickReply(data) ?? JSON.stringify(data);
      } else {
        botText = (await res.text()) || '';
      }

      removeTyping(typingEl);
      addBotMessage(botText || '…(tyhjä vastaus)');
    } catch (err) {
      removeTyping(typingEl);
      addBotMessage('Hups, yhteys katkesi. Yritä pian uudelleen.');
      console.error('[chat] fetch error:', err);
    }
  }

  // ---- Tapahtumat ----
  sendBtn.onclick = (e) => {
    e.preventDefault();
    sendCurrentMessage();
  };

  input.addEventListener('keydown', (e) => {
    // Enter lähettää, Shift+Enter tekee rivinvaihdon
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendCurrentMessage();
    }
  });
});
