import { useEffect, useMemo, useRef, useState } from "react";
import { reachGoal } from "@/lib/metrika";
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
function reflectionSections(q: Inquiry) {
  const quoted = (value: string) => value.trim() || "Вы пока не описали этот момент.";
  return [
    {title:"01 · Сцена, в которой вы оказались",body:`Вы вспомнили: «${quoted(q.scene)}». Это конкретная ситуация, а не определение всей вашей личности. Полезно удержать её подробности: с кем вы были, чего ожидали, что произошло до вашего решения.`},
    {title:"02 · Где разошлись желание и поступок",body:`Ваше желание: «${quoted(q.wish)}». Ваше действие: «${quoted(q.action)}». Между ними есть расстояние. Попробуйте заметить, в какой именно момент вы решили поступить иначе и что тогда стало для вас важнее собственного желания.`},
    {title:"03 · Какую цену вы предполагали",body:`Вы написали о возможном последствии: «${quoted(q.fear)}». Это ваше ожидание в той ситуации. Оно могло опираться на реальный опыт, прошлые отношения или неопределённость. Пока мы не знаем, какой из вариантов ближе.`},
    {title:"04 · Что действительно происходило между вами",body:`Ваш опыт ответов другого человека: «${quoted(q.response)}». Сопоставьте это с предыдущим ожиданием. Есть ли подтверждения опасению? Или вы заранее отказались от желания, ещё не узнав реакцию другого? Если ответ другого действительно был болезненным, важно не возлагать всю ответственность на себя.`},
    {title:"05 · Повторение или особенный случай",body:`О повторении вы заметили: «${quoted(q.repeated)}». Похожий эпизод ещё не означает устойчивый сценарий. Спросите себя, что здесь знакомо, а что отличается от прежних ситуаций.`},
  ];
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
  const [reveal,setReveal] = useState(false);
  const [draft,setDraft] = useState({ situation:"", did:"", wanted:"", other:"" });
  const [consent,setConsent] = useState(false);
  const [notice,setNotice] = useState("");
  const started = useRef(false);
  const finished = useRef(false);
  useEffect(()=>{ reachGoal("pilot_practice_open"); },[]);
  function recordStart(){if(!started.current){started.current=true;reachGoal("pilot_practice_start");}}
  function recordFinish(){if(!finished.current){finished.current=true;reachGoal("pilot_practice_complete");}}
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
      <div className="pr-eyebrow">ИНТЕРАКТИВНАЯ ПРАКТИКА · СВОБОДНЫЙ ДОСТУП</div>
      <h1>Почему я снова <em>отказываюсь от себя?</em></h1>
      <p className="pr-intro">От страха чужого «нет» — к вниманию к собственному желанию. Здесь нет правильных ответов и необходимости что-то менять прямо сейчас.</p>
      <div className="pr-ornament" aria-hidden="true">✧ ───────── ✧</div>
      <p className="pr-hint">Шесть шагов. Ваши ответы постепенно соединятся в личную карту наблюдений. Звук необязателен — его можно включить в правом верхнем углу.</p>
      <nav className="pr-tabs" aria-label="Разделы практики">
        {([{id:"inquiry",name:"Исследование"},{id:"journal",name:"Дневник"},{id:"map",name:"Моя карта"},{id:"feedback",name:"Обратная связь"}] as const).map(t=><button type="button" key={t.id} className={tab===t.id?"active":""} onClick={()=>{setTab(t.id);setNotice("");}} aria-current={tab===t.id?"page":undefined}>{t.name}</button>)}
      </nav>
      {tab==="inquiry"&&<section className="pr-panel" aria-labelledby="pr-question">
        <div className="pr-sectionhead"><span>ИССЛЕДОВАНИЕ · {step+1} ИЗ {steps.length}</span><span>{filled} ответов сохранено</span></div>
        <div className="pr-progress" role="progressbar" aria-valuenow={filled} aria-valuemin={0} aria-valuemax={steps.length} aria-label="Заполненные вопросы"><span style={{width:`${filled/steps.length*100}%`}}/></div>
        <h2 id="pr-question">{steps[step].title}</h2><p className="pr-question">{steps[step].question}</p><p className="pr-hint">{steps[step].hint}</p>
        <label className="pr-label" htmlFor="pr-answer">Ваши слова</label>
        <textarea id="pr-answer" rows={5} maxLength={3000} value={data.inquiry[steps[step].key]} onChange={e=>{recordStart();updateInquiry(steps[step].key,e.target.value);}} placeholder="Можно начать с нескольких слов…"/>
        <div className="pr-actions"><button className="pr-ghost" disabled={step===0} onClick={()=>setStep(v=>Math.max(0,v-1))}>← Назад</button><button className="pr-primary" disabled={!data.inquiry[steps[step].key].trim()} onClick={()=>{chime();if(step<steps.length-1)setStep(v=>v+1);else {recordFinish();setReveal(true);setTab("map");}}}>{step===steps.length-1?"Открыть наблюдение ✧":"Продолжить →"}</button></div>
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
        <div className={reveal?"pr-threads pr-threads-reveal":"pr-threads"}>{makeThreads(Math.min(5,Math.floor(filled/2)+data.entries.length))}</div>
        <h2>Нити вашего опыта</h2>
        <p className="pr-hint">Здесь ваши слова складываются в последовательность. Это приглашение к размышлению, а не диагноз и не окончательный вывод о вас.</p>
        {!completed&&<p className="pr-prompt">Вы пока ответили на {filled} из {steps.length} вопросов. Можно посмотреть предварительную карту или вернуться к исследованию.</p>}
        <div className="pr-insight"><span>ВОЗМОЖНО, СТОИТ ЗАДЕРЖАТЬСЯ ЗДЕСЬ</span><p>{observation}</p></div>
        {data.inquiry.wish.trim()&&<div className="pr-contrast"><div><small>ЧЕГО МНЕ ХОТЕЛОСЬ</small><p>{data.inquiry.wish}</p></div><div><small>ЧТО Я СДЕЛАЛА / СДЕЛАЛ</small><p>{data.inquiry.action||"Пока нет ответа"}</p></div></div>}
        {data.entries.length>0&&<div className="pr-insight"><span>ИЗ ДНЕВНИКА · {data.entries.length} НАБЛЮДЕНИЙ</span><p>В последней записи вы хотели: «{data.entries[data.entries.length-1].wanted}». Что общего с вашей первой ситуацией — а что отличается? Необязательно находить единый паттерн.</p></div>}
        {completed&&<div className="pr-reflection" aria-label="Развёрнутый разбор вашей ситуации"><h3>Ваша история: пять точек внимания</h3><p className="pr-hint">Это разбор по вашим собственным ответам. Он не устанавливает бессознательные причины и не заменяет разговор с психотерапевтом.</p>{reflectionSections(data.inquiry).map(section=><article className="pr-reflection-item" key={section.title}><h4>{section.title}</h4><p>{section.body}</p></article>)}<div className="pr-insight"><span>ЧТО МОЖНО ВЗЯТЬ С СОБОЙ</span><p>В ближайшие дни не нужно заставлять себя говорить «нет». Попробуйте просто заметить момент, когда возникает желание, и тот момент, когда вы решаете его скрыть. Что между ними происходит? Какие чувства возникают? Можно записать один такой эпизод в дневник.</p></div><p className="pr-hint">Ваши записи остаются на этом устройстве. Вы можете вернуться к ним позже или удалить их.</p></div>}
        {!completed&&<p className="pr-hint">Для развёрнутой карты ответьте на все шесть вопросов в разделе «Исследование».</p>}
        <div className="pr-actions"><button className="pr-ghost" onClick={()=>setTab("journal")}>Перейти в дневник</button><button className="pr-primary" onClick={()=>{recordFinish();chime();setTab("feedback");}}>Завершить и поделиться впечатлением →</button></div>
      </section>}
      {tab==="feedback"&&<section className="pr-panel">
        <div className="pr-sectionhead"><span>ВАШ ОПЫТ</span><span>НЕЗАВИСИМАЯ ОБРАТНАЯ СВЯЗЬ</span></div><h2>Что осталось с вами?</h2>
        <p className="pr-hint">Можно ответить «ничего». Критика важнее вежливых похвал.</p>
        <label className="pr-label" htmlFor="pr-insight">Что вы заметили или поняли о себе? Если ничего нового — так и напишите.</label><textarea id="pr-insight" rows={3} maxLength={2500} value={data.feedback} onChange={e=>setData(d=>({...d,feedback:e.target.value}))}/>
        <label className="pr-label" htmlFor="pr-usefulness">Насколько полезной оказалась практика?</label><select id="pr-usefulness" value={data.usefulness} onChange={e=>setData(d=>({...d,usefulness:e.target.value}))}><option value="">Выберите ответ</option><option value="new">Заметила(а) что-то новое</option><option value="organized">Помогла упорядочить известное</option><option value="little">Интересно, но мало пользы</option><option value="none">Не получила(а) пользы</option></select>
        <label className="pr-label" htmlFor="pr-criticism">Что было лишним, раздражающим или непонятным?</label><textarea id="pr-criticism" rows={3} maxLength={2500} value={data.criticism} onChange={e=>setData(d=>({...d,criticism:e.target.value}))}/>
        <label className="pr-check"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/> Разрешаю использовать мой ответ как анонимный отзыв после отдельного согласования текста.</label>
        <p className="pr-hint">Ответы сохраняются только в вашем браузере и не отправляются автору автоматически. Если захотите поделиться впечатлением, используйте ссылку на Telegram ниже — без личных записей из практики.</p>
        <div className="pr-actions"><button className="pr-primary" onClick={exportData}>Скачать свои ответы</button></div>
        <p className="pr-hint">Хотите помочь улучшить пилот? Напишите автору в Telegram, что было полезным, а что нет. Не пересылайте личные записи из дневника без необходимости.</p>
        <a className="pr-primary" href="https://t.me/chudesa_v_tebe" target="_blank" rel="noopener noreferrer" onClick={()=>reachGoal("pilot_practice_feedback_click")}>Оставить отзыв в Telegram →</a>
        <p className="pr-hint">Если захотите обсудить свою ситуацию в психотерапии, напишите для записи на консультацию по той же ссылке.</p>
      </section>}
      {notice&&<p className="pr-notice" role="status">{notice}</p>}
      <footer className="pr-footer"><p>Материал предназначен для самостоятельного исследования, не является диагностикой или психотерапией. Не продолжайте, если вопросы усиливают тяжёлое состояние; при необходимости обратитесь за профессиональной поддержкой.</p><p>Личные ответы хранятся в браузере этого устройства, не передаются на сервер и могут быть доступны другим пользователям этого браузера. Не используйте общее устройство для конфиденциальных записей.</p><div className="pr-actions"><button className="pr-ghost" onClick={exportData}>Экспортировать записи</button><button className="pr-delete" onClick={()=>{if(window.confirm("Удалить все записи этой практики на данном устройстве?")){localStorage.removeItem(KEY);setData(initial);setStep(0);setTab("inquiry");setNotice("Локальные записи удалены.");}}}>Удалить мои записи</button></div></footer>
    </main>
  </div>;
}
