(function () {
  'use strict';

  const ENDPOINT = '/api/chat';
  const MAX_HISTORY = 10;
  const $ = (id) => document.getElementById(id);
  const voice = { root: $('voiceAiWidget'), toggle: $('voiceAiToggle'), panel: $('voiceAiPanel'), close: $('voiceAiClose'), status: $('voiceAiStatus'), mic: $('voiceAiMicBtn'), speaker: $('voiceAiSpeakerBtn'), input: $('voiceAiTextInput'), send: $('voiceAiSendBtn'), conversation: $('voiceAiConversation'), visualizer: $('voiceAiVisualizer') };
  if (!voice.root || !voice.toggle || !voice.panel) return;

  let recognition;
  let listening = false;
  let speakerEnabled = true;
  let history = [];
  const text = (value) => String(value || '').trim();

  function setStatus(label, mode) {
    voice.status?.classList.toggle('listening', mode === 'listening');
    const statusText = voice.status?.querySelector('.status-text');
    if (statusText) statusText.textContent = label;
  }
  function addMessage(role, content) {
    const item = document.createElement('div');
    item.className = `conversation-message ${role === 'user' ? 'user-message' : 'ai-message'}`;
    const avatar = document.createElement('div');
    avatar.className = `message-avatar${role === 'user' ? ' user-avatar' : ''}`;
    avatar.innerHTML = `<i class="fas fa-${role === 'user' ? 'user' : 'robot'}"></i>`;
    const bubble = document.createElement('div');
    bubble.className = `message-bubble${role === 'user' ? ' user-message' : ''}`;
    const paragraph = document.createElement('p');
    paragraph.textContent = content;
    bubble.append(paragraph); item.append(avatar, bubble); voice.conversation.append(item);
    voice.conversation.scrollTop = voice.conversation.scrollHeight;
  }
  function setBusy(busy) { voice.send.disabled = busy; voice.input.disabled = busy; voice.mic.disabled = busy; }
  function speak(content) {
    if (!speakerEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(content);
    utterance.lang = navigator.language?.startsWith('id') ? 'id-ID' : navigator.language || 'id-ID';
    utterance.rate = 1; window.speechSynthesis.speak(utterance);
  }
  async function askAI(message) {
    const userMessage = text(message);
    if (!userMessage) return;
    addMessage('user', userMessage);
    history.push({ role: 'user', content: userMessage }); history = history.slice(-MAX_HISTORY);
    setBusy(true); setStatus('Sedang menjawab…', 'thinking');
    try {
      const response = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: history }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !text(data.reply)) throw new Error(data.error || 'AI service is unavailable.');
      const reply = text(data.reply);
      history.push({ role: 'assistant', content: reply }); history = history.slice(-MAX_HISTORY);
      addMessage('assistant', reply); speak(reply); setStatus('Siap membantu', 'ready');
    } catch (error) {
      addMessage('assistant', 'Maaf, AI belum dapat dihubungi. Silakan coba lagi sebentar, atau gunakan formulir kontak untuk menghubungi Wazryn.');
      setStatus('AI sedang tidak tersedia', 'error');
    } finally { setBusy(false); voice.input.focus(); }
  }
  window.WazrynAI = { ask: askAI };

  function openPanel(open) {
    const show = typeof open === 'boolean' ? open : !voice.panel.classList.contains('active');
    voice.panel.classList.toggle('active', show); voice.toggle.classList.toggle('active', show);
    if (show) { setStatus('Siap membantu', 'ready'); voice.input.focus(); }
    else { window.speechSynthesis?.cancel(); recognition?.stop(); }
  }
  function setListening(active) {
    listening = active; voice.mic.classList.toggle('listening', active); voice.visualizer?.classList.toggle('active', active);
    setStatus(active ? 'Sedang mendengarkan…' : 'Siap membantu', active ? 'listening' : 'ready');
  }
  function setupRecognition() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) { voice.mic.disabled = true; voice.mic.title = 'Browser ini belum mendukung input suara'; return; }
    recognition = new Recognition(); recognition.lang = 'id-ID'; recognition.interimResults = true; recognition.maxAlternatives = 1;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => { setListening(false); setStatus('Suara tidak terbaca', 'error'); };
    recognition.onresult = (event) => {
      let finalText = ''; let liveText = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) { const transcript = event.results[i][0].transcript; if (event.results[i].isFinal) finalText += transcript; else liveText += transcript; }
      voice.input.value = finalText || liveText;
      if (finalText) askAI(finalText);
    };
  }
  voice.toggle.addEventListener('click', () => openPanel());
  voice.close?.addEventListener('click', () => openPanel(false));
  voice.send.addEventListener('click', () => { const value = voice.input.value; voice.input.value = ''; askAI(value); });
  voice.input.addEventListener('keydown', (event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); voice.send.click(); } });
  voice.speaker?.addEventListener('click', () => { speakerEnabled = !speakerEnabled; voice.speaker.classList.toggle('active', speakerEnabled); if (!speakerEnabled) window.speechSynthesis?.cancel(); });
  ['mousedown', 'touchstart'].forEach((name) => voice.mic.addEventListener(name, (event) => { event.preventDefault(); if (!listening) recognition?.start(); }, { passive: false }));
  ['mouseup', 'mouseleave', 'touchend', 'touchcancel'].forEach((name) => voice.mic.addEventListener(name, () => { if (listening) recognition?.stop(); }));
  setupRecognition(); setStatus('Siap membantu', 'ready');
})();
