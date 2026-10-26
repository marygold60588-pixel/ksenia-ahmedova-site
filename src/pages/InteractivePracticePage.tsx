import { useEffect, useMemo, useState } from "react";
import "./InteractivePracticePage.css";

type Inquiry = { scene: string; action: string; wish: string; fear: string; response: string; repeated: string };
type Entry = { id: string; at: string; situation: string; did: string; wanted: string; other: string };
type Saved = { inquiry: Inquiry; entries: Entry[]; feedback: string; criticism: string; usefulness: string };
const KEY = "akhmedova.practice.self-refusal.v1";
const blank: Inquiry = { scene: "", action: "", wish: "", fear: "", response: "", repeated: "" };
const steps = [
  { key: "scene", title: "Одна сцена", question: "Вспомните конкретный момент, когда вы согласились, промолчали или уступили, хотя хотели другого.", hint: "Что произошло? Кто был рядом? Опишите одну сцену, не всю историю." },
  { key: "action", title: "Ваше действие", question: "Что вы сделали или сказали в тот момент?", hint: "Можно коротко: «согласилась», «промолчал», «сказала, что всё нормально»…" },
  { key: "wish", title: "То, что осталось внутри", question: "А чего вам хотелось на самом деле?", hint: "Не то, что было бы правильно хотеть, а ваше собственное желание." },
  { key: "fear", title: "Возможная цена", question: "Что могло бы произойти, если бы вы поступили согласно своему желанию?", hint: "Что вы ожидали от другого человека — и что это значило бы для вас?" },
  { key: "response", title: "Реальность отношений", question: "Вы уже пробовали говорить этому человеку о своих желаниях? Что происходило в ответ?", hint: "Важно не только то, чего вы опасаетесь, но и как человек действительно реагирует." },
  { key: "repeated", title: "Вопрос к себе", question: "Что в этой истории повторяется, а что, возможно, было иначе?", hint: "Если это единичная ситуация, так и напишите." },
] as const;
const initial: Saved = { inquiry: blank, entries: [], feedback: "", criticism: "", usefulness: "" };
function load(): Saved {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) || "null");
    return data && typeof data === "object"
      ? { ...initial, ...data, inquiry: { ...blank, ...data.inquiry }, entries: Array.isArray(data.entries) ? data.entries : [] }
      : initial;
  } catch { return initial; }
}
function gentleObservation(q: Inquiry) {
  if (!q.scene.trim() || !q.wish.trim()) return "Ваша карта начнёт складываться, когда вы опишете одну ситуацию и своё желание.";
  if (/много раз|сто раз|миллион раз|говорил|говорила|объяснял|объясняла|просил|просила/i.test(q.response)) {
    return "Похоже, вы уже пытались говорить о важном. Возможно, здесь стоит исследовать не только страх выразить желание, но и то, что происходит между вами после этих разговоров. Насколько это подходит к вашей ситуации?";
  }
  if (/злит|злость|раздраж|обид/i.test(q.fear + " " + q.repeated)) {
    return "В ваших словах есть место не только страху, но и недовольству. Возможно, важно понять, какое желание стоит за этим чувством, не торопясь объявлять его неправильным.";
  }
  return "Вы описали разницу между тем, что сделали, и тем, чего хотели. Пока это не объяснение причин, а точка наблюдения: что именно мешало вашему желанию получить место в отношениях?";
}
function makeThreads(count: number) {
  const points = [[160,28],[267,84],[238,193],[82,193],[53,84],[160,118]];
  return <svg className="pr-jewel" viewBox="0 0 320 230" role="img" aria-label="Декоративный узор из золотых нитей, который раскрывается по мере записей">
    <defs><radialGradient id="pr-glow"><stop stopColor="#e9c994" stopOpacity=".27"/><stop offset="1" stopColor="#e9c994" stopOpacity="0"/></radialGradient></defs>
    <circle cx="160" cy="116" r="107" fill="url(#pr-glow)"/>
    {points.slice(0,Math.min(6,count+1)).map((p,i)=><g key={i}>{i>0&&<path d={`M ${points[i-1][0]} ${points[i-1][1]} Q 160 116 ${p[0]} ${p[1]}`} fill="none" stroke="#c8a56e" strokeWidth="1.2" opacity=".75"/>}<circle cx={p[0]} cy={p[1]} r={i===0?5:3.5} fill="#efd8b1"/><circle cx={p[0]} cy={p[1]} r="10" fill="#efd8b1" opacity=".08"/></g>)}
  </svg>;
}
export default function InteractivePracticePage() {
  const [data,setData] = useState<Saved>(load);
  const [tab,setTab] = useState<"inquiry"|"journal"|"map"|"feedback">("inquiry");
  const [step,setStep] = useState(0);
  const [sound,setSound] = useState(false);
  const [draft,setDraft] = useState({ situation:"", did:"", wanted:"", other:"" });
  const [consent,setConsent] = useState(false);
  const [notice,setNotice] = useState("");
  useEffect(()=>{ try { localStorage.setItem(KEY,JSON.stringify(data)); } catch { setNotice("Не удалось сохранить запись на этом устройстве."); } },[data]);
  const completed = steps.every(s=>data.inquiry[s.key].trim());
  const filled = steps.filter(s=>data.inquiry[s.key].trim()).length;
  const observation = useMemo(()=>gentleObservation(data.inquiry),[data.inquiry]);
  function chime() {
    if (!sound) return;
    try {
      const AudioCtx = window.AudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      [880,1320,1760].forEach((freq,i)=>{
        const osc=ctx.createOscillator(), gain=ctx.createGain(),t=ctx.currentTime+i*.07;
        osc.type="sine"; osc.frequency.setValueAtTime(freq,t);
        gain.gain.setValueAtTime(.0001,t); gain.gain.exponentialRampToValueAtTime(.018,t+.015);
        gain.gain.exponentialRampToValueAtTime(.0001,t+.42);
        osc.connect(gain).connect(ctx.destination);osc.start(t);osc.stop(t+.45);
      });
      window.setTimeout(()=>{void ctx.close()},900);
    } catch { /* audio unavailable */ }
  }
  function updateInquiry(key:keyof Inquiry,value:string){setData(d=>({...d,inquiry:{...d.inquiry,[key]:value}}));}
  function saveEntry(){
    if(!draft.situation.trim()||!draft.wanted.trim())return;
    const entry:Entry={...draft,id:crypto.randomUUID(),at:new Date().toISOString()};
    setData(d=>({...d,entries:[...d.entries,entry]}));
    setDraft({situation:"",did:"",wanted:"",other:""});
    setNotice("Запись сохранена на этом устройстве.");chime();
  }
  function exportData(){
    const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);const a=document.createElement("a");
    a.href=url;a.download="moi-nablyudeniya.json";a.click();URL.revokeObjectURL(url);
  }
  return <div className="pr-root">
    <div className="pr-halo" aria-hidden="true"/>
    <header className="pr-top"><a href="/" className="pr-brand">Ксения Ахмедова <span>· психологические практики</span></a><button type="button" className="pr-sound" onClick={()=>setSound(v=>!v)} aria-pressed={sound}>{sound?"♫ Звук включён":"♩ Включить звук"}</button></header>
    <main className="pr-shell">
      <div className="pr-eyebrow">ИНТЕРАКТИВНАЯ ПРАКТИКА · БЕСПЛАТНЫЙ ПИЛОТ</div>
      <h1>Почему я снова <em>отказываюсь от себя?</em></h1>
      <p className="pr-intro">От страха чужого «нет» — к вниманию к собственному желанию. Здесь нет правильных ответов и необходимости что-то менять прямо сейчас.</p>
      <div className="pr-ornament" aria-hidden="true">✧ ───────── ✧</div>
      <nav className="pr-tabs" aria-label="Разделы практики">
        {([{id:"inquiry",name:"Исследование"},{id:"journal",name:"Дневник"},{id:"map",name:"Моя карта"},{id:"feedback",name:"Обратная связь"}] as const).map(t=><button type="button" key={t.id} className={tab===t.id?"active":""} onClick={()=>{setTab(t.id);setNotice("");}} aria-current={tab===t.id?"page":undefined}>{t.name}</button>)}
      </nav>
      {tab==="inquiry"&&<section className="pr-panel" aria-labelledby="pr-question">
        <div className="pr-sectionhead"><span>ИССЛЕДОВАНИЕ · {step+1} ИЗ {steps.length}</span><span>{filled} ответов сохранено</span></div>
        <div className="pr-progress" role="progressbar" aria-valuenow={filled} aria-valuemin={0} aria-valuemax={steps.length} aria-label="Заполненные вопросы"><span style={{width:`${filled/steps.length*100}%`}}/></div>
        <h2 id="pr-question">{steps[step].title}</h2><p className="pr-question">{steps[step].question}</p><p className="pr-hint">{steps[step].hint}</p>
        <label className="pr-label" htmlFor="pr-answer">Ваши слова</label>
        <textarea id="pr-answer" rows={5} maxLength={3000} value={data.inquiry[steps[step].key]} onChange={e=>updateInquiry(steps[step].key,e.target.value)} placeholder="Можно начать с нескольких слов…"/>
        <div className="pr-actions"><button className="pr-ghost" disabled={step===0} onClick={()=>setStep(v=>Math.max(0,v-1))}>← Назад</button><button className="pr-primary" disabled={!data.inquiry[steps[step].key].trim()} onClick={()=>{chime();if(step<steps.length-1)setStep(v=>v+1);else setTab("map");}}>{step===steps.length-1?"Открыть наблюдение ✧":"Продолжить →"}</button></div>
      </section>}
      {tab==="journal"&&<section className="pr-panel">
        <div className="pr-sectionhead"><span>ЛИЧНЫЙ ДНЕВНИК</span><span>{data.entries.length} записей</span></div>
        <h2>Замечать, а не исправлять себя</h2>
        <p className="pr-hint">В течение недели, если захочется, возвращайтесь сюда после реальных ситуаций. Не нужно специально создавать конфликты или заставлять себя говорить «нет».</p>
        <label className="pr-label" htmlFor="pr-situation">Что произошло?</label><textarea id="pr-situation" rows={3} maxLength={2000} value={draft.situation} onChange={e=>setDraft(d=>({...d,situation:e.target.value}))} placeholder="Один конкретный момент…"/>
        <label className="pr-label" htmlFor="pr-did">Что вы сделали или сказали?</label><textarea id="pr-did" rows={2} maxLength={1500} value={draft.did} onChange={e=>setDraft(d=>({...d,did:e.target.value}))}/>
        <label className="pr-label" htmlFor="pr-wanted">Чего вам хотелось?</label><textarea id="pr-wanted" rows={2} maxLength={1500} value={draft.wanted} onChange={e=>setDraft(d=>({...d,wanted:e.target.value}))}/>
        <label className="pr-label" htmlFor="pr-other">Что произошло в ответ? (необязательно)</label><textarea id="pr-other" rows={2} maxLength={1500} value={draft.other} onChange={e=>setDraft(d=>({...d,other:e.target.value}))}/>
        <div className="pr-actions"><span className="pr-hint">Записи сохраняются только в этом браузере.</span><button className="pr-primary" disabled={!draft.situation.trim()||!draft.wanted.trim()} onClick={saveEntry}>Сохранить запись ✧</button></div>
        {data.entries.length>0&&<div className="pr-entrylist"><h3>Ваши наблюдения</h3>{data.entries.map((e,i)=><article className="pr-entry" key={e.id}><div className="pr-entrytitle">Наблюдение {i+1} · {new Date(e.at).toLocaleDateString("ru-RU")}</div><p>{e.situation}</p><p><strong>Я сделала:</strong> {e.did||"—"}</p><p><strong>Я хотела:</strong> {e.wanted}</p>{e.other&&<p><strong>В ответ:</strong> {e.other}</p>}<button className="pr-delete" onClick={()=>setData(d=>({...d,entries:d.entries.filter(x=>x.id!==e.id)}))}>Удалить запись</button></article>)}</div>}
      </section>}
      {tab==="map"&&<section className="pr-panel pr-map">
        <div className="pr-sectionhead"><span>ЛИЧНАЯ КАРТА НАБЛЮДЕНИЙ</span><span>{data.entries.length} записей в дневнике</span></div>
        {makeThreads(Math.min(5,Math.floor(filled/2)+data.entries.length))}
        <h2>Нити вашего опыта</h2>
        <p className="pr-hint">Это не диагноз и не готовая истина о вас. Карта помогает сопоставить ваши собственные слова.</p>
        {!completed&&<p className="pr-prompt">Вы пока ответили на {filled} из {steps.length} вопросов. Можно посмотреть предварительную карту или вернуться к исследованию.</p>}
        <div className="pr-insight"><span>ВОЗМОЖНО, СТОИТ ЗАДЕРЖАТЬСЯ ЗДЕСЬ</span><p>{observation}</p></div>
        {data.inquiry.wish.trim()&&<div className="pr-contrast"><div><small>ЧЕГО МНЕ ХОТЕЛОСЬ</small><p>{data.inquiry.wish}</p></div><div><small>ЧТО Я СДЕЛАЛА / СДЕЛАЛ</small><p>{data.inquiry.action||"Пока нет ответа"}</p></div></div>}
        {data.entries.length>0&&<div className="pr-insight"><span>ИЗ ДНЕВНИКА · {data.entries.length} НАБЛЮДЕНИЙ</span><p>В последней записи вы хотели: «{data.entries[data.entries.length-1].wanted}». Что общего с вашей первой ситуацией — а что отличается? Необязательно находить единый паттерн.</p></div>}
        <p className="pr-hint">В этой пилотной версии уточнения основаны на ограниченных правилах, а не на ИИ-анализе. Не приписывайте карте знания, которых в ней нет.</p>
        <div className="pr-actions"><button className="pr-ghost" onClick={()=>setTab("journal")}>Перейти в дневник</button><button className="pr-primary" onClick={()=>{chime();setTab("feedback");}}>Завершить и поделиться впечатлением →</button></div>
      </section>}
      {tab==="feedback"&&<section className="pr-panel">
        <div className="pr-sectionhead"><span>ВАШ ОПЫТ</span><span>НЕЗАВИСИМАЯ ОБРАТНАЯ СВЯЗЬ</span></div><h2>Что осталось с вами?</h2>
        <p className="pr-hint">Можно ответить «ничего». Критика важнее вежливых похвал.</p>
        <label className="pr-label" htmlFor="pr-insight">Что вы заметили или поняли о себе? Если ничего нового — так и напишите.</label><textarea id="pr-insight" rows={3} maxLength={2500} value={data.feedback} onChange={e=>setData(d=>({...d,feedback:e.target.value}))}/>
        <label className="pr-label" htmlFor="pr-usefulness">Насколько полезной оказалась практика?</label><select id="pr-usefulness" value={data.usefulness} onChange={e=>setData(d=>({...d,usefulness:e.target.value}))}><option value="">Выберите ответ</option><option value="new">Заметила(а) что-то новое</option><option value="organized">Помогла упорядочить известное</option><option value="little">Интересно, но мало пользы</option><option value="none">Не получила(а) пользы</option></select>
        <label className="pr-label" htmlFor="pr-criticism">Что было лишним, раздражающим или непонятным?</label><textarea id="pr-criticism" rows={3} maxLength={2500} value={data.criticism} onChange={e=>setData(d=>({...d,criticism:e.target.value}))}/>
        <label className="pr-check"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/> Разрешаю использовать мой ответ как анонимный отзыв после отдельного согласования текста.</label>
        <p className="pr-hint">Пока это локальный прототип: ответы не отправляются автору и не публикуются. Вы можете экспортировать их для добровольной передачи.</p>
        <div className="pr-actions"><button className="pr-primary" onClick={exportData}>Скачать свои ответы</button></div>
      </section>}
      {notice&&<p className="pr-notice" role="status">{notice}</p>}
      <footer className="pr-footer"><p>Материал предназначен для самостоятельного исследования, не является диагностикой или психотерапией. Не продолжайте, если вопросы усиливают тяжёлое состояние; при необходимости обратитесь за профессиональной поддержкой.</p><p>Личные ответы хранятся в браузере этого устройства, не передаются на сервер и могут быть доступны другим пользователям этого браузера. Не используйте общее устройство для конфиденциальных записей.</p><div className="pr-actions"><button className="pr-ghost" onClick={exportData}>Экспортировать записи</button><button className="pr-delete" onClick={()=>{if(window.confirm("Удалить все записи этой практики на данном устройстве?")){localStorage.removeItem(KEY);setData(initial);setStep(0);setTab("inquiry");setNotice("Локальные записи удалены.");}}}>Удалить мои записи</button></div></footer>
    </main>
  </div>;
}
