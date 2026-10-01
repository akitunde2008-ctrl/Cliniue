// Affichage des pages, formulaires et actions
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt=n=>n.toLocaleString("fr-FR")+" FCFA";
const pat=id=>S.patients.find(p=>p.id===id)||{nom:"Patient supprimé",age:"",tel:""};
let view="gate",pmode="choose",cur=null,doneName="",lq={nom:"",tel:"",err:false};
const VIEWS=[["dash","Tableau de bord"],["gate","Accueil patient"],["patients","Patients"],["rdv","Rendez-vous"],["fact","Facturation"]];

function nav(){document.getElementById("nav").innerHTML=VIEWS.map(([k,l])=>`<button data-v="${k}" ${k===view?'aria-current="page"':""}>${l}</button>`).join("")}
document.getElementById("nav").onclick=e=>{const b=e.target.closest("button");if(b){view=b.dataset.v;if(view==="gate"){pmode="choose";cur=null}render()}};

function render(){nav();const m=document.getElementById("main");const g=view==="gate";document.getElementById("sidefoot").innerHTML=installBtn();document.querySelector(".app").classList.toggle("gate",g);m.innerHTML=g?gateView():({dash,patients,rdv,fact})[view]();if(view==="patients")bindSearch();m.scrollIntoView&&window.scrollTo(0,0)}

function head(t,sub,btn){return `<div class="top"><div><h1>${t}</h1><p>${sub}</p></div>${btn||""}</div>`}

function dash(){
const att=S.rdv.filter(r=>r.st===1).length;
const list=[...S.rdv].sort((a,b)=>a.heure.localeCompare(b.heure));
const today=new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"});
return head("Aujourd'hui",today,`<button class="btn" data-a="newrdv">Nouveau rendez-vous</button>`)+
`<div class="stats">
<div class="stat"><b>${S.rdv.length}</b><span>rendez-vous prévus</span></div>
<div class="stat ${att?"alert":""}"><b>${att}</b><span>en salle d'attente</span></div></div>
<div class="panel"><h2>Agenda de la journée</h2>${list.length?`<ul class="agenda">${list.map(r=>`<li class="s${r.st}"><span class="hr">${r.heure}</span><span class="who">${esc(pat(r.pid).nom)}<small>${esc(MEDECINS[r.med])} · ${esc(r.motif)}</small></span><span class="act">${stBtn(r)}</span></li>`).join("")}</ul>`:`<p class="empty">Aucun rendez-vous aujourd'hui. Ajoutez-en un pour démarrer l'agenda.</p>`}</div>`}

const V=x=>esc(x==null?"":x);
const installBtn=()=>typeof PWA!=="undefined"&&PWA.show()?`<button class="btn ghost sm" data-a="install">Installer l'application</button>`:"";
const telKey=t=>String(t||"").replace(/\s/g,"");

function gateView(){
const foot=`<p class="gfoot">${installBtn()}<button class="btn ghost sm" data-a="staff">Accès personnel</button></p>`;
let body;
if(pmode==="choose"){
body=`<span class="cross big" aria-hidden="true"></span><h1>Bienvenue à la Clinique Espérance</h1><p class="lead">Avant de commencer, dites-nous :</p>
<div class="choices"><button class="choice new" data-a="pnew"><b>Nouveau patient</b><span>C'est ma première visite</span></button>
<button class="choice old" data-a="pold"><b>Ancien patient</b><span>Je suis déjà venu(e)</span></button></div>`+foot}
else if(pmode==="done"){
body=`<h1>Merci, ${esc(doneName)}</h1><div class="panel"><span class="tag ok">Enregistré(e)</span> Vous êtes en salle d'attente. Un membre de l'équipe va vous appeler.</div><div class="row"><button class="btn" data-a="back">Terminer</button></div>`+foot}
else if(pmode==="old"&&cur===null){
body=`<button class="btn ghost sm" data-a="back">← Retour</button><h1 class="gt">Retrouver mon dossier</h1><p class="lead">Entrez votre nom et votre téléphone tels qu'ils figurent dans votre dossier.</p>
<div class="panel"><label for="l_nom">Nom et prénoms</label><input id="l_nom" autocomplete="off" value="${V(lq.nom)}"><label for="l_tel">Téléphone</label><input id="l_tel" type="tel" value="${V(lq.tel)}">
${lq.err?`<p><span class="tag warn">Dossier introuvable</span> Vérifiez l'orthographe et le numéro, ou choisissez « Nouveau patient ».</p>`:""}
<div class="row"><button class="btn" data-a="find">Retrouver mon dossier</button></div></div>`+foot}
else{
const p=cur!==null?pat(cur):{};
body=`<button class="btn ghost sm" data-a="back">← Retour</button>`+accueil(p,cur!==null)+foot}
return `<div class="gate-box">${body}</div>`}

function accueil(p,old){
return head(old?"Mettez vos informations à jour":"Nouveau patient",old?"Dossier retrouvé. Vérifiez vos informations, corrigez-les si besoin, puis décrivez ce que vous ressentez":"Remplissez cette fiche, puis décrivez ce que vous ressentez")+
`<div class="panel"><h2>1. Identité</h2><div class="grid">
<div class="wide"><label for="a_nom">Nom et prénoms *</label><input id="a_nom" autocomplete="off" value="${V(p.nom)}"></div>
<div><label for="a_nais">Date de naissance</label><input id="a_nais" type="date" value="${V(p.naissance)}"></div>
<div><label for="a_sexe">Sexe</label><select id="a_sexe"><option ${p.sexe==="Masculin"?"":"selected"}>Féminin</option><option ${p.sexe==="Masculin"?"selected":""}>Masculin</option></select></div>
<div><label for="a_tel">Téléphone *</label><input id="a_tel" type="tel" value="${V(p.tel)}"></div>
<div><label for="a_adr">Quartier / adresse</label><input id="a_adr" value="${V(p.adr)}"></div>
<div class="wide"><label for="a_pers">Personne à prévenir (nom et téléphone)</label><input id="a_pers" value="${V(p.pers)}"></div></div></div>
<div class="panel"><h2>2. Informations de santé</h2><div class="grid">
<div class="wide"><label for="a_all">Allergies connues</label><input id="a_all" placeholder="Médicaments, aliments… ou « aucune »" value="${V(p.all)}"></div>
<div><label for="a_mal">Maladies chroniques</label><input id="a_mal" placeholder="Diabète, hypertension, drépanocytose…" value="${V(p.mal)}"></div>
<div><label for="a_trt">Traitements en cours</label><input id="a_trt" value="${V(p.trt)}"></div></div></div>
<div class="panel"><h2>3. Ce que le patient ressent</h2><div class="grid">
<div class="wide"><label for="a_sym">Qu'est-ce qui ne va pas ? *</label><textarea id="a_sym" placeholder="Douleurs, fièvre, toux… avec ses propres mots"></textarea></div>
<div><label for="a_dep">Depuis quand ?</label><input id="a_dep" placeholder="Ex. 3 jours"></div>
<div><label for="a_int">Intensité</label><select id="a_int"><option>Légère</option><option selected>Modérée</option><option>Forte</option></select></div>
<div class="wide"><label for="a_med">Médecin</label><select id="a_med">${MEDECINS.map((m,i)=>`<option value="${i}">${m}</option>`).join("")}</select></div>
<div class="wide"><label class="chk"><input type="checkbox" id="a_urg"> Cas urgent, à passer en priorité</label></div></div>
<div class="row"><button class="btn" data-a="checkin">Enregistrer et envoyer en salle d'attente</button></div></div>`}

function stBtn(r){
const next=STATUTS[r.st+1];
const cls=r.st===3?"ok":r.st===1?"warn":"";
return `${r.urg?'<span class="tag warn">Urgent</span> ':""}<span class="tag ${cls}">${STATUTS[r.st]}</span> ${next?`<button class="btn ghost sm" data-a="adv" data-id="${r.id}">${["Patient arrivé","Appeler","Terminer"][r.st]}</button>`:""}`}

function rowsP(q){
const l=S.patients.filter(p=>(p.nom+p.tel+p.motif).toLowerCase().includes(q.toLowerCase()));
return l.length?l.map(p=>`<tr><td>${esc(p.nom)}</td><td>${esc(p.age)} ans</td><td>${esc(p.tel)}</td><td>${esc(p.motif)}</td><td><button class="btn ghost sm" data-a="fiche" data-id="${p.id}">Voir la fiche</button> <button class="btn ghost sm" data-a="delp" data-id="${p.id}">Supprimer</button></td></tr>`).join(""):`<tr><td colspan="5" class="empty">Aucun patient trouvé. Vérifiez l'orthographe ou ajoutez un nouveau patient.</td></tr>`}
function patients(){
return head("Patients",`${S.patients.length} dossiers`,`<button class="btn" data-a="newp">Nouveau patient</button>`)+
`<div class="panel"><input class="search" id="q" placeholder="Rechercher un nom, un numéro, un motif" aria-label="Rechercher un patient"><div class="tablewrap"><table><thead><tr><th>Nom</th><th>Âge</th><th>Téléphone</th><th>Dernier motif</th><th></th></tr></thead><tbody id="pb">${rowsP("")}</tbody></table></div></div>`}
function bindSearch(){document.getElementById("q").oninput=e=>{document.getElementById("pb").innerHTML=rowsP(e.target.value)}}

function rdv(){
const list=[...S.rdv].sort((a,b)=>a.heure.localeCompare(b.heure));
return head("Rendez-vous","Suivez chaque patient de l'arrivée à la sortie",`<button class="btn" data-a="newrdv">Nouveau rendez-vous</button>`)+
`<div class="panel"><div class="tablewrap"><table><thead><tr><th>Heure</th><th>Patient</th><th>Médecin</th><th>Motif</th><th>Statut</th></tr></thead><tbody>${list.length?list.map(r=>`<tr><td>${r.heure}</td><td>${esc(pat(r.pid).nom)}</td><td>${esc(MEDECINS[r.med])}</td><td>${esc(r.motif)}</td><td>${stBtn(r)}</td></tr>`).join(""):`<tr><td colspan="5" class="empty">Aucun rendez-vous. Cliquez sur « Nouveau rendez-vous ».</td></tr>`}</tbody></table></div></div>`}

function fact(){
const tot=S.fact.reduce((a,f)=>a+f.montant,0);
return head("Facturation",`${fmt(tot)} facturés au total`,`<button class="btn" data-a="newf">Nouvelle facture</button>`)+
`<div class="panel"><div class="tablewrap"><table><thead><tr><th>N°</th><th>Patient</th><th>Acte</th><th>Montant</th><th>Statut</th></tr></thead><tbody>${S.fact.length?S.fact.map(f=>`<tr><td>F-${String(f.id).padStart(3,"0")}</td><td>${esc(pat(f.pid).nom)}</td><td>${esc(f.acte)}</td><td>${fmt(f.montant)}</td><td>${f.payee?`<span class="tag ok">Payée</span>`:`<span class="tag warn">Impayée</span> <button class="btn ghost sm" data-a="pay" data-id="${f.id}">Encaisser</button>`}</td></tr>`).join(""):`<tr><td colspan="5" class="empty">Aucune facture. Créez la première après une consultation.</td></tr>`}</tbody></table></div></div>`}

const dlg=document.getElementById("dlg");
const popts=()=>S.patients.map(p=>`<option value="${p.id}">${esc(p.nom)}</option>`).join("");
function modal(title,body,okLabel,onOk){
dlg.innerHTML=`<h2>${title}</h2>${body}<div class="row"><button class="btn ghost" id="cx">Annuler</button><button class="btn" id="ok">${okLabel}</button></div>`;
dlg.showModal();
document.getElementById("cx").onclick=()=>dlg.close();
document.getElementById("ok").onclick=()=>{if(onOk()!==false){save();dlg.close();render()}};
}
const v=id=>document.getElementById(id).value.trim();

document.addEventListener("click",e=>{
const b=e.target.closest("[data-a]");if(!b)return;
const a=b.dataset.a,id=+b.dataset.id;
if(a==="pnew"){pmode="new";cur=null;render();return}
if(a==="pold"){pmode="old";cur=null;lq={nom:"",tel:"",err:false};render();return}
if(a==="back"){pmode="choose";cur=null;render();return}
if(a==="staff"){view="dash";render();return}
if(a==="install"){PWA.install();return}
if(a==="find"){
lq={nom:v("l_nom"),tel:v("l_tel"),err:false};
const q=S.patients.find(x=>x.nom.toLowerCase()===lq.nom.toLowerCase()&&telKey(x.tel)===telKey(lq.tel));
if(q)cur=q.id;else lq.err=true;
render();return}
if(a==="checkin"){
const nom=v("a_nom"),tel=v("a_tel"),sym=v("a_sym");
if(!nom||!tel||!sym){alert("Renseignez le nom, le téléphone et ce que le patient ressent.");return}
const nais=v("a_nais");let age="";
if(nais){const d=new Date(nais),t=new Date();age=t.getFullYear()-d.getFullYear();if(t<new Date(t.getFullYear(),d.getMonth(),d.getDate()))age--}
let p=cur!==null?S.patients.find(x=>x.id===cur):S.patients.find(x=>telKey(x.tel)===telKey(tel)&&x.nom.toLowerCase()===nom.toLowerCase());
const info={nom,sexe:v("a_sexe"),naissance:nais,age,tel,adr:v("a_adr"),pers:v("a_pers"),all:v("a_all"),mal:v("a_mal"),trt:v("a_trt"),motif:sym};
if(p){if(!nais)info.age=p.age;Object.assign(p,info)}else{p={id:S.n.p++,...info};S.patients.push(p)}
const h=new Date();
S.rdv.push({id:S.n.r++,pid:p.id,heure:String(h.getHours()).padStart(2,"0")+":"+String(h.getMinutes()).padStart(2,"0"),med:+v("a_med"),motif:sym,st:1,urg:document.getElementById("a_urg").checked,dep:v("a_dep"),int:v("a_int")});
doneName=nom;pmode="done";cur=null;save();render();return}
if(a==="fiche"){
const p=pat(id),r=[...S.rdv].reverse().find(x=>x.pid===id);
const rows=[["Âge",p.age!==""&&p.age!==undefined?p.age+" ans":""],["Sexe",p.sexe],["Téléphone",p.tel],["Adresse",p.adr],["Personne à prévenir",p.pers],["Allergies",p.all],["Maladies chroniques",p.mal],["Traitements en cours",p.trt],["Dernier motif",p.motif],["Depuis",r&&r.dep],["Intensité",r&&r.int]];
dlg.innerHTML=`<h2>${esc(p.nom)}</h2><dl class="dl">${rows.map(([k,x])=>`<dt>${k}</dt><dd>${x?esc(x):"—"}</dd>`).join("")}</dl><div class="row"><button class="btn" id="cx">Fermer</button></div>`;
dlg.showModal();document.getElementById("cx").onclick=()=>dlg.close();return}
if(a==="adv"){const r=S.rdv.find(x=>x.id===id);r.st++;save();render()}
else if(a==="pay"){S.fact.find(x=>x.id===id).payee=true;save();render()}
else if(a==="delp"){if(confirm("Supprimer ce dossier patient ?")){S.patients=S.patients.filter(p=>p.id!==id);save();render()}}
else if(a==="newp")modal("Nouveau patient",`<label for="f1">Nom complet</label><input id="f1"><label for="f2">Âge</label><input id="f2" type="number" min="0" max="120"><label for="f3">Téléphone</label><input id="f3"><label for="f4">Motif de la visite</label><input id="f4">`,"Enregistrer le patient",()=>{
if(!v("f1")||!v("f2")){alert("Indiquez au moins le nom et l'âge.");return false}
S.patients.push({id:S.n.p++,nom:v("f1"),age:+v("f2"),tel:v("f3"),motif:v("f4")})});
else if(a==="newrdv"){
if(!S.patients.length){alert("Ajoutez d'abord un patient.");return}
modal("Nouveau rendez-vous",`<label for="f1">Patient</label><select id="f1">${popts()}</select><label for="f2">Heure</label><input id="f2" type="time" value="14:00"><label for="f3">Médecin</label><select id="f3">${MEDECINS.map((m,i)=>`<option value="${i}">${m}</option>`).join("")}</select><label for="f4">Motif</label><input id="f4">`,"Planifier le rendez-vous",()=>{
if(!v("f2")){alert("Choisissez une heure.");return false}
S.rdv.push({id:S.n.r++,pid:+v("f1"),heure:v("f2"),med:+v("f3"),motif:v("f4")||"Consultation",st:0})})}
else if(a==="newf"){
if(!S.patients.length){alert("Ajoutez d'abord un patient.");return}
modal("Nouvelle facture",`<label for="f1">Patient</label><select id="f1">${popts()}</select><label for="f2">Acte</label><input id="f2" placeholder="Consultation, analyse, soin…"><label for="f3">Montant (FCFA)</label><input id="f3" type="number" min="0" step="500">`,"Créer la facture",()=>{
if(!v("f2")||!(+v("f3")>0)){alert("Indiquez l'acte et un montant supérieur à 0.");return false}
S.fact.push({id:S.n.f++,pid:+v("f1"),acte:v("f2"),montant:+v("f3"),payee:false})})}
});
render();
