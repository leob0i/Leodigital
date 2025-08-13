document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('chat-toggle');
  const chatBox = document.getElementById('chat-box');
  const sendBtn = document.getElementById('send-chat');
  const input = document.getElementById('chat-input');
  const messages = document.getElementById('chat-messages');

  // Asetetaan chat piiloon varmasti
  chatBox.classList.remove('active');
  toggleBtn.textContent = '💬';
  toggleBtn.classList.remove('close-mode');

  // --- Aikaleima (HH:MM) ---
  function formatTime(date = new Date()) {
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }

  // --- Typing-indikaattori ---
  function showTyping() {
    const wrap = document.createElement('div');
    wrap.className = 'message bot';
    const dots = document.createElement('span');
    dots.className = 'dots';
    dots.innerHTML = '<i></i><i></i><i></i>';
    wrap.appendChild(dots);
    messages.appendChild(wrap);
    return wrap;
  }
  function removeTyping(el) {
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }

  // --- Pieni apuri: luo botin viestikupla aikaleimalla ---
  function addBotMessage(text) {
    const botDiv = document.createElement('div');
    botDiv.className = 'message bot';
    botDiv.textContent = text || '';
    const ts = document.createElement('span');
    ts.className = 'timestamp';
    ts.textContent = formatTime();
    botDiv.appendChild(ts);
    messages.appendChild(botDiv);
    messages.scrollTop = messages.scrollHeight;
  }

  // --- Tervehdys ensimmäisellä avauksella (vain kerran / välilehti) ---
  function welcomeIfNeeded() {
    if (sessionStorage.getItem('chatWelcomed') === '1') return;
    const typingEl = showTyping();
    setTimeout(() => {
      removeTyping(typingEl);
      // Voit vaihtaa tekstin haluamaksesi:
      addBotMessage('Hei! Miten voin auttaa? 🙂');
      sessionStorage.setItem('chatWelcomed', '1');
    }, 600);
  }

  // Avaa/sulje
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

      // <<< UUSI: tervehdi vain ensimmäisellä avauksella >>>
      welcomeIfNeeded();
    }
  };

  // --- Vastausavainten haku (sama kuin aiemmin) ---
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

  // --- Lähetys backendille ---
  sendBtn.onclick = async () => {
    const userMsg = input.value.trim();
    if (!userMsg) return;

    // käyttäjän kupla + aikaleima
    const userDiv = document.createElement('div');
    userDiv.className = 'message user';
    userDiv.textContent = userMsg;
    const userTs = document.createElement('span');
    userTs.className = 'timestamp';
    userTs.textContent = formatTime();
    userDiv.appendChild(userTs);
    messages.appendChild(userDiv);

    input.value = '';

    const typingEl = showTyping();

    try {
      const response = await fetch('https://leobot-gpaj.onrender.com/webchat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }) // muuta avain jos backend odottaa toista
      });

      let botText = '';
      const ct = response.headers.get('content-type') || '';
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (ct.includes('application/json')) {
        const data = await response.json();
        botText = pickReply(data) ?? JSON.stringify(data);
      } else {
        botText = (await response.text()) || '';
      }

      removeTyping(typingEl);
      addBotMessage(botText || '…(tyhjä vastaus)');
    } catch (err) {
      removeTyping(typingEl);
      addBotMessage('Virhe yhteydessä palvelimeen. Yritä hetken päästä uudelleen.');
      console.error('[chat] fetch error:', err);
    }
  };
});
