export type PracticeReaction = "resonates" | "partly" | "disagree";
export type PracticeInquiry = {scene:string;action:string;wish:string;fear:string;response:string;repeated:string};
export function adaptiveReflection(q:PracticeInquiry, reaction?:PracticeReaction) {
 const context=Object.values(q).join(" ").toLowerCase();
 const danger=["угроз","угрож","насили","ударил","избил","принуд","опасно","боюсь за жизнь"].some(x=>context.includes(x));
 if(danger) return {phase:"safety" as const,hypothesis:"Если в ситуации присутствовали угрозы или насилие, уступка могла быть способом защитить себя. Ответственность за угрозы несёт тот, кто их создаёт.",alternative:"В первую очередь важно учитывать реальную безопасность, а не искать бессознательную причину уступки.",question:"Что помогло бы вам сейчас чувствовать себя безопаснее?"};
 const spoke=/просил|просила|говорил|говорила|объяснял|объясняла/i.test(q.response);
 const hypothesis=spoke?"Вы уже пытались говорить о своём желании. Возможно, на ваше решение повлиял опыт реального ответа другого человека.":"Возможно, отказ от собственного желания помогал избежать неопределённости: как другой отреагирует, если вы скажете о важном для себя?";
 const alternative=spoke?"Причина может быть в поведении другого человека, а не только в ваших ожиданиях.":"Возможно, вы сознательно выбрали уступить, и это не обязательно повторяющийся сценарий.";
 if(!reaction)return {phase:"hypothesis" as const,hypothesis,alternative,question:"Что в этой версии откликается, а что не соответствует вашему опыту?"};
 return {phase:"reflection" as const,hypothesis:reaction==="disagree"?"Эта гипотеза не подошла. Не будем настаивать: по короткому описанию невозможно достоверно определить внутреннюю причину.":reaction==="partly"?"Похоже, эта гипотеза объясняет только часть ситуации. Важно оставить место и другим обстоятельствам.":"Это возможная версия, которую стоит проверить наблюдением, а не принимать за установленный факт.",alternative,question:"Что вы теперь замечаете в разнице между вашим желанием, действием и реальным ответом другого?"};
}
