// Offline self-reflection prototype. No external AI requests.
export function practiceDialogue(q, reaction = null) {
  if (!q || typeof q !== "object" || Array.isArray(q)) return { ok:false, reason:"invalid_input" };
  const scene = String(q.scene || "").trim(), wish = String(q.wish || "").trim(), action = String(q.action || "").trim();
  if (!scene || !wish || !action) return { ok:false, reason:"missing_answers" };
  const context = [scene,action,wish,q.fear,q.response].join(" ").toLowerCase();
  if (["угроз","угрож","насили","ударил","избил","принуд","опасно","боюсь за жизнь"].some(x=>context.includes(x)))
    return { ok:true, phase:"safety", hypothesis:"Молчание или уступка могли помогать сохранять безопасность. Здесь не следует искать вашу вину.", question:"Что помогло бы вам сейчас быть в большей безопасности?" };
  const asked = ["просила","просил","говорила","говорил","объясняла","объяснял"].some(x=>String(q.response||"").toLowerCase().includes(x));
  const hypothesis = asked ? "Вы уже пытались говорить о желаниях. Возможно, ваше молчание теперь связано с опытом ответа другого, а не только со страхом отказа." : "Возможно, молчание позволяло не проверять отношение другого к вашему желанию. Но это мог быть и осознанный выбор.";
  const alternative = asked ? "Возможно, трудность связана с реальным поведением другого человека." : "Возможно, уступка была свободным решением или прямой разговор был небезопасен.";
  if (reaction === null) return {ok:true,phase:"hypothesis",hypothesis,alternative,question:"Что в этой версии подходит, а что нет?",choices:["resonates","partly","disagree"]};
  if (!["resonates","partly","disagree"].includes(reaction)) return {ok:false,reason:"invalid_reaction"};
  const revised = reaction==="disagree" ? "Первую версию стоит отложить. Из этих ответов нельзя надёжно установить причину поступка." : reaction==="partly" ? "Эта версия может объяснять лишь часть происходившего; стоит учесть реальные обстоятельства." : "Это полезная для наблюдения версия, но не установленная причина.";
  return {ok:true,phase:"reflection",hypothesis:revised,alternative,question:"Что вы хотели бы заметить в похожей ситуации?",map:{scene,wish,action,sevenDays:"В течение недели при желании отметьте один похожий эпизод: желание, действие, ожидание и реальный ответ. Не создавайте конфликт специально."}};
}
