import test from "node:test";
import assert from "node:assert/strict";
import { handleAIRequest } from "./practice-ai-service.mjs";
import { buildPracticeRequest } from "./practice-ai-request.mjs";
const inquiry = {scene:"Вечером партнёр ушёл",action:"Сказала, что всё хорошо",wish:"Хотела провести вечер вместе",fear:"Боялась отказа"};
test("AI is disabled by default and never calls provider", async () => {
  let calls = 0;
  const result = await handleAIRequest({inquiry,aiConsent:true,adultConfirmed:true},{},async()=>{calls++;});
  assert.equal(result.status,503);
  assert.equal(calls,0);
});
test("no consent means no provider call", async () => {
  let calls = 0;
  const result = await handleAIRequest({inquiry,aiConsent:false,adultConfirmed:true},{PRACTICE_AI_ENABLED:"true",OPENROUTER_API_KEY:"test"},async()=>{calls++;});
  assert.equal(result.status,400);
  assert.equal(calls,0);
});
test("request enforces privacy routing", () => {
  const request = buildPracticeRequest(inquiry,"test-model");
  assert.deepEqual(request.provider,{zdr:true,data_collection:"deny",allow_fallbacks:false});
});
test("mock response works without paid API",async()=>{
  let calls=0;
  const result=await handleAIRequest({inquiry,aiConsent:true,adultConfirmed:true},{PRACTICE_AI_ENABLED:"true",OPENROUTER_API_KEY:"test",PRACTICE_AI_MODEL:"test-model"},async()=>{calls++;return {ok:true,json:async()=>({choices:[{message:{content:"Возможно, вы промолчали, чтобы не рисковать отказом. Как вам эта мысль?"}}]})};});
  assert.equal(result.status,200);
  assert.equal(calls,1);
});
