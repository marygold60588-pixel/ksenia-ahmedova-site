import { useEffect, useMemo, useRef, useState } from "react";
import { reachGoal } from "@/lib/metrika";
import { interpretLocally } from "@/lib/practiceInterpretation";
import { adaptiveReflection, type PracticeReaction } from "@/lib/practiceAdaptive";
import "./InteractivePracticePage.css";

type Inquiry = { scene: string; action: string; wish: string; fear: string; response: string; repeated: string };
type Entry = { id: string; at: string; situation: string; did: string; wanted: string; fear?: string; other: string };
type Saved = { hypothesisReaction?:string; adaptiveReaction?:PracticeReaction; depth?: {protection?:string;relief?:string;feeling?:string;cost?:string;next?:string;consequence?:string;innerMeaning?:string;permission?:string}; inquiry: Inquiry; entries: Entry[]; feedback: string; criticism: string; usefulness: string; insight?: string };
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
const initial: Saved = { inquiry: blank, entries: [], feedback: "", criticism: "", usefulness: "", insight: "" };
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
  const [mapStage,setMapStage] = useState(0);
  const [draft,setDraft] = useState({ situation:"", did:"", wanted:"", fear:"", other:"" });
  const [consent,setConsent] = useState(false);
  const [feedbackConsent,setFeedbackConsent] = useState(false);
  const [aiConsent,setAiConsent] = useState(false);
  const [aiAdult,setAiAdult] = useState(false);
  const [notice,setNotice] = useState("");
  const [personalReviewOpen,setPersonalReviewOpen] = useState(false);
  const [feedbackSending,setFeedbackSending] = useState(false);
  const [feedbackSent,setFeedbackSent] = useState(false);
  const [counts,setCounts] = useState<{open:number;start:number;complete:number;feedback:number}|null>(null);
  const started = useRef(false);
  const finished = useRef(false);
  useEffect(()=>{ reachGoal("pilot_practice_open"); void fetch("/api/practice/event",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({event:"open"})}).catch(()=>{}); void fetch("/api/practice/stats").then(r=>r.ok?r.json():null).then(j=>{if(j?.ok)setCounts(j.counts);}).catch(()=>{}); },[]);
  function recordStart(){if(!started.current){started.current=true;reachGoal("pilot_practice_start");void fetch("/api/practice/event",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({event:"start"})}).catch(()=>{});}}
  function recordFinish(){if(!finished.current){finished.current=true;reachGoal("pilot_practice_complete");void fetch("/api/practice/event",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({event:"complete"})}).catch(()=>{});}}
  useEffect(()=>{ try { localStorage.setItem(KEY,JSON.stringify(data)); } catch { setNotice("Не удалось сохранить запись на этом устройстве."); } },[data]);
  const completed = steps.every(s=>data.inquiry[s.key].trim());
  const filled = steps.filter(s=>data.inquiry[s.key].trim()).length;
  const observation = useMemo(()=>gentleObservation(data.inquiry),[data.inquiry]);
  const localInterpretation = useMemo(()=>interpretLocally(data.inquiry),[data.inquiry]);
  const adaptive = useMemo(()=>adaptiveReflection(data.inquiry,data.adaptiveReaction),[data.inquiry,data.adaptiveReaction]);
  function chime() {
    if (!sound) return;
    try {
      // Airy crystal chimes: four quiet notes with long, soft decay.
      // Synthesized locally, without downloading audio or contacting any service.
      const AudioCtx = window.AudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const master = ctx.createGain();
      master.gain.value = 0.22;
      master.connect(ctx.destination);
      const delays = [0.13, 0.29, 0.48, 0.75];
      const echoes = [0.19, 0.13, 0.09, 0.06];
      const bus = ctx.createGain();
      bus.connect(master);
      delays.forEach((seconds, i) => {
        const delay = ctx.createDelay(1);
        const level = ctx.createGain();
        delay.delayTime.value = seconds;
        level.gain.value = echoes[i];
        bus.connect(delay);
        delay.connect(level);
        level.connect(master);
      });
      const notes = [
        { at: 0.10, freq: 880, level: 0.14 },
        { at: 0.49, freq: 1174.66, level: 0.11 },
        { at: 0.96, freq: 1318.51, level: 0.105 },
        { at: 1.58, freq: 1760, level: 0.075 },
      ];
      notes.forEach(({ at, freq, level }) => {
        const when = ctx.currentTime + at;
        [1, 2.003, 3.96].forEach((harmonic, index) => {
          const oscillator = ctx.createOscillator();
          const envelope = ctx.createGain();
          oscillator.type = "sine";
          oscillator.frequency.value = freq * harmonic;
          const volume = level * [1, 0.22, 0.10][index];
          envelope.gain.setValueAtTime(0.00001, when);
          envelope.gain.exponentialRampToValueAtTime(Math.max(0.00002, volume), when + 0.025);
          envelope.gain.exponentialRampToValueAtTime(0.00001, when + 3.5);
          oscillator.connect(envelope);
          envelope.connect(bus);
          oscillator.start(when);
          oscillator.stop(when + 3.55);
        });
      });
      window.setTimeout(() => { void ctx.close().catch(() => {}); }, 5500);
    } catch { /* Keep the practice fully usable without sound. */ }
  }
  function updateInquiry(key:keyof Inquiry,value:string){setData(d=>({...d,inquiry:{...d.inquiry,[key]:value}}));}
  function saveEntry(){
    if(!draft.situation.trim()||!draft.wanted.trim())return;
    const entry:Entry={...draft,id:crypto.randomUUID(),at:new Date().toISOString()};
    setData(d=>({...d,entries:[...d.entries,entry]}));
    setDraft({situation:"",did:"",wanted:"",fear:"",other:""});
    setNotice("Запись сохранена на этом устройстве.");chime();
  }
  async function submitFeedback(){
    if(feedbackSending || feedbackSent || !feedbackConsent || (!data.feedback.trim()&&!data.criticism.trim()&&!data.usefulness))return;
    setFeedbackSending(true);
    try {
      const response=await fetch("/api/practice/feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({feedback:data.feedback,criticism:data.criticism,usefulness:data.usefulness,consent,privacyConsent:feedbackConsent})});
      if(!response.ok)throw new Error("send_failed");
      setFeedbackSent(true);
      setNotice("Спасибо! Ваш отклик отправлен и сохранён на сайте.");
      setCounts(c=>c?{...c,feedback:c.feedback+1}:c);
      reachGoal("pilot_practice_feedback_submit");
    } catch {setNotice("Не удалось отправить отклик. Попробуйте ещё раз чуть позже — текст сохранён в этом браузере.");}
    finally {setFeedbackSending(false);}
  }
  function exportData(){
    const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);const a=document.createElement("a");
    a.href=url;a.download="moi-nablyudeniya.json";a.click();URL.revokeObjectURL(url);
  }
  function exportReviewRequest() {
    const q=data.inquiry;
    const lines=["ЗАПРОС НА ЛИЧНЫЙ ПИСЬМЕННЫЙ РАЗБОР","Подготовлен на моём устройстве. Не отправлен на сайт.","",...steps.map((s,i)=>`${i+1}. ${s.title} — ${s.question}\n${q[s.key] || "Не заполнено"}`),"",`Реакция на гипотезу: ${data.adaptiveReaction==="resonates"?"Откликается":data.adaptiveReaction==="partly"?"Отчасти":data.adaptiveReaction==="disagree"?"Не похоже":"Не указана"}`,"", "Дополнительные ответы:", ...Object.entries(data.depth||{}).map(([k,v])=>`${k}: ${v}`)];
    const blob=new Blob([lines.join("\n\n")],{type:"text/plain;charset=utf-8"});
    const url=URL.createObjectURL(blob);const a=document.createElement("a");
    a.href=url;a.download="zapros-na-lichnyi-razbor.txt";a.click();URL.revokeObjectURL(url);
    setNotice("Файл с запросом сохранён на вашем устройстве. На сайт ничего не отправлено.");
  }
  return <div className="pr-root">
    <div className="pr-halo" aria-hidden="true"/>
    <header className="pr-top"><a href="/" className="pr-brand">Ксения Ахмедова <span>· психологические практики</span></a><button type="button" className="pr-sound" onClick={()=>setSound(v=>!v)} aria-pressed={sound}>{sound?"♫ Звук включён":"♩ Включить звук"}</button></header>
    <main className="pr-shell">
      <div className="pr-eyebrow">ИНТЕРАКТИВНАЯ ПРАКТИКА · СВОБОДНЫЙ ДОСТУП</div>
      <h1>Почему я снова <em>отказываюсь от себя?</em></h1>
      <p className="pr-intro">От страха чужого «нет» — к вниманию к собственному желанию. Здесь нет правильных ответов и необходимости что-то менять прямо сейчас.</p>
      <div className="pr-ornament" aria-hidden="true">✧ ───────── ✧</div>
      <p className="pr-hint">Шесть шагов. Ваши ответы постепенно соединятся в личную карту наблюдений. Участие бесплатно — 0 ₽. Звук необязателен.</p>
      {counts&&<p className="pr-hint" aria-label="Счётчик прохождений">Открыли практику: {counts.open} · Начали: {counts.start} · Завершили: {counts.complete} · Оставили отклик: {counts.feedback}</p>}
      <nav className="pr-tabs" aria-label="Разделы практики">
        {([{id:"inquiry",name:"Исследование"},{id:"journal",name:"Дневник"},{id:"map",name:"Моя карта"},{id:"feedback",name:"Обратная связь"}] as const).map(t=><button type="button" key={t.id} className={tab===t.id?"active":""} onClick={()=>{setTab(t.id);setNotice("");}} aria-current={tab===t.id?"page":undefined}>{t.name}</button>)}
      </nav>
      {tab==="inquiry"&&<section className="pr-panel" aria-labelledby="pr-question">
        <div className="pr-sectionhead"><span>ИССЛЕДОВАНИЕ · {step+1} ИЗ {steps.length}</span><span>{filled} ответов сохранено</span></div>
        <div className="pr-progress" role="progressbar" aria-valuenow={filled} aria-valuemin={0} aria-valuemax={steps.length} aria-label="Заполненные вопросы"><span style={{width:`${filled/steps.length*100}%`}}/></div>
        <h2 id="pr-question">{steps[step].title}</h2><p className="pr-question">{steps[step].question}</p><p className="pr-hint">{steps[step].hint}</p>
        <label className="pr-label" htmlFor="pr-answer">Ваши слова</label>
        <textarea id="pr-answer" rows={5} maxLength={3000} value={data.inquiry[steps[step].key]} onChange={e=>{recordStart();updateInquiry(steps[step].key,e.target.value);}} placeholder="Можно начать с нескольких слов…"/>
        <div className="pr-actions"><button className="pr-ghost" disabled={step===0} onClick={()=>setStep(v=>Math.max(0,v-1))}>← Назад</button><button className="pr-primary" disabled={!data.inquiry[steps[step].key].trim()} onClick={()=>{chime();if(step<steps.length-1)setStep(v=>v+1);else {recordFinish();setReveal(true);setMapStage(v=>v+1);setTab("map");}}}>{step===steps.length-1?"Открыть наблюдение ✧":"Продолжить →"}</button></div>
      </section>}
      {tab==="journal"&&<section className="pr-panel">
        <div className="pr-sectionhead"><span>ЛИЧНЫЙ ДНЕВНИК</span><span>{data.entries.length} записей</span></div>
        <h2>Замечать, а не исправлять себя</h2>
        <p className="pr-hint">За семь дней достаточно даже одной записи. Дневник не требует ежедневного заполнения: важнее заметить различие между ожиданием и тем, что действительно произошло.</p>
        <p className="pr-hint">В течение недели, если захочется, возвращайтесь сюда после реальных ситуаций. Не нужно специально создавать конфликты или заставлять себя говорить «нет».</p>
        <label className="pr-label" htmlFor="pr-situation">Что произошло?</label><textarea id="pr-situation" rows={3} maxLength={2000} value={draft.situation} onChange={e=>setDraft(d=>({...d,situation:e.target.value}))} placeholder="Один конкретный момент…"/>
        <label className="pr-label" htmlFor="pr-did">Что вы сделали или сказали?</label><textarea id="pr-did" rows={2} maxLength={1500} value={draft.did} onChange={e=>setDraft(d=>({...d,did:e.target.value}))}/>
        <label className="pr-label" htmlFor="pr-wanted">Чего вам хотелось?</label><textarea id="pr-wanted" rows={2} maxLength={1500} value={draft.wanted} onChange={e=>setDraft(d=>({...d,wanted:e.target.value}))}/>
        <label className="pr-label" htmlFor="pr-fear">Чего вы опасались? (необязательно)</label><textarea id="pr-fear" rows={2} maxLength={1500} value={draft.fear} onChange={e=>setDraft(d=>({...d,fear:e.target.value}))} placeholder="Какого ответа или последствия вы ожидали?"/>
        <label className="pr-label" htmlFor="pr-other">Что произошло в ответ? (необязательно)</label><textarea id="pr-other" rows={2} maxLength={1500} value={draft.other} onChange={e=>setDraft(d=>({...d,other:e.target.value}))}/>
        <div className="pr-actions"><span className="pr-hint">Записи сохраняются только в этом браузере.</span><button className="pr-primary" disabled={!draft.situation.trim()||!draft.wanted.trim()} onClick={saveEntry}>Сохранить запись ✧</button></div>
        {data.entries.length>0&&<div className="pr-entrylist"><h3>Ваши наблюдения</h3>{data.entries.map((e,i)=><article className="pr-entry" key={e.id}><div className="pr-entrytitle">Наблюдение {i+1} · {new Date(e.at).toLocaleDateString("ru-RU")}</div><p>{e.situation}</p><p><strong>Я сделала:</strong> {e.did||"—"}</p><p><strong>Мне хотелось:</strong> {e.wanted}</p>{e.fear&&<p><strong>Я опасалась / опасался:</strong> {e.fear}</p>}{e.other&&<p><strong>В ответ:</strong> {e.other}</p>}<button className="pr-delete" onClick={()=>setData(d=>({...d,entries:d.entries.filter(x=>x.id!==e.id)}))}>Удалить запись</button></article>)}</div>}
      </section>}
      {tab==="map"&&<section className="pr-panel pr-map">
        <div className="pr-sectionhead"><span>ЛИЧНАЯ КАРТА НАБЛЮДЕНИЙ</span><span>{data.entries.length} записей в дневнике</span></div>
        <div key={mapStage} className={reveal?"pr-threads pr-threads-reveal":"pr-threads"}>{makeThreads(Math.min(5,Math.floor(filled/2)+data.entries.length))}</div>
        <h2>Нити вашего опыта</h2>
        <p className="pr-hint">Здесь ваши слова складываются в последовательность. Это приглашение к размышлению, а не диагноз и не окончательный вывод о вас.</p>
        {!completed&&<p className="pr-prompt">Вы пока ответили на {filled} из {steps.length} вопросов. Можно посмотреть предварительную карту или вернуться к исследованию.</p>}
        <div className="pr-insight"><span>ВОЗМОЖНО, СТОИТ ЗАДЕРЖАТЬСЯ ЗДЕСЬ</span><p>{observation}</p></div>
        {data.inquiry.wish.trim()&&<div className="pr-contrast"><div><small>ЧЕГО МНЕ ХОТЕЛОСЬ</small><p>{data.inquiry.wish}</p></div><div><small>ЧТО Я СДЕЛАЛА / СДЕЛАЛ</small><p>{data.inquiry.action||"Пока нет ответа"}</p></div></div>}
        {data.entries.length>0&&<div className="pr-insight"><span>ИЗ ДНЕВНИКА · {data.entries.length} НАБЛЮДЕНИЙ</span><p>В последней записи вы хотели: «{data.entries[data.entries.length-1].wanted}». Что общего с вашей первой ситуацией — а что отличается? Необязательно находить единый паттерн.</p></div>}
        {completed&&<div className="pr-reflection" aria-label="Развёрнутый разбор вашей ситуации"><h3>Ваша история: пять точек внимания</h3><p className="pr-hint">Это разбор по вашим собственным ответам. Он не устанавливает бессознательные причины и не заменяет разговор с психотерапевтом.</p>{reflectionSections(data.inquiry).map(section=><article className="pr-reflection-item" key={section.title}><h4>{section.title}</h4><p>{section.body}</p></article>)}<div className="pr-insight"><span>ЧТО МОЖНО ВЗЯТЬ С СОБОЙ</span><p>В ближайшие дни не нужно заставлять себя говорить «нет». Попробуйте просто заметить момент, когда возникает желание, и тот момент, когда вы решаете его скрыть. Что между ними происходит? Какие чувства возникают? Можно записать один такой эпизод в дневник.</p></div><p className="pr-hint">Ваши записи остаются на этом устройстве. Вы можете вернуться к ним позже или удалить их.</p></div>}
        {completed&&<div className="pr-own-insight">
          <div className="pr-eyebrow">ВАШЕ ОТКРЫТИЕ</div>
          <h3>Что вы сейчас видите иначе?</h3>
          <p>Вернитесь к собственным словам. <strong>Вы хотели:</strong> «{data.inquiry.wish}». <strong>Но поступили так:</strong> «{data.inquiry.action}». <strong>Возможно, вас останавливало ожидание:</strong> «{data.inquiry.fear}».</p>
          <p>Это ещё не ответ о причинах. Но, возможно, теперь вы видите связь, которую прежде не замечали. Что для вас оказалось самым неожиданным? Что хочется понять глубже?</p>
          <label className="pr-label" htmlFor="pr-my-insight">Сформулируйте своё открытие — так, как сказали бы самому себе</label>
          <textarea id="pr-my-insight" rows={4} maxLength={2500} placeholder="Сейчас я замечаю, что…" value={data.insight||""} onChange={e=>setData(d=>({...d,insight:e.target.value}))}/>
          <p className="pr-hint">Здесь может быть и сомнение, и несогласие с разбором. Важно то, что вы сами думаете об этой ситуации.</p>
        </div>}
        {completed&&<details className="pr-reflection" aria-label="Необязательная интерпретация с помощью ИИ"><summary>Дополнительно: интерпретация с помощью ИИ (пока недоступна)</summary><div className="pr-eyebrow">НЕОБЯЗАТЕЛЬНЫЙ ВНЕШНИЙ СЕРВИС · НЕ ЛИЧНЫЙ РАЗБОР КСЕНИИ</div><h3>Интерпретация с помощью ИИ</h3><p>В будущей версии ИИ сможет предложить гипотезу по вашей ситуации, а вы сможете согласиться, возразить или уточнить её. Сейчас внешняя обработка ответов отключена: ваши записи никуда не отправляются.</p><p className="pr-hint">Для включения потребуется отдельное добровольное согласие с указанием провайдера, страны обработки, целей и срока хранения. До юридической и технической проверки этот модуль недоступен.</p><label className="pr-check"><input type="checkbox" checked={aiAdult} onChange={e=>setAiAdult(e.target.checked)}/> Мне исполнилось 18 лет.</label><label className="pr-check"><input type="checkbox" checked={aiConsent} onChange={e=>setAiConsent(e.target.checked)}/> Я понимаю, что для ИИ-анализа потребуется передача выбранных ответов внешнему провайдеру. Это предварительное ознакомление, не разрешение на передачу данных.</label><button className="pr-ghost" type="button" disabled>ИИ-интерпретация пока недоступна</button></details>}
        {completed&&<section className="pr-reflection" aria-label="Что стоит за опасением расстроить другого"><div className="pr-eyebrow">ЕЩЁ ОДИН ШАГ ВГЛУБЬ · НЕОБЯЗАТЕЛЬНО</div><h3>Какой реакции другого человека вы боитесь?</h3><p>Другой может отказать, рассердиться, обидеться, промолчать или отреагировать совсем иначе. Какой реакции вы ожидаете? И что, по вашим ощущениям, произойдёт <strong>с вами</strong>, если она случится?</p><label className="pr-label" htmlFor="pr-consequence">«И тогда…» — продолжите своими словами</label><textarea id="pr-consequence" rows={3} maxLength={2000} placeholder="Например: я почувствую себя виноватой; мне станет страшно, что меня бросят…" value={data.depth?.consequence||""} onChange={e=>setData(d=>({...d,depth:{...d.depth,consequence:e.target.value}}))}/><h3>Что это скажет обо мне?</h3><p>Если вы позволите себе хотеть, а другой будет недоволен, какое представление о себе может возникнуть? «Я плохая», «я эгоист», «я разрушу отношения» — или совсем другое? Это только возможные варианты, не готовые ответы.</p><textarea rows={3} maxLength={2000} aria-label="Что для меня означает недовольство другого" placeholder="Для меня это означало бы…" value={data.depth?.innerMeaning||""} onChange={e=>setData(d=>({...d,depth:{...d.depth,innerMeaning:e.target.value}}))}/><h3>Чьё чувство я пытаюсь регулировать?</h3><p>Бывает, мы заранее берём ответственность за чужую обиду или разочарование. А бывает, последствия действительно опасны. Что здесь относится к вашей ответственности, а что — к чувствам и решениям другого человека? Что бы вы могли сделать из позиции признания и своих чувств, и права другого человека на его реакцию? Что в этой ситуации зависит от вас, а что вы не можете решить за другого человека?</p><textarea rows={3} maxLength={2000} aria-label="Моё желание и ответственность за чувства другого" placeholder="Я замечаю, что…" value={data.depth?.permission||""} onChange={e=>setData(d=>({...d,depth:{...d.depth,permission:e.target.value}}))}/><p className="pr-hint">Не нужно отвечать на всё сразу. Если есть реальная угроза, давление или насилие, ваша безопасность важнее исследования внутренних причин.</p></section>}
        {completed&&<section className="pr-reflection" aria-label="Моё чувство и реакция другого"><div className="pr-eyebrow">ВАЖНОЕ НАБЛЮДЕНИЕ</div><h3>Моё чувство — и реакция другого</h3><p>Другой человек может отказать, рассердиться, промолчать или поступить по-своему. Его реакция может задеть вас. Но то, что вы переживаете, связано не только с его поступком: иногда знакомое болезненное чувство возникает ещё до ответа — от паузы, интонации или ожидания отказа.</p><p><strong>Попробуйте различить:</strong> что действительно сделал другой человек и что возникло внутри вас? Это ваше переживание, и его можно исследовать: почему оно появляется, с каким опытом связано, в чём вы нуждаетесь в этот момент?</p><p>Это не означает, что вы виноваты в своих чувствах или что другой никогда не причиняет боль. Но когда вы начинаете различать его действия и собственный внутренний отклик, появляется больше свободы выбирать, как позаботиться о себе и что делать дальше.</p><label className="pr-label" htmlFor="pr-own-feeling">Как вы назвали бы своё чувство в этой ситуации?</label><textarea id="pr-own-feeling" rows={2} maxLength={2000} placeholder="Например: тревога, вина, злость, одиночество — или совсем другое…" value={data.depth?.feeling||""} onChange={e=>setData(d=>({...d,depth:{...d.depth,feeling:e.target.value}}))}/>{data.depth?.feeling?.trim()&&<p className="pr-hint">Вы назвали своё переживание: «{data.depth.feeling.trim()}». Попробуйте удержать различие между этим чувством и тем, что другой человек действительно сделал.</p>}</section>}{completed&&<section className="pr-reflection" aria-label="Личный письменный разбор от Ксении Ахмедовой"><div className="pr-eyebrow">ПРОДОЛЖЕНИЕ ПРАКТИКИ · ПО ЖЕЛАНИЮ</div><h3>Получить личный письменный разбор от Ксении Ахмедовой</h3><p>Вы можете заказать индивидуальный взгляд специалиста на вашу ситуацию и ответы. Бесплатная практика при этом остаётся доступной всем.</p><p className="pr-hint">Приём и оплата заказов пока не открыты. Мы готовим защищённую передачу ответов и закрытый кабинет. Ваши записи сейчас остаются в браузере.</p><button className="pr-primary" type="button" onClick={()=>setPersonalReviewOpen(v=>!v)} aria-expanded={personalReviewOpen}>{personalReviewOpen?"Свернуть информацию":"Узнать о личном разборе"}</button>{personalReviewOpen&&<div className="pr-insight"><span>КАК ЭТО БУДЕТ РАБОТАТЬ</span><p>1. Вы отдельно разрешите передачу выбранных ответов. 2. После оформления запроса Ксения прочитает историю и подготовит письменный разбор. 3. Результат появится в защищённом личном доступе.</p><p>Пока можно сохранить свой запрос в текстовый файл. Не отправляйте его через обычную форму обратной связи: она не предназначена для конфиденциальных историй.</p><button className="pr-ghost" type="button" onClick={exportReviewRequest}>Сохранить ответы для личного разбора (.txt)</button></div>}</section>}
        {completed&&<section className="pr-reflection" aria-label="Диалог с вашей историей"><div className="pr-eyebrow">ДИАЛОГ С ВАШЕЙ ИСТОРИЕЙ · БЕЗ ПЕРЕДАЧИ ДАННЫХ</div><h3>Что могло происходить внутри?</h3><p>{adaptive.hypothesis}</p><p><strong>Другой возможный взгляд:</strong> {adaptive.alternative}</p><p>{adaptive.question}</p>{adaptive.phase!=="safety"&&<div className="pr-actions">{(["resonates","partly","disagree"] as const).map((reaction)=><button key={reaction} type="button" className={data.adaptiveReaction===reaction?"pr-primary":"pr-ghost"} onClick={()=>setData(d=>({...d,adaptiveReaction:reaction}))}>{reaction==="resonates"?"Откликается":reaction==="partly"?"Отчасти":"Не похоже"}</button>)}</div>}{data.adaptiveReaction&&adaptive.phase==="reflection"&&<p className="pr-hint">Ваша реакция учтена. Вы можете изменить её: это исследование, а не тест с правильным ответом.</p>}<p className="pr-hint">Ответ сформирован на вашем устройстве по ограниченным правилам. Это не ИИ, диагноз или заключение о причинах ваших поступков.</p></section>}
        {completed&&<section className="pr-reflection"><h3>{localInterpretation.title}</h3><p>{localInterpretation.hypothesis}</p><p><strong>Вопрос для размышления:</strong> {localInterpretation.question}</p><p className="pr-hint"><strong>Другое возможное объяснение:</strong> {localInterpretation.alternative}</p><p className="pr-hint">Это локально выбранная гипотеза по ключевым словам, а не индивидуальный анализ нейросети.</p><label className="pr-label" htmlFor="pr-hypothesis-reaction">Ваша реакция</label><textarea id="pr-hypothesis-reaction" rows={3} value={data.hypothesisReaction||""} onChange={e=>setData(d=>({...d,hypothesisReaction:e.target.value}))} placeholder="Подходит, отчасти или совсем нет? Почему?"/></section>}
        {completed&&<details className="pr-reflection" aria-label="Углублённое исследование"><summary>Если вы готовы исследовать глубже — ещё пять вопросов</summary>
          <div className="pr-eyebrow">ПРОДОЛЖЕНИЕ ПРАКТИКИ · ГЛУБЖЕ В СВОЙ СЦЕНАРИЙ</div><p>Вы уже многое заметили о своей реакции. Следующие пять вопросов помогут исследовать, что стоит за привычным способом поступать, и найти небольшое изменение, которое вы могли бы попробовать в жизни. Можно продолжить сейчас или вернуться позже.</p>
          <h3>Что защищает ваш привычный способ поступать?</h3>
          <p className="pr-hint">Здесь важно не только увидеть, чего вы лишаетесь, но и понять, от чего привычная реакция вас оберегает. Это исследование, а не диагноз.</p>
          <h4>1. Что могло стать опасным?</h4>
          <p>Представьте, что вы произнесли своё желание вслух. Что именно в этом моменте кажется наиболее уязвимым: возможный отказ, чужое раздражение, ощущение зависимости, страх быть неудобным — или что-то другое?</p>
          <textarea rows={3} maxLength={2000} aria-label="Что могло стать опасным" value={data.depth?.protection||""} onChange={e=>setData(d=>({...d,depth:{...d.depth,protection:e.target.value}}))}/>
          <h4>2. Что вы получаете, когда уступаете?</h4>
          <p>Возникает ли хотя бы краткое облегчение? Например, вы избегаете конфликта или сохраняете ощущение контроля. Возможно, облегчения нет — это тоже важное наблюдение.</p>
          <textarea rows={3} maxLength={2000} aria-label="Облегчение от уступки" value={data.depth?.relief||""} onChange={e=>setData(d=>({...d,depth:{...d.depth,relief:e.target.value}}))}/>
          <h4>3. Какое чувство остаётся невысказанным?</h4>
          <p>Была ли там злость, обида, тоска, нежность, потребность в близости? Что было труднее всего позволить себе почувствовать или показать?</p>
          <textarea rows={3} maxLength={2000} aria-label="Невысказанное чувство" value={data.depth?.feeling||""} onChange={e=>setData(d=>({...d,depth:{...d.depth,feeling:e.target.value}}))}/>
          <h4>4. Какую цену вы платите?</h4>
          <p>Что вы сохраняете таким решением — и что постепенно теряете? Попробуйте удержать обе стороны, не обвиняя себя.</p>
          <textarea rows={3} maxLength={2000} aria-label="Цена защиты" value={data.depth?.cost||""} onChange={e=>setData(d=>({...d,depth:{...d.depth,cost:e.target.value}}))}/>
          <h4>5. Что могло бы стать маленьким изменением?</h4>
          <p>Как можно дать своему желанию немного больше места, не подвергая себя опасности? Иногда первый шаг — только заметить желание, не заставляя себя действовать.</p>
          <textarea rows={3} maxLength={2000} aria-label="Мой первый шаг к изменениям" value={data.depth?.next||""} onChange={e=>setData(d=>({...d,depth:{...d.depth,next:e.target.value}}))}/>
          <div className="pr-insight"><span>ВАША КАРТА ВНУТРЕННЕГО КОНФЛИКТА</span>
            <p><strong>Моё желание:</strong> {data.inquiry.wish}</p>
            <p><strong>Мой страх:</strong> {data.inquiry.fear}</p>
            {data.depth?.protection&&<p><strong>От чего защищаюсь:</strong> {data.depth.protection}</p>}
            {data.depth?.relief&&<p><strong>Что даёт мне защита:</strong> {data.depth.relief}</p>}
            {data.depth?.feeling&&<p><strong>Какое чувство остаётся без места:</strong> {data.depth.feeling}</p>}
            {data.depth?.cost&&<p><strong>Какую цену плачу:</strong> {data.depth.cost}</p>}
            {data.depth?.next&&<p><strong>Мой первый шаг к изменениям:</strong> {data.depth.next}</p>}
            <p className="pr-hint">Это ваши слова, а не заключение о личности. Проверьте, насколько такая связь соответствует вашему опыту.</p>
          </div>
        </details>}
        {completed&&<div className="pr-next-week">
          <div className="pr-eyebrow">СЛЕДУЮЩИЕ СЕМЬ ДНЕЙ</div>
          <h3>Пусть это открытие не останется только мыслью</h3>
          <p>Понимание иногда приходит раньше, чем меняется привычная реакция. Чтобы заметить, как она возникает в жизни, попробуйте в течение семи дней возвращаться к короткому дневнику. Не нужно специально спорить, отказывать или испытывать себя.</p>
          <p>Когда обнаружите знакомую ситуацию, запишите: чего вы хотели, что сделали, чего опасались и что произошло в действительности. Сравнивая записи, можно увидеть не только повторения, но и моменты, когда у вас уже получалось выбирать иначе.</p>
          <button className="pr-primary" type="button" onClick={()=>{chime();setTab("journal");window.scrollTo({top:0,behavior:"smooth"});}}>Начать семидневное наблюдение →</button>
        </div>}
        {!completed&&<p className="pr-hint">Для развёрнутой карты ответьте на все шесть вопросов в разделе «Исследование».</p>}
        <div className="pr-feedback-invite"><div className="pr-eyebrow">ПОСЛЕ ПРАКТИКИ</div><h3>Ваш взгляд может стать продолжением этой работы</h3><p>Что в этой встрече с собой оказалось важным? А что не откликнулось? Мне интересно услышать не только то, что понравилось, но и то, чего здесь не хватило. Это помогает делать практику глубже и точнее.</p><button className="pr-primary" onClick={()=>{recordFinish();chime();setTab("feedback");window.scrollTo({top:0,behavior:"smooth"});}}>Поделиться своим открытием →</button></div>
      </section>}
      {tab==="feedback"&&<section className="pr-panel">
        <div className="pr-sectionhead"><span>ВАШ ОПЫТ</span><span>НЕЗАВИСИМАЯ ОБРАТНАЯ СВЯЗЬ</span></div><h2>Что осталось с вами?</h2>
        <p className="pr-hint">Ваши слова важны. Можно поделиться тем, что открылось, или рассказать, почему практика не откликнулась. Здесь не нужны правильные ответы и вежливые похвалы.</p>
        <p className="pr-hint">Можно ответить «ничего». Критика важнее вежливых похвал.</p>
        <label className="pr-label" htmlFor="pr-insight">Какая мысль или чувство остались с вами после практики?</label><textarea id="pr-insight" rows={3} maxLength={2500} value={data.feedback} onChange={e=>setData(d=>({...d,feedback:e.target.value}))}/>
        <label className="pr-label" htmlFor="pr-usefulness">Насколько полезной оказалась практика?</label><select id="pr-usefulness" value={data.usefulness} onChange={e=>setData(d=>({...d,usefulness:e.target.value}))}><option value="">Выберите ответ</option><option value="new">Заметила(а) что-то новое</option><option value="organized">Помогла упорядочить известное</option><option value="little">Интересно, но мало пользы</option><option value="none">Не получила(а) пользы</option></select>
        <label className="pr-label" htmlFor="pr-criticism">Что было лишним, раздражающим или непонятным?</label><textarea id="pr-criticism" rows={3} maxLength={2500} value={data.criticism} onChange={e=>setData(d=>({...d,criticism:e.target.value}))}/>
        <label className="pr-check"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/> Разрешаю использовать мой отклик в обезличенном виде после отдельного согласования текста со мной. Это необязательно.</label>
        <p className="pr-hint">Ваши личные ответы на вопросы и записи дневника остаются только на устройстве. Если нажмёте «Отправить отклик», на сайт будут переданы только три поля обратной связи выше и ваше согласие или отказ на цитирование. Не включайте в отклик сведения, которые не хотите передавать.</p>
        <div className="pr-actions"><button className="pr-primary" onClick={exportData}>Скачать свои ответы</button></div>
        <label className="pr-check"><input type="checkbox" checked={feedbackConsent} onChange={e=>setFeedbackConsent(e.target.checked)}/> Согласна / согласен добровольно отправить этот отклик на сервер сайта для оценки качества практики. Личные записи дневника и ответы на вопросы не отправляются. Не включайте в отзыв сведения о здоровье, интимной жизни и других людях.</label>
        <div className="pr-actions"><button className="pr-primary" type="button" onClick={submitFeedback} disabled={feedbackSending||feedbackSent||!feedbackConsent||(!data.feedback.trim()&&!data.criticism.trim()&&!data.usefulness)}>{feedbackSent?"Отклик отправлен ✓":feedbackSending?"Отправляем…":"Отправить отклик на сайте →"}</button></div>
        <p className="pr-hint">Для записи на консультацию воспользуйтесь контактами на главной странице сайта.</p>
      </section>}
      {notice&&<p className="pr-notice" role="status">{notice}</p>}
      <footer className="pr-footer"><p>Материал предназначен для самостоятельного исследования, не является диагностикой или психотерапией. Не продолжайте, если вопросы усиливают тяжёлое состояние; при необходимости обратитесь за профессиональной поддержкой.</p><p>Личные ответы хранятся в браузере этого устройства, не передаются на сервер и могут быть доступны другим пользователям этого браузера. Не используйте общее устройство для конфиденциальных записей.</p><div className="pr-actions"><button className="pr-ghost" onClick={exportData}>Экспортировать записи</button><button className="pr-delete" onClick={()=>{if(window.confirm("Удалить все записи этой практики на данном устройстве?")){localStorage.removeItem(KEY);setData(initial);setStep(0);setTab("inquiry");setNotice("Локальные записи удалены.");}}}>Удалить мои записи</button></div></footer>
    </main>
  </div>;
}
