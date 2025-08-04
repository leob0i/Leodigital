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

sendBtn.onclick = async () => {
  const userMsg = input.value.trim();
  if (!userMsg) return;

  // Näytä käyttäjän viesti
  const userDiv = document.createElement('div');
  userDiv.className = 'message user';
  userDiv.textContent = userMsg;
  messages.appendChild(userDiv);
  input.value = '';

  // Scrollaa alas
  messages.scrollTop = messages.scrollHeight;

  try {
    // Lähetä viesti bottisi backendiin
const response = await fetch("https://leobot-gpaj.onrender.com/bot", {

      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: userMsg })
    });

    const data = await response.json();

    // Näytä botin vastaus
    const botDiv = document.createElement('div');
    botDiv.className = 'message bot';
    botDiv.textContent = data.reply || "Virhe: ei vastausta.";
    messages.appendChild(botDiv);
    messages.scrollTop = messages.scrollHeight;
  } catch (error) {
    console.error("Virhe palvelimessa:", error);
    const botDiv = document.createElement('div');
    botDiv.className = 'message bot';
    botDiv.textContent = "Tapahtui virhe. Yritä myöhemmin uudelleen.";
    messages.appendChild(botDiv);
    messages.scrollTop = messages.scrollHeight;
  }
};

});
