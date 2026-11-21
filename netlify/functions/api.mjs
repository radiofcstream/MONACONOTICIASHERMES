import { getStore } from "@netlify/blobs";
import { createHmac, timingSafeEqual } from "node:crypto";

const store = getStore("monaco-radio-content");
const COOKIE = "monaco_admin";
const secret = () => process.env.SESSION_SECRET || "CHANGE-THIS-SESSION-SECRET-ON-NETLIFY";
const password = () => process.env.ADMIN_PASSWORD || "Monaco2028";

function sign(value) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}
function validCookie(req) {
  const raw = req.headers.get("cookie") || "";
  const token = raw.split(";").map(x=>x.trim()).find(x=>x.startsWith(COOKIE+"="))?.slice(COOKIE.length+1);
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = sign(payload);
  try {
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
    const data = JSON.parse(Buffer.from(payload,"base64url").toString());
    return data.exp > Date.now();
  } catch { return false; }
}
const headers = { "content-type":"application/json; charset=utf-8", "cache-control":"no-store" };
const reply = (data,status=200,extra={}) => new Response(JSON.stringify(data),{status,headers:{...headers,...extra}});
const defaultData = { news: [], programs: [] };
async function readData() { return await store.get("site-data",{type:"json"}) || defaultData; }
async function saveData(data) { await store.setJSON("site-data",data); }

export default async (req) => {
  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/api\/?/,"");
  if (req.method==="OPTIONS") return new Response(null,{status:204,headers:{
    "Access-Control-Allow-Origin":url.origin,"Access-Control-Allow-Methods":"GET,POST,OPTIONS",
    "Access-Control-Allow-Headers":"Content-Type","Access-Control-Allow-Credentials":"true"
  }});
  if (path==="login" && req.method==="POST") {
    const body = await req.json().catch(()=>({}));
    if (body.password !== password()) return reply({error:"Contraseña incorrecta"},401);
    const payload = Buffer.from(JSON.stringify({exp:Date.now()+8*60*60*1000})).toString("base64url");
    const token = payload+"."+sign(payload);
    return reply({ok:true},200, { "set-cookie":`${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800` });
  }
  if (path==="logout" && req.method==="POST") {
    return reply({ok:true},200,{"set-cookie":`${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`});
  }
  if (path==="data" && req.method==="GET") return reply(await readData());
  if (path==="data" && req.method==="POST") {
    if (!validCookie(req)) return reply({error:"No autorizado"},401);
    const body = await req.json().catch(()=>null);
    if (!body || !Array.isArray(body.news) || !Array.isArray(body.programs)) return reply({error:"Datos inválidos"},400);
    await saveData({news:body.news.slice(0,300),programs:body.programs.slice(0,100)});
    return reply({ok:true});
  }
  if (path==="session" && req.method==="GET") return reply({authenticated:validCookie(req)});
  return reply({error:"Ruta no encontrada"},404);
};

export const config = { path: ["/api/*"] };
