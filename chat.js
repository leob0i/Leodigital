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
    }
  };

  sendBtn.onclick = () => {
    const userMsg = input.value.trim();
    if (!userMsg) return;

    const userDiv = document.createElement('div');
    userDiv.className = 'message user';
    userDiv.textContent = userMsg;
    messages.appendChild(userDiv);
    input.value = '';

    setTimeout(() => {
      const botDiv = document.createElement('div');
      botDiv.className = 'message bot';
      botDiv.textContent = 'Hei! Tämä on testi 😄';
      messages.appendChild(botDiv);
      messages.scrollTop = messages.scrollHeight;
    }, 500);
  };
});
