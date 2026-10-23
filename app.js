import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.2/+esm";
const $=s=>document.querySelector(s),app=$("#app"),sheet=$("#sheet"),sh=$("#sh");
const MEALS=["Desayuno","Comida","Merienda","Cena","Snack"],GOALS={d:"Déficit",m:"Mantenimiento",v:"Ganar músculo"};
const ACT=[["1.2","Sedentario","Trabajo de oficina, poco movimiento"],["1.375","Ligero","Ejercicio 1-3 días/semana"],["1.55","Moderado","Ejercicio 3-5 días/semana"],["1.725","Alto","Ejercicio 6-7 días/semana"],["1.9","Muy alto","Entreno intenso o trabajo físico"]];
const GOAL_DESC={d:"Perder grasa · −20 % kcal",m:"Mantener tu peso actual",v:"Ganar masa muscular · +10 % kcal"};
const sb=createClient(CLOUD_CONFIG.url,CLOUD_CONFIG.key,{auth:{persistSession:true,detectSessionInUrl:true}});
let S={log:{},custom:[]},user=null,ready=false,recovery=false,loadedDays=new Set(),ob=null,authMode="up";
const pd=d=>new Date(d+"T12:00"),today=()=>new Date().toLocaleDateString("sv"),shift=(d,n)=>{const x=pd(d);x.setDate(x.getDate()+n);return x.toLocaleDateString("sv")};
let day=today(),view="hoy",store="T",ideaT="comida",ideaG=null,lastMeal=null;
const r0=n=>Math.round(n),r1=n=>Math.round(n*10)/10;
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const defMeal=()=>{const h=new Date().getHours();return h<11?"Desayuno":h<16?"Comida":h<19?"Merienda":h<23?"Cena":"Snack"};
const SPLASH=`<div class="splash"><img src="icon.svg" width="72" height="72" alt=""><div class="spin"></div></div>`;
const toast=t=>{let el=$("#toast");if(!el){el=document.createElement("div");el.id="toast";document.body.append(el)}el.textContent=t;el.classList.add("on");clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove("on"),3200)};

/* ---------- Datos (Supabase) ---------- */
const fromRow=r=>({id:r.id,n:r.name,g:r.grams==null?null:+r.grams,k:+r.kcal,p:+r.protein,c:+r.carbs,f:+r.fat,meal:r.meal,ai:r.ai});
const toRow=(e,d)=>({day:d,meal:e.meal,name:e.n,grams:e.g||null,kcal:+e.k||0,protein:+e.p||0,carbs:+e.c||0,fat:+e.f||0,ai:!!e.ai});
async function loadProfile(){
  const {data,error}=await sb.from("profiles").select("*").eq("user_id",user.id).maybeSingle();
  if(error)throw error;
  S={log:{},custom:data?.custom_foods||[],profile:data?.profile||null,name:data?.name||user.user_metadata?.name||"",...(data?.settings||{})};
  loadedDays=new Set();
}
async function saveProfile(){
  const {key,gkey,ai}=S;
  const {error}=await sb.from("profiles").upsert({user_id:user.id,name:S.name||null,profile:S.profile,settings:{key,gkey,ai},custom_foods:S.custom,updated_at:new Date().toISOString()});
  if(error){console.error(error);toast("No se pudo guardar. Revisa tu conexión.")}
  return !error;
}
const weekOf=d=>[...Array(7)].map((_,i)=>shift(d,i-6));
async function ensureDays(d){
  const days=weekOf(d);
  const {data,error}=await sb.from("entries").select("*").eq("user_id",user.id).gte("day",days[0]).lte("day",days[6]).order("created_at");
  if(error){console.error(error);return false}
  days.forEach(x=>{S.log[x]=[];loadedDays.add(x)});
  data.forEach(r=>S.log[r.day].push(fromRow(r)));
  return true;
}
async function addEntries(list){
  const d=day,tmp=list.map(e=>({...e,meal:e.meal||lastMeal||defMeal(),id:"tmp"+Math.random()}));
  (S.log[d]??=[]).push(...tmp);
  const {data,error}=await sb.from("entries").insert(tmp.map(e=>toRow(e,d))).select("id");
  if(error){console.error(error);S.log[d]=S.log[d].filter(e=>!tmp.includes(e));toast("No se pudo guardar. Revisa tu conexión.")}
  else tmp.forEach((e,i)=>e.id=data[i].id);
  if(view==="hoy"&&!sheet.classList.contains("on"))render();
}
const addEntry=e=>addEntries([e]);

function targets(p=S.profile){
  const b=10*p.w+6.25*p.h-5*p.a+(p.s==="h"?5:-161),tdee=b*p.act,k=r0(tdee*({d:.8,m:1,v:1.1}[p.goal]));
  const P=r0(p.w*({d:1.5,m:1.2,v:2.2}[p.goal])),F=r0(p.w*({d:.7,m:.9,v:.9}[p.goal])),C=Math.max(0,r0((k-P*4-F*9)/4));
  return p.manual?{k:+p.mk,p:+p.mp,c:+p.mc,f:+p.mf}:{k,p:P,c:C,f:F};
}
const tot=d=>(S.log[d]||[]).reduce((a,e)=>({k:a.k+e.k,p:a.p+e.p,c:a.c+e.c,f:a.f+e.f}),{k:0,p:0,c:0,f:0});

function nav(v){view=v;document.querySelectorAll("nav button").forEach(b=>b.classList.toggle("on",b.dataset.v===v));render();scrollTo(0,0)}
$("#nav").onclick=e=>{const v=e.target.closest("button")?.dataset.v;if(!v)return;if(v==="foto")return $("#cam").click();if(S.profile)nav(v)};

function render(){
  $("#nav").style.display=ready&&user&&S.profile&&!recovery?"flex":"none";
  if(!ready)return app.innerHTML=SPLASH;
  if(recovery)return newPassword();
  if(!user)return authView();
  if(!S.profile)return onboarding();
  ({hoy,buscar,ideas,perfil})[view]();
}

/* ---------- Registro / acceso ---------- */
const AUTH_ERR={invalid_credentials:"Email o contraseña incorrectos",weak_password:"La contraseña debe tener al menos 6 caracteres",validation_failed:"Revisa el email",email_address_invalid:"Email no válido",email_not_confirmed:"Confirma tu email antes de entrar (revisa tu bandeja)",user_already_exists:"Ya existe una cuenta con ese email. Entra con tu contraseña.",over_email_send_rate_limit:"Demasiados intentos, espera un poco",over_request_rate_limit:"Demasiados intentos, espera un poco",same_password:"La nueva contraseña debe ser distinta"};
const authErr=e=>AUTH_ERR[e?.code]||e?.message||"Algo ha fallado";
function authView(msg="",ok=false){
  const up=authMode==="up";
  app.innerHTML=`<div class="auth"><img src="icon.svg" width="64" height="64" alt="" class="logo">
  <h1>${up?"Empieza a controlar<br>tus macros":"Hola de nuevo"}</h1>
  <p class="mu">${up?"Crea tu cuenta gratis. Tus datos se guardan de forma segura y los tendrás en cualquier dispositivo.":"Entra para ver tu progreso."}</p>
  <div class="seg" id="seg"><button class="${up?"on":""}" data-m="up">Crear cuenta</button><button class="${up?"":"on"}" data-m="in">Entrar</button></div>
  <form id="af">${up?`<input id="aname" placeholder="Tu nombre" autocomplete="given-name">`:""}
  <input id="ae" type="email" placeholder="Email" autocomplete="email" required>
  <input id="ap" type="password" placeholder="Contraseña (mín. 6 caracteres)" minlength="6" autocomplete="${up?"new-password":"current-password"}" required>
  <button class="btn" id="as" type="submit">${up?"Crear cuenta":"Entrar"}</button></form>
  <div class="or"><span>o</span></div>
  <button class="btn g" id="ag"><svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>Continuar con Google</button>
  ${up?"":`<button class="link" id="arst">¿Olvidaste tu contraseña?</button>`}
  <p class="msg ${ok?"ok":""}" id="amsg">${esc(msg)}</p></div>`;
  const say=(t,good)=>{$("#amsg").textContent=t;$("#amsg").classList.toggle("ok",!!good)};
  $("#seg").onclick=e=>{const b=e.target.closest("button");if(b){authMode=b.dataset.m;authView()}};
  $("#af").onsubmit=async e=>{
    e.preventDefault();const email=$("#ae").value.trim(),password=$("#ap").value,btn=$("#as");
    btn.disabled=true;btn.innerHTML=`<div class="spin"></div>`;
    if(up){
      const name=$("#aname").value.trim();
      const {data,error}=await sb.auth.signUp({email,password,options:{data:{name},emailRedirectTo:location.origin}});
      if(error){btn.disabled=false;btn.textContent="Crear cuenta";return say(authErr(error))}
      if(!data.session){
        if(!data.user?.identities?.length){authMode="in";return authView(AUTH_ERR.user_already_exists)}
        return checkEmail(email);
      }
    }else{
      const {error}=await sb.auth.signInWithPassword({email,password});
      if(error){btn.disabled=false;btn.textContent="Entrar";return say(authErr(error))}
    }
  };
  $("#ag").onclick=async()=>{const {error}=await sb.auth.signInWithOAuth({provider:"google",options:{redirectTo:location.origin}});if(error)say(authErr(error))};
  $("#arst")&&($("#arst").onclick=async()=>{const email=$("#ae").value.trim();if(!email)return say("Escribe tu email arriba");
    const {error}=await sb.auth.resetPasswordForEmail(email,{redirectTo:location.origin});say(error?authErr(error):"Te hemos enviado un email para cambiar la contraseña",!error)});
}
function checkEmail(email){
  app.innerHTML=`<div class="auth center"><div class="bigicon">✉</div><h1>Revisa tu email</h1>
  <p class="mu">Hemos enviado un enlace de confirmación a <b>${esc(email)}</b>. Ábrelo desde este móvil para activar tu cuenta.</p>
  <button class="btn" id="cb">Ya lo he confirmado</button><button class="link" id="rs">Reenviar email</button><p class="msg" id="amsg"></p></div>`;
  $("#cb").onclick=()=>{authMode="in";authView()};
  $("#rs").onclick=async()=>{const {error}=await sb.auth.resend({type:"signup",email,options:{emailRedirectTo:location.origin}});$("#amsg").textContent=error?authErr(error):"Email reenviado"};
}
function newPassword(){
  app.innerHTML=`<div class="auth"><h1>Nueva contraseña</h1><p class="mu">Elige una contraseña nueva para tu cuenta.</p>
  <form id="np"><input id="pw" type="password" minlength="6" placeholder="Nueva contraseña" autocomplete="new-password" required><button class="btn" type="submit">Guardar</button></form><p class="msg" id="amsg"></p></div>`;
  $("#np").onsubmit=async e=>{e.preventDefault();const {error}=await sb.auth.updateUser({password:$("#pw").value});
    if(error)return $("#amsg").textContent=authErr(error);recovery=false;toast("Contraseña actualizada");render()};
}

/* ---------- Onboarding ---------- */
function onboarding(){
  if(!ob){let old=null;try{old=JSON.parse(localStorage.mf||"null")}catch{}
    ob={step:0,name:S.name||"",s:"m",a:30,h:165,w:65,act:1.375,goal:"d",...(old?.profile||{}),old};}
  const o=ob,N=6,opt=(v,cur,t,d)=>`<button class="opt ${cur==v?"on":""}" data-v="${v}"><b>${t}</b>${d?`<span>${d}</span>`:""}</button>`;
  const steps=[
    ["¿Cómo te llamas?","Así personalizamos tu experiencia.",`<input id="ov" value="${esc(o.name)}" placeholder="Tu nombre" autocomplete="given-name">`],
    ["¿Cuál es tu sexo?","Lo necesitamos para calcular tu metabolismo basal.",`<div class="opts">${opt("m",o.s,"Mujer")}${opt("h",o.s,"Hombre")}</div>`],
    ["Cuéntanos sobre ti","Edad, altura y peso actual.",`<label>Edad</label><input id="oa" type="number" inputmode="numeric" value="${o.a}"><label>Altura (cm)</label><input id="oh" type="number" inputmode="numeric" value="${o.h}"><label>Peso (kg)</label><input id="ow" type="number" inputmode="decimal" step="0.1" value="${o.w}">`],
    ["¿Cuánto te mueves?","Incluye trabajo y entrenamiento.",`<div class="opts">${ACT.map(([v,t,d])=>opt(v,o.act,t,d)).join("")}</div>`],
    ["¿Cuál es tu objetivo?","Ajustaremos calorías y proteína.",`<div class="opts">${Object.entries(GOALS).map(([v,t])=>opt(v,o.goal,t,GOAL_DESC[v])).join("")}</div>`],
  ];
  if(o.step<5){
    const [t,d,body]=steps[o.step];
    app.innerHTML=`<div class="ob"><div class="top">${o.step?`<button class="ib" id="bk">‹</button>`:`<span></span>`}<span class="mu">${o.step+1} / ${N}</span><span style="width:44px"></span></div>
    <div class="prog"><i style="width:${(o.step+1)/N*100}%"></i></div><h1>${t}</h1><p class="mu">${d}</p>${body}<button class="btn" id="nx">Continuar</button></div>`;
    app.querySelectorAll(".opt").forEach(b=>b.onclick=()=>{app.querySelectorAll(".opt").forEach(x=>x.classList.toggle("on",x===b))});
  }else{
    const t=targets({s:o.s,a:o.a,h:o.h,w:o.w,act:o.act,goal:o.goal});
    app.innerHTML=`<div class="ob"><div class="top"><button class="ib" id="bk">‹</button><span class="mu">6 / 6</span><span style="width:44px"></span></div>
    <div class="prog"><i style="width:100%"></i></div><h1>${o.name?esc(o.name)+", este":"Este"} es<br>tu plan</h1><p class="mu">Objetivo: ${GOALS[o.goal].toLowerCase()}. Puedes cambiarlo cuando quieras en Perfil.</p>
    <div class="card lime" style="text-align:center"><div class="mu">Calorías diarias</div><div class="big" style="font-size:56px">${t.k}</div><div class="mu">kcal</div></div>
    <div class="grid" style="grid-template-columns:1fr 1fr 1fr">${[["Proteína",t.p,"var(--p)"],["Carbos",t.c,"var(--c)"],["Grasa",t.f,"var(--f)"]].map(([n,v,c])=>`<div class="card" style="text-align:center;margin:0;padding:14px"><i class="dot" style="background:${c}"></i><div class="mu">${n}</div><b style="font-size:22px">${v} g</b></div>`).join("")}</div>
    ${o.old?.log?`<p class="mu">También subiremos a tu cuenta los registros que tenías en este móvil.</p>`:""}
    <button class="btn" id="nx" style="margin-top:16px">Empezar</button></div>`;
  }
  $("#bk")&&($("#bk").onclick=()=>{o.step--;onboarding()});
  $("#nx").onclick=async()=>{
    const sel=app.querySelector(".opt.on")?.dataset.v;
    if(o.step===0){o.name=$("#ov").value.trim();if(!o.name)return toast("Escribe tu nombre")}
    if(o.step===1)o.s=sel;
    if(o.step===2){o.a=+$("#oa").value;o.h=+$("#oh").value;o.w=+$("#ow").value;if(!(o.a>10&&o.h>100&&o.w>25))return toast("Revisa tus datos")}
    if(o.step===3)o.act=+sel;
    if(o.step===4)o.goal=sel;
    if(o.step<5){o.step++;scrollTo(0,0);return onboarding()}
    const b=$("#nx");b.disabled=true;b.innerHTML=`<div class="spin"></div>`;
    S.name=o.name;S.profile={s:o.s,a:o.a,h:o.h,w:o.w,act:o.act,goal:o.goal};
    if(o.old){S.custom=o.old.custom||[];S.ai=o.old.ai;S.gkey=o.old.gkey;S.key=o.old.key}
    if(!await saveProfile()){S.profile=null;b.disabled=false;b.textContent="Reintentar";return}
    const del=new Set(o.old?.deleted||[]),rows=Object.entries(o.old?.log||{}).flatMap(([d,es])=>es.filter(e=>!del.has(e.id)).map(e=>toRow(e,d)));
    if(rows.length){const {error}=await sb.from("entries").insert(rows);if(error)toast("No se pudieron subir los registros antiguos")}
    localStorage.removeItem("mf");ob=null;loadedDays=new Set();nav("hoy");
  };
}

/* ---------- Perfil ---------- */
function profileForm(p){
  return `<div class="card"><label>Sexo</label><div class="chips" id="fs">${[["m","Mujer"],["h","Hombre"]].map(([v,t])=>`<button class="chip ${p.s===v?"on":""}" data-v="${v}">${t}</button>`).join("")}</div>
  <div class="grid"><div><label>Edad</label><input id="fa" type="number" value="${p.a}"></div><div><label>Altura (cm)</label><input id="fh" type="number" value="${p.h}"></div></div>
  <label>Peso (kg)</label><input id="fw" type="number" step="0.1" value="${p.w}">
  <label>Actividad</label><select id="fact">${ACT.map(([v,t])=>`<option value="${v}" ${+p.act==+v?"selected":""}>${t}</option>`).join("")}</select>
  <label>Objetivo</label><div class="chips" id="fg">${Object.entries(GOALS).map(([v,t])=>`<button class="chip ${p.goal===v?"on":""}" data-v="${v}">${t}</button>`).join("")}</div></div>`;
}
function bindChips(id){$(id).onclick=e=>{const b=e.target.closest(".chip");if(!b)return;$(id).querySelectorAll(".chip").forEach(x=>x.classList.toggle("on",x===b))}}
function readProfile(){const v=id=>$(id+" .on").dataset.v;return{...S.profile,s:v("#fs"),goal:v("#fg"),a:+$("#fa").value,h:+$("#fh").value,w:+$("#fw").value,act:+$("#fact").value}}
function perfil(){
  const p=S.profile,t=targets();
  app.innerHTML=`<h1>Perfil</h1>
  <div class="card row" style="margin:12px 0"><div class="ic">${esc((S.name||user.email||"?")[0].toUpperCase())}</div><div class="t"><b>${esc(S.name||"Tu cuenta")}</b><span class="mu">${esc(user.email||"")}</span></div><button class="chip" id="lo">Salir</button></div>
  <label>Nombre</label><input id="pn" value="${esc(S.name||"")}">
  ${profileForm(p)}
  <div class="card"><label><input type="checkbox" id="man" ${p.manual?"checked":""} style="width:auto"> Objetivos manuales</label>
  <div class="grid"><div><label>kcal</label><input id="mk" type="number" value="${p.mk||t.k}"></div><div><label>Proteína g</label><input id="mp" type="number" value="${p.mp||t.p}"></div><div><label>Carbs g</label><input id="mc" type="number" value="${p.mc||t.c}"></div><div><label>Grasa g</label><input id="mf" type="number" value="${p.mf||t.f}"></div></div></div>
  <div class="card"><b>IA de fotos</b><div class="chips" id="ai">${[["g","Gemini (gratis)"],["c","Claude"]].map(([v,t])=>`<button class="chip ${(S.ai||"g")===v?"on":""}" data-v="${v}">${t}</button>`).join("")}</div>
  <p class="mu">Gemini: crea tu clave gratis en aistudio.google.com → "Get API key".</p><input id="gkey" type="password" placeholder="Clave Gemini (AIza...)" value="${esc(S.gkey||"")}">
  <p class="mu">Claude: opcional, de pago.</p><input id="key" type="password" placeholder="sk-ant-..." value="${esc(S.key||"")}"></div>
  <button class="btn" id="sv">Guardar</button>
  <div class="grid" style="margin-top:12px"><button class="btn g" id="ex">Exportar datos</button><button class="btn g" id="rs">Borrar mis datos</button></div>`;
  bindChips("#fs");bindChips("#fg");bindChips("#ai");
  $("#lo").onclick=()=>sb.auth.signOut();
  $("#sv").onclick=async()=>{const b=$("#sv");b.disabled=true;
    S.name=$("#pn").value.trim();S.profile={...readProfile(),manual:$("#man").checked,mk:$("#mk").value,mp:$("#mp").value,mc:$("#mc").value,mf:$("#mf").value};S.key=$("#key").value.trim();S.gkey=$("#gkey").value.trim();S.ai=$("#ai .on").dataset.v;
    if(await saveProfile()){toast("Guardado");nav("hoy")}else b.disabled=false};
  $("#ex").onclick=async()=>{const {data,error}=await sb.from("entries").select("day,meal,name,grams,kcal,protein,carbs,fat").eq("user_id",user.id).order("day");if(error)return toast("No se pudo exportar");
    const {key,gkey,...rest}=S,a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify({...rest,log:undefined,entries:data},null,1)],{type:"application/json"}));a.download="macrofit.json";a.click()};
  $("#rs").onclick=async()=>{if(!confirm("¿Borrar todos tus registros y tu perfil? No se puede deshacer."))return;
    const a=await sb.from("entries").delete().eq("user_id",user.id),b=await sb.from("profiles").delete().eq("user_id",user.id);
    if(a.error||b.error)return toast("No se pudo borrar");S={log:{},custom:[],name:S.name};loadedDays=new Set();render()};
}

/* ---------- Hoy ---------- */
function hoy(){
  if(weekOf(day).some(x=>!loadedDays.has(x))){app.innerHTML=SPLASH;ensureDays(day).then(ok=>{if(view!=="hoy")return;ok?render():app.innerHTML=`<p class="empty">Sin conexión.</p><button class="btn" id="rt">Reintentar</button>`,$("#rt")&&($("#rt").onclick=render)});return}
  const t=targets(),s=tot(day),left=t.k-s.k,pc=Math.min(1,s.k/t.k),R=100,L=2*Math.PI*R;
  const d=pd(day),isT=day===today();
  const mb=(n,v,g,col)=>`<div><div class="mac"><span><i class="dot" style="background:${col}"></i>${n}</span></div><b>${r0(v)}</b><span class="mu"> / ${g} g</span><div class="bar"><i style="width:${Math.min(100,v/g*100)}%;background:${col}"></i></div></div>`;
  const wk=weekOf(day).map(k=>{const x=pd(k),v=tot(k).k;return`<div><i style="height:${Math.max(6,Math.min(90,v/t.k*80))}px;${k===day?"background:var(--lime)":v>t.k*1.05?"background:#ff8a6b":""}"></i>${"DLMXJVS"[x.getDay()]}</div>`}).join("");
  app.innerHTML=`<div class="top"><button class="ib" id="pv">‹</button><div style="text-align:center"><b>${isT?"Hoy":d.toLocaleDateString("es",{weekday:"long"})}</b><div class="mu">${d.toLocaleDateString("es",{day:"numeric",month:"long"})}</div></div><button class="ib" id="nx" ${isT?"style=opacity:.3":""}>›</button></div>
  <h1>Hola${S.name?", "+esc(S.name):""}</h1><p class="mu">Objetivo: ${GOALS[S.profile.goal].toLowerCase()}</p>
  <div class="ring"><svg width="230" height="230" viewBox="0 0 230 230"><circle cx="115" cy="115" r="${R}" stroke="#23261f" stroke-width="18" fill="none"/><circle cx="115" cy="115" r="${R}" stroke="${left<0?"#ff8a6b":"#d6f74a"}" stroke-width="18" fill="none" stroke-linecap="round" stroke-dasharray="${L}" stroke-dashoffset="${L*(1-pc)}"/></svg>
  <div class="in"><div class="big">${Math.abs(r0(left))}</div><div class="mu">${left<0?"kcal de más":"kcal restantes"}</div><div class="mu" style="margin-top:6px">${r0(s.k)} / ${t.k}</div></div></div>
  <div class="card grid" style="grid-template-columns:1fr 1fr 1fr">${mb("Prot",s.p,t.p,"var(--p)")}${mb("Carbs",s.c,t.c,"var(--c)")}${mb("Grasa",s.f,t.f,"var(--f)")}</div>
  ${MEALS.map(m=>{const es=(S.log[day]||[]).filter(e=>e.meal===m);const k=es.reduce((a,e)=>a+e.k,0);
    return`<h2 style="display:flex;justify-content:space-between">${m}<span class="mu">${r0(k)} kcal</span></h2>${es.map(e=>`<div class="row" data-id="${e.id}"><div class="ic">${e.ai?"◎":"●"}</div><div class="t"><b>${esc(e.n)}</b><span class="mu">${e.g?r0(e.g)+" g · ":""}P ${r1(e.p)} · C ${r1(e.c)} · G ${r1(e.f)}</span></div><div class="k">${r0(e.k)}</div></div>`).join("")||`<button class="row add" data-m="${m}" style="width:100%;color:var(--mu);font:600 14px Manrope"><div class="ic">+</div>Añadir</button>`}`}).join("")}
  <h2>Últimos 7 días</h2><div class="card"><div class="week">${wk}</div></div>`;
  const mv=n=>{const x=shift(day,n);if(x<=today()){day=x;render()}};
  $("#pv").onclick=()=>mv(-1);$("#nx").onclick=()=>mv(1);
  app.querySelectorAll(".row[data-id]").forEach(r=>r.onclick=()=>editEntry(r.dataset.id));
  app.querySelectorAll(".add").forEach(b=>b.onclick=()=>{lastMeal=b.dataset.m;nav("buscar")});
}
function editEntry(id){
  const e=S.log[day].find(x=>x.id===id),per=e.g?{k:e.k/e.g,p:e.p/e.g,c:e.c/e.g,f:e.f/e.g}:null;
  open(`<h2>${esc(e.n)}</h2>${per?`<label>Gramos</label><input id="eg" type="number" value="${r0(e.g)}">`:""}<label>Comida</label>${mealSel(e.meal)}
  <div class="grid" style="margin-top:12px"><button class="btn g" id="del">Eliminar</button><button class="btn" id="ok">Guardar</button></div>`);
  $("#del").onclick=async()=>{close();const d=day;S.log[d]=S.log[d].filter(x=>x!==e);render();
    const {error}=await sb.from("entries").delete().eq("id",e.id);if(error){toast("No se pudo eliminar");S.log[d].push(e);render()}};
  $("#ok").onclick=async()=>{if(per){const g=+$("#eg").value;Object.assign(e,{g,k:per.k*g,p:per.p*g,c:per.c*g,f:per.f*g})}e.meal=$("#ms").value;close();render();
    const {error}=await sb.from("entries").update(toRow(e,day)).eq("id",e.id);if(error)toast("No se pudo guardar el cambio")};
}
const mealSel=m=>`<select id="ms">${MEALS.map(x=>`<option ${x===(m||lastMeal||defMeal())?"selected":""}>${x}</option>`).join("")}</select>`;

/* ---------- Sheet ---------- */
function open(h){sh.innerHTML=h;sheet.classList.add("on")}
function close(){sheet.classList.remove("on");stopScan()}
sheet.onclick=e=>{if(e.target===sheet)close()};

/* ---------- Buscar ---------- */
const BRAND_M=/hacendado|mercadona|deliplus|bosque verde/i,BRAND_L=/milbona|alesto|crownfield|nixe|dulano|vemondo|freshona|golden sun|combino|chef select|snack day|crivit|italiamo|lidl|deluxe|pilos|solevita|cien|rustikal|primadonna|fin carr/i;
let off=[];
function buscar(){
  app.innerHTML=`<h1>Añadir<br>alimento</h1><input id="q" placeholder="Buscar: pollo, skyr, avena…" autocomplete="off">
  <div class="chips" id="st">${[["T","Todos"],["M","Mercadona"],["L","Lidl"],["C","Mis alimentos"]].map(([v,t])=>`<button class="chip ${store===v?"on":""}" data-v="${v}">${t}</button>`).join("")}</div>
  <div class="grid" style="margin:8px 0"><button class="btn g" id="bc">▥ Código barras</button><button class="btn g" id="mn">＋ Manual</button></div>
  <div id="res"></div>`;
  const q=$("#q");q.oninput=list;
  $("#st").onclick=e=>{const b=e.target.closest(".chip");if(b){store=b.dataset.v;$("#st").querySelectorAll(".chip").forEach(x=>x.classList.toggle("on",x===b));list()}};
  $("#bc").onclick=scan;$("#mn").onclick=manual;list();
}
function list(){
  const q=$("#q").value.trim().toLowerCase().normalize("NFD").replace(/\p{M}/gu,""),all=[...S.custom.map(x=>({...x,s:"C"})),...FOODS];
  const norm=s=>s.toLowerCase().normalize("NFD").replace(/\p{M}/gu,"");
  let r=all.filter(f=>(store==="T"||f.s===store)&&q.split(/\s+/).every(w=>norm(f.n).includes(w))).slice(0,60);
  $("#res").innerHTML=r.map((f,i)=>row(f,i)).join("")+(q.length>2?`<button class="btn g" id="offb" style="margin-top:8px">Buscar "${esc(q)}" en más productos (Open Food Facts)</button><div id="offr"></div>`:"")||`<p class="empty">Sin resultados</p>`;
  $("#res").querySelectorAll(".row").forEach(el=>el.onclick=()=>pick(r[el.dataset.i]));
  if($("#offb"))$("#offb").onclick=()=>offSearch(q);
}
const row=(f,i)=>`<div class="row" data-i="${i}"><div class="ic">●</div><div class="t"><b>${esc(f.n)}</b><span class="mu">${f.p} P · ${f.c} C · ${f.f} G /100g</span></div><div class="k">${r0(f.k)}<div class="tag ${f.s}">${{M:"Mercadona",L:"Lidl",C:"Mío",G:"Genérico",O:"OFF"}[f.s]}</div></div></div>`;
const offMap=p=>{const n=p.nutriments||{},b=p.brands||"";return{n:`${p.product_name||"Producto"}${b?" · "+b.split(",")[0]:""}`,s:BRAND_M.test(b)?"M":BRAND_L.test(b)?"L":"O",k:r1(n["energy-kcal_100g"]??(n.energy_100g||0)/4.184),p:r1(n.proteins_100g||0),c:r1(n.carbohydrates_100g||0),f:r1(n.fat_100g||0),g:+p.serving_quantity||100}};
async function offSearch(q){
  $("#offr").innerHTML=`<p class="empty">Buscando…</p>`;
  try{
    const u=`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=40&tagtype_0=countries&tag_contains_0=contains&tag_0=spain&fields=product_name,brands,nutriments,serving_quantity`;
    const j=await (await fetch(u)).json();
    off=j.products.filter(p=>p.product_name&&p.nutriments?.proteins_100g!=null).map(offMap).sort((a,b)=>(a.s==="O")-(b.s==="O"));
    if(store==="M"||store==="L")off=off.filter(x=>x.s===store);
    $("#offr").innerHTML=off.map((f,i)=>row(f,i)).join("")||`<p class="empty">Nada encontrado</p>`;
    $("#offr").querySelectorAll(".row").forEach(el=>el.onclick=()=>pick(off[el.dataset.i]));
  }catch{$("#offr").innerHTML=`<p class="empty">Sin conexión</p>`}
}
function pick(f){
  open(`<h2>${esc(f.n)}</h2><p class="mu">Por 100 g: ${f.k} kcal · P ${f.p} · C ${f.c} · G ${f.f}</p>
  <label>Cantidad (g / ml)</label><input id="g" type="number" value="${f.g||100}" inputmode="decimal">
  <div class="card lime"><div class="big" id="pk"></div><div class="mac" id="pm"></div></div><label>Comida</label>${mealSel()}
  <button class="btn" id="ok" style="margin-top:10px">Añadir</button>`);
  const up=()=>{const g=+$("#g").value/100;$("#pk").textContent=r0(f.k*g)+" kcal";$("#pm").innerHTML=`<span>P <b>${r1(f.p*g)}</b></span><span>C <b>${r1(f.c*g)}</b></span><span>G <b>${r1(f.f*g)}</b></span>`};
  $("#g").oninput=up;up();
  $("#ok").onclick=()=>{const g=+$("#g").value;lastMeal=$("#ms").value;addEntry({n:f.n,g,k:f.k*g/100,p:f.p*g/100,c:f.c*g/100,f:f.f*g/100});close();lastMeal=null;nav("hoy")};
}
function manual(){
  open(`<h2>Alimento manual</h2><input id="n" placeholder="Nombre"><p class="mu">Valores por 100 g</p>
  <div class="grid"><input id="k" type="number" placeholder="kcal"><input id="p" type="number" placeholder="Proteína"><input id="c" type="number" placeholder="Carbs"><input id="f" type="number" placeholder="Grasa"></div>
  <input id="g" type="number" placeholder="Ración habitual (g)" value="100"><button class="btn" id="ok">Guardar en mis alimentos</button>`);
  $("#ok").onclick=()=>{const v=id=>+$(id).value||0,f={n:$("#n").value||"Mi alimento",k:v("#k"),p:v("#p"),c:v("#c"),f:v("#f"),g:v("#g")||100};S.custom.unshift(f);saveProfile();pick({...f,s:"C"})};
}

/* ---------- Escáner ---------- */
let stream,scanT;
async function scan(){
  open(`<h2>Código de barras</h2><video id="vd" playsinline muted style="width:100%;border-radius:24px;background:#000;display:none"></video>
  <input id="code" inputmode="numeric" placeholder="Escribe el código EAN"><button class="btn" id="ok">Buscar</button><p class="mu" id="sm"></p>`);
  $("#ok").onclick=()=>byCode($("#code").value.trim());
  if(!("BarcodeDetector" in window)){$("#sm").textContent="Tu navegador no permite escanear; escribe el código.";return}
  try{
    stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}});const v=$("#vd");v.srcObject=stream;v.style.display="block";await v.play();
    const det=new BarcodeDetector({formats:["ean_13","ean_8","upc_a"]});
    const loop=async()=>{if(!stream)return;const c=await det.detect(v).catch(()=>[]);if(c[0]){byCode(c[0].rawValue);return}scanT=setTimeout(loop,300)};loop();
  }catch{$("#sm").textContent="Sin acceso a cámara; escribe el código."}
}
function stopScan(){clearTimeout(scanT);stream?.getTracks().forEach(t=>t.stop());stream=null}
async function byCode(c){
  if(!c)return;stopScan();$("#sm").textContent="Buscando "+c+"…";
  try{const j=await (await fetch(`https://world.openfoodfacts.org/api/v2/product/${c}.json?fields=product_name,brands,nutriments,serving_quantity`)).json();
    if(j.status!==1)throw 0;pick(offMap(j.product))}catch{$("#sm").textContent="Producto no encontrado. Añádelo manualmente."}
}

/* ---------- Foto + IA ---------- */
let img64;
$("#cam").onchange=async e=>{
  const file=e.target.files[0];e.target.value="";if(!file||!S.profile)return;
  const bmp=await createImageBitmap(file),sc=Math.min(1,1024/Math.max(bmp.width,bmp.height)),cv=document.createElement("canvas");
  cv.width=bmp.width*sc;cv.height=bmp.height*sc;cv.getContext("2d").drawImage(bmp,0,0,cv.width,cv.height);
  const url=cv.toDataURL("image/jpeg",.8);img64=url.split(",")[1];
  open(`<img class="ph" src="${url}"><h2>Analizar plato</h2><textarea id="info" placeholder="Opcional: añade info (ej. 'arroz unos 150 g cocido, cocinado con 1 cucharada de aceite, salsa sin azúcar')"></textarea>
  <label>Comida</label>${mealSel()}<button class="btn" id="an" style="margin-top:10px">Analizar con IA</button><div id="ar"></div>`);
  $("#an").onclick=analyze;
};
async function analyze(){
  const b=$("#an");b.innerHTML=`<div class="spin"></div>Analizando…`;b.disabled=true;
  const prompt=`Eres un nutricionista experto. Identifica cada alimento del plato de la foto, estima su peso en gramos y calcula kcal, proteína, carbohidratos y grasa (totales de esa cantidad, no por 100 g). Considera aceites y salsas visibles. Usa productos españoles típicos (Mercadona/Lidl) como referencia.${$("#info").value.trim()?`\nInformación adicional del usuario (prioritaria): ${$("#info").value.trim()}`:""}
Responde SOLO con JSON válido, sin texto extra: {"items":[{"n":"nombre en español","g":0,"k":0,"p":0,"c":0,"f":0}],"nota":"comentario breve"}`;
  try{
    let txt;
    if((S.ai||"g")==="g"){
      if(!S.gkey)throw new Error("Pega tu clave gratis de Gemini en Perfil");
      const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${encodeURIComponent(S.gkey)}`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({contents:[{parts:[{inline_data:{mime_type:"image/jpeg",data:img64}},{text:prompt}]}],generationConfig:{responseMimeType:"application/json",temperature:.2}})});
      if(!r.ok)throw new Error(r.status===429?"Límite gratuito alcanzado, espera un minuto":"Error Gemini "+r.status);
      txt=(await r.json()).candidates[0].content.parts.map(x=>x.text||"").join("");
    }else{
      const body=JSON.stringify({model:"claude-sonnet-5-5",max_tokens:1200,messages:[{role:"user",content:[{type:"image",source:{type:"base64",media_type:"image/jpeg",data:img64}},{type:"text",text:prompt}]}]});
      let r=await fetch("/api/analyze",{method:"POST",headers:{"content-type":"application/json"},body}).catch(()=>null);
      if((!r||!r.ok&&[404,501].includes(r.status))&&S.key)r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"x-api-key":S.key,"anthropic-version":"2023-06-01","content-type":"application/json","anthropic-dangerous-direct-browser-access":"true"},body});
      if(!r||!r.ok)throw new Error(r&&[404,501].includes(r.status)?"Configura tu API key en Perfil":"Error IA "+(r?.status||""));
      txt=(await r.json()).content.map(x=>x.text||"").join("");
    }
    const d=JSON.parse(txt.slice(txt.indexOf("{"),txt.lastIndexOf("}")+1));
    showAI(d);
  }catch(err){b.disabled=false;b.textContent="Reintentar";$("#ar").innerHTML=`<p class="empty">${esc(err.message||"No se pudo analizar")}</p>`}
}
function showAI(d){
  $("#an").remove();const it=d.items||[];
  $("#ar").innerHTML=`${d.nota?`<p class="mu">${esc(d.nota)}</p>`:""}${it.map((x,i)=>`<div class="card" style="padding:14px"><input data-i="${i}" data-k="n" value="${esc(x.n)}">
  <div class="grid" style="grid-template-columns:repeat(5,1fr);gap:6px">${["g","k","p","c","f"].map(k=>`<div><label>${{g:"g",k:"kcal",p:"P",c:"C",f:"G"}[k]}</label><input type="number" data-i="${i}" data-k="${k}" value="${r0(x[k])}" style="padding:10px 6px;text-align:center"></div>`).join("")}</div></div>`).join("")}
  <div class="card lime"><div class="big" id="tk"></div><div class="mac" id="tm"></div></div><button class="btn" id="ok">Añadir todo</button>`;
  const tt=()=>{const s=it.reduce((a,x)=>({k:a.k+ +x.k,p:a.p+ +x.p,c:a.c+ +x.c,f:a.f+ +x.f}),{k:0,p:0,c:0,f:0});$("#tk").textContent=r0(s.k)+" kcal";$("#tm").innerHTML=`<span>P <b>${r0(s.p)}</b></span><span>C <b>${r0(s.c)}</b></span><span>G <b>${r0(s.f)}</b></span>`};
  $("#ar").querySelectorAll("input[data-k]").forEach(inp=>inp.oninput=()=>{const x=it[inp.dataset.i],k=inp.dataset.k,v=inp.value;
    if(k==="g"&&+x.g>0){const f=+v/+x.g;["k","p","c","f"].forEach(m=>{x[m]=+x[m]*f;$(`input[data-i="${inp.dataset.i}"][data-k="${m}"]`).value=r0(x[m])})}
    x[k]=k==="n"?v:+v;tt()});
  tt();
  $("#ok").onclick=()=>{lastMeal=$("#ms").value;addEntries(it.map(x=>({n:x.n,g:+x.g,k:+x.k,p:+x.p,c:+x.c,f:+x.f,ai:1})));lastMeal=null;close();nav("hoy")};
}

/* ---------- Ideas ---------- */
function ideas(){
  ideaG??=S.profile.goal;const t=targets(ideaG===S.profile.goal?S.profile:{...S.profile,goal:ideaG,manual:0});
  const L=IDEAS.filter(x=>x.o===ideaG&&x.t===ideaT);
  app.innerHTML=`<h1>Ideas de<br>comidas</h1><p class="mu">Objetivo: ${t.k} kcal · ${t.p} g proteína/día</p>
  <div class="chips" id="ig">${Object.entries(GOALS).map(([v,n])=>`<button class="chip ${ideaG===v?"on":""}" data-v="${v}">${n}</button>`).join("")}</div>
  <div class="chips" id="it">${[["comida","Comidas"],["cena","Cenas"]].map(([v,n])=>`<button class="chip ${ideaT===v?"on":""}" data-v="${v}">${n}</button>`).join("")}</div>
  ${L.map((x,i)=>`<div class="card ${i===0?"lime":""}"><div class="top"><b style="font-size:17px">${esc(x.n)}</b><span class="big" style="font-size:24px">${x.k}</span></div>
  <div class="mac" style="margin:6px 0 10px"><span>P <b>${x.p}</b></span><span>C <b>${x.c}</b></span><span>G <b>${x.f}</b></span><span>kcal</span></div>
  <p class="mu" style="margin:0 0 8px">${esc(x.i)}</p><details style="margin:0 0 12px"><summary style="font-weight:700;cursor:pointer">Ver preparación</summary><p style="margin:8px 0 0;line-height:1.5">${esc(x.s)}</p></details><button class="btn ${i===0?"":"g"}" data-i="${i}" style="padding:12px">＋ Añadir a ${ideaT==="comida"?"Comida":"Cena"}</button></div>`).join("")}`;
  $("#ig").onclick=e=>{const b=e.target.closest(".chip");if(b){ideaG=b.dataset.v;ideas()}};
  $("#it").onclick=e=>{const b=e.target.closest(".chip");if(b){ideaT=b.dataset.v;ideas()}};
  app.querySelectorAll("[data-i]").forEach(b=>b.onclick=()=>{const x=L[b.dataset.i];lastMeal=ideaT==="comida"?"Comida":"Cena";addEntry({n:x.n,k:x.k,p:x.p,c:x.c,f:x.f});lastMeal=null;nav("hoy")});
}

const FOODS=FOODS_RAW,IDEAS=IDEAS_RAW;
render();
sb.auth.onAuthStateChange((ev,session)=>{
  if(ev==="PASSWORD_RECOVERY")recovery=true;
  const u=session?.user??null,changed=u?.id!==user?.id;
  user=u;
  if(ready&&!changed&&ev!=="PASSWORD_RECOVERY")return;
  // Las llamadas a Supabase se difieren para no bloquear el cliente de auth.
  setTimeout(async()=>{
    if(user&&changed){app.innerHTML=SPLASH;try{await loadProfile()}catch(e){console.error(e);toast("Error cargando tus datos")}}
    if(!user){S={log:{},custom:[]};loadedDays=new Set();view="hoy";ob=null;day=today()}
    ready=true;render();
  },0);
});
if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js");
