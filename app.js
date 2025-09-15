const startTR = document.getElementById('start-tr');
const startDE = document.getElementById('start-de');
const recognized = document.getElementById('recognized-text');
const translated = document.getElementById('translated-text');
const apiKeyInput = document.getElementById('api-key');

const synth = window.speechSynthesis;
let voicesList = [];

function loadVoices(){
  voicesList = synth.getVoices();
  if (!voicesList.length) setTimeout(loadVoices, 100);
}
if ('speechSynthesis' in window){
  synth.onvoiceschanged = loadVoices;
  loadVoices();
} else alert('Ses sentezi desteklenmiyor.');

async function translate(text, from, to){
  const apiKey = apiKeyInput.value.trim();
  if(!apiKey){ alert('API anahtarı gir!'); return ''; }
  const prompt = `Sen Gülendam adında nazik bir kadınsın. 🤗 Türkçe-Almanca arasında anında çeviri yap. Çevir: "${text}"`;
  const res = await fetch('https://api.openai.com/v1/chat/completions',{
    method:'POST',
    headers:{ 'Content-Type':'application/json', 'Authorization':`Bearer ${apiKey}` },
    body: JSON.stringify({
      model:'gpt-4',
      messages:[
        {role:'system', content:'Nazik, sevecen bir kadın çevirmen.'},
        {role:'user', content:prompt}
      ]
    })
  });
  const js = await res.json();
  return js.choices[0].message.content.trim();
}

function speak(text, lang){
  if(!('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  const voice = voicesList.find(v=>v.lang.startsWith(lang) && /female/i.test(v.name)) || voicesList.find(v=>v.lang.startsWith(lang));
  if(voice) u.voice = voice;
  u.rate = 0.95; u.pitch = 1.1;
  synth.speak(u);
}

function recognize(lang, from, to){
  const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!Rec){ alert('SpeechRecognition desteklenmiyor.'); return; }
  const recognition = new Rec();
  recognition.lang = lang;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.start();

  recognition.onresult = async e => {
    const txt = e.results[0][0].transcript;
    recognized.textContent = txt;
    const tr = await translate(txt, from, to);
    translated.textContent = tr;
    speak(tr, to === 'tr-TR' ? 'tr-TR' : 'de-DE');
  };
  recognition.onerror = e => alert('Tanıma hatası: '+e.error);
}

startTR.onclick = ()=> recognize('tr-TR','Türkçe','de-DE');
startDE.onclick = ()=> recognize('de-DE','Almanca','tr-TR');
