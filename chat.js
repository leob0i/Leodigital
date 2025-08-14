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
    messages.scrollTop = messages.scrollHeight;
    return wrap;
  }
  function removeTyping(el) {
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }

  // --- Tervetuloviesti (vain kerran / välilehti, EI verkkoa) ---
  function greetOnce() {
    if (sessionStorage.getItem('webchat_greeted') === '1') return;
    const typingEl = showTyping();
    setTimeout(() => {
      removeTyping(typingEl);
      const botDiv = document.createElement('div');
      botDiv.className = 'message bot';
      botDiv.textContent = 'Hei! Miten voin auttaa? 🙂';
      const botTs = document.createElement('span');
      botTs.className = 'timestamp';
      botTs.textContent = formatTime();
      botDiv.appendChild(botTs);
      messages.appendChild(botDiv);
      messages.scrollTop = messages.scrollHeight;
      sessionStorage.setItem('webchat_greeted', '1');
    }, 600);
  }

  // Toggle
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

      // Tervetulo vain ensimmäisellä avauksella, ilman häiriöitä
      greetOnce();
    }
  };

  // Lähetys
  sendBtn.onclick = () => {
    const userMsg = input.value.trim();
    if (!userMsg) return;

    const userDiv = document.createElement('div');
    userDiv.className = 'message user';
    userDiv.textContent = userMsg;

    // Aikaleima käyttäjän viestiin
    const userTs = document.createElement('span');
    userTs.className = 'timestamp';
    userTs.textContent = formatTime();
    userDiv.appendChild(userTs);

    messages.appendChild(userDiv);
    input.value = '';

    // Typing näkyviin botille
    const typingEl = showTyping();

    setTimeout(() => {
      // Poista typing ennen vastausta
      removeTyping(typingEl);

      const botDiv = document.createElement('div');
      botDiv.className = 'message bot';
      botDiv.textContent = 'Hei! Tämä on testi 😄';

      // Aikaleima botin viestiin
      const botTs = document.createElement('span');
      botTs.className = 'timestamp';
      botTs.textContent = formatTime();
      botDiv.appendChild(botTs);

      messages.appendChild(botDiv);
      messages.scrollTop = messages.scrollHeight;
    }, 500);
  };
});
