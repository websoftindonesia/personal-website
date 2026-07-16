(function(){
  'use strict';

  const cfg = {
    // rules lokal: tanpa endpoint AI
    language: 'id-ID',
    welcome:
      "Halo! Saya asisten suara. Kamu bisa bilang: 'about', 'skills', 'portfolio', atau 'contact'.",
    quickPrompts: {
      'about': 'about me',
      'skill': 'skills',
      'skills': 'skills',
      'portfolio': 'portfolio',
      'contact': 'contact'
    }
  };

  function $(id){ return document.getElementById(id); }

  const WIDGET = {
    root: $('voiceAiWidget'),
    toggle: $('voiceAiToggle'),
    panel: $('voiceAiPanel'),
    close: $('voiceAiClose'),
    status: $('voiceAiStatus'),
    micBtn: $('voiceAiMicBtn'),
    speakerBtn: $('voiceAiSpeakerBtn'),
    textInput: $('voiceAiTextInput'),
    sendBtn: $('voiceAiSendBtn'),
    conversation: $('voiceAiConversation'),
    visualizer: $('voiceAiVisualizer')
  };

  if(!WIDGET.root || !WIDGET.toggle || !WIDGET.panel) return;

  let recognition = null;
  let recognizing = false;
  let speakerEnabled = true;
  let lastTranscript = '';

  function setStatus(mode, text){
    if(!WIDGET.status) return;
    WIDGET.status.classList.remove('listening');
    if(mode === 'listening') WIDGET.status.classList.add('listening');
    if(typeof text === 'string') WIDGET.status.querySelector('.status-text') && (WIDGET.status.querySelector('.status-text').textContent = text);
    // fallback
    if(!WIDGET.status.querySelector('.status-text') && text) WIDGET.status.textContent = text;
  }

  function appendMessage({role, text, avatarClass, bubbleClass}){
    const wrap = document.createElement('div');
    wrap.className = role === 'user' ? 'conversation-message user-message' : 'conversation-message ai-message';

    const avatar = document.createElement('div');
    avatar.className = role === 'user' ? 'message-avatar user-avatar message-avatar' : 'message-avatar message-avatar';
    avatar.innerHTML = role === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';

    const bubble = document.createElement('div');
    bubble.className = role === 'user' ? 'message-bubble user-message' : 'message-bubble';

    const p = document.createElement('p');
    p.textContent = text;
    bubble.appendChild(p);

    wrap.appendChild(avatar);
    wrap.appendChild(bubble);
    WIDGET.conversation.appendChild(wrap);
    WIDGET.conversation.scrollTop = WIDGET.conversation.scrollHeight;
    return wrap;
  }

  function speak(text){
    if(!speakerEnabled) return;
    if(!('speechSynthesis' in window)) return;
    try{
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = cfg.language;
      u.rate = 1.0;
      u.pitch = 1.0;
      window.speechSynthesis.speak(u);
    }catch(e){
      // ignore
    }
  }

  function stopSpeak(){
    if('speechSynthesis' in window){
      try{ window.speechSynthesis.cancel(); }catch(e){}
    }
  }

  function normalize(s){
    return String(s || '')
      .toLowerCase()
      .replace(/[!?.,]/g,' ')
      .replace(/\s+/g,' ')
      .trim();
  }

  function inferIntent(text){
    const t = normalize(text);
    if(!t) return null;

    const intents = [
      {key:'about', keywords:['about','siapa kamu','tentang aku','profil','fawwaz']},
      {key:'skills', keywords:['skills','skill','kemampuan','teknologi','tech','stack','keahlian']},
      {key:'portfolio', keywords:['portfolio','proyek','project','hasil karya','project saya','bekerja']},
      {key:'contact', keywords:['contact','hubungi','pesan','kirim pesan','email','whatsapp']}
    ];

    for(const it of intents){
      if(it.keywords.some(k => t.includes(k))) return it.key;
    }

    // heuristik: kata kunci tunggal
    if(t.includes('skill')) return 'skills';
    if(t.includes('port')) return 'portfolio';
    if(t.includes('kontak') || t.includes('contact')) return 'contact';
    if(t.includes('about') || t.includes('tentang') || t.includes('profil')) return 'about';

    return null;
  }

  function getSectionReply(intent){
    const replies = {
      about:
        "Saya Muhammad Fawwaz Rayyan Khalish. Saya fokus membuat solusi web yang efisien, interaktif, dan modern. Ingin info pendidikan atau pengalaman kerja?",
      skills:
        "Skill utama saya: Front-End seperti HTML/CSS dan JavaScript, serta Framework seperti React/Vue. Untuk Back-End saya juga mengerjakan Node.js, database seperti PostgreSQL/MySQL, dan integrasi API.",
      portfolio:
        "Portofolio saya berisi proyek seperti E-Commerce B2B, Fitness Tracker App, dan Analytics Dashboard. Mau yang fokus Web App, Mobile App, atau Tools?",
      contact:
        "Kamu bisa kirim pesan lewat form Contact di website, atau hubungi via WhatsApp yang tersedia di halaman utama. Mau saya bantu susun isi pesannya?"
    };

    // fallback
    return replies[intent] || "Maaf, saya belum paham. Coba sebut: about, skills, portfolio, atau contact.";
  }

  function handleUserText(text){
    const transcript = normalize(text);
    appendMessage({role:'user', text: text});

    const intent = inferIntent(transcript);
    const reply = getSectionReply(intent);

    setStatus('thinking', 'Menjawab...');
    appendMessage({role:'ai', text: reply});
    speak(reply);

    setStatus('ready', 'Siap membantu');
  }

  function initSpeech(){
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!SR) return false;

    recognition = new SR();
    recognition.lang = cfg.language;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      recognizing = true;
      setStatus('listening', 'Sedang mendengarkan...');
      WIDGET.micBtn && WIDGET.micBtn.classList.add('listening');
      WIDGET.visualizer && WIDGET.visualizer.classList.add('active');
    };

    recognition.onerror = (e) => {
      recognizing = false;
      WIDGET.micBtn && WIDGET.micBtn.classList.remove('listening');
      WIDGET.visualizer && WIDGET.visualizer.classList.remove('active');
      setStatus('error', 'Gagal mendeteksi suara');
    };

    recognition.onend = () => {
      recognizing = false;
      WIDGET.micBtn && WIDGET.micBtn.classList.remove('listening');
      WIDGET.visualizer && WIDGET.visualizer.classList.remove('active');
      setStatus('ready', 'Siap membantu');
    };

    recognition.onresult = (event) => {
      let interim = '';
      let finalText = '';
      for(let i=event.resultIndex; i<event.results.length; i++){
        const res = event.results[i];
        const t = res[0].transcript;
        if(res.isFinal) finalText += t;
        else interim += t;
      }

      const combined = (finalText || interim).trim();
      if(combined){
        lastTranscript = combined;
        // update input live
        if(WIDGET.textInput) WIDGET.textInput.value = combined;
      }

      if(finalText){
        // auto-send
        setTimeout(() => {
          if(lastTranscript){
            handleUserText(lastTranscript);
            lastTranscript = '';
            if(WIDGET.textInput) WIDGET.textInput.value = '';
          }
        }, 150);
      }
    };

    return true;
  }

  function start(){
    if(!recognition) return;
    if(recognizing) return;
    try{
      recognition.start();
    }catch(e){
      // some browsers throw if called too fast
    }
  }

  function stop(){
    if(!recognition) return;
    if(!recognizing) return;
    try{ recognition.stop(); }catch(e){}
  }

  function togglePanel(open){
    const willOpen = typeof open === 'boolean' ? open : !WIDGET.panel.classList.contains('active');
    WIDGET.panel.classList.toggle('active', willOpen);
    WIDGET.toggle.classList.toggle('active', willOpen);
    if(willOpen){
      setStatus('ready', 'Siap membantu');
      // show welcome only once per session
      if(!sessionStorage.getItem('voiceAiWelcomeShown')){
        sessionStorage.setItem('voiceAiWelcomeShown','1');
        appendMessage({role:'ai', text: cfg.welcome});
        speak(cfg.welcome);
      }
    }else{
      stopSpeak();
      stop();
    }
  }

  // wire UI
  WIDGET.toggle.addEventListener('click', () => togglePanel());
  WIDGET.close.addEventListener('click', () => togglePanel(false));

  WIDGET.speakerBtn && WIDGET.speakerBtn.addEventListener('click', () => {
    speakerEnabled = !speakerEnabled;
    WIDGET.speakerBtn.classList.toggle('active', speakerEnabled);
    if(!speakerEnabled) stopSpeak();
  });

  // send button (text)
  WIDGET.sendBtn && WIDGET.sendBtn.addEventListener('click', () => {
    const t = (WIDGET.textInput && WIDGET.textInput.value) ? WIDGET.textInput.value : '';
    if(!t.trim()) return;
    stop();
    handleUserText(t);
    if(WIDGET.textInput) WIDGET.textInput.value = '';
  });

  // Enter to send
  WIDGET.textInput && WIDGET.textInput.addEventListener('keydown', (e) => {
    if(e.key === 'Enter' && !e.shiftKey){
      e.preventDefault();
      WIDGET.sendBtn && WIDGET.sendBtn.click();
    }
  });

  // hold to speak
  function bindHold(btn){
    if(!btn) return;

    const onDown = (e) => {
      e.preventDefault();
      start();
    };

    const onUp = (e) => {
      e.preventDefault();
      stop();
      // if no speech recognition support, still allow manual input
      if(recognizing === false && recognition == null){
        // ignore
      }
    };

    btn.addEventListener('mousedown', onDown);
    btn.addEventListener('mouseup', onUp);
    btn.addEventListener('mouseleave', onUp);

    btn.addEventListener('touchstart', onDown, {passive:false});
    btn.addEventListener('touchend', onUp);
  }

  bindHold(WIDGET.micBtn);

  // init
  const ok = initSpeech();
  if(!ok){
    setStatus('error', 'SpeechRecognition tidak didukung');
    if(WIDGET.micBtn){
      WIDGET.micBtn.disabled = false;
    }
  } else {
    setStatus('ready', 'Siap membantu');
  }
})();

