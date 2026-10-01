// Installation de l'application (PWA) : enregistrement hors ligne + bouton « Installer l'application »
const PWA={
  ev:null,
  ios:/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1),
  standalone:matchMedia("(display-mode: standalone)").matches||navigator.standalone===true,
  show(){return !this.standalone&&(!!this.ev||this.ios)},
  async install(){
    if(this.ev){
      this.ev.prompt();
      await this.ev.userChoice;
      this.ev=null;
      if(typeof render==="function")render();
      return}
    if(this.ios){
      dlg.innerHTML=`<h2>Installer sur iPhone / iPad</h2><p>Ouvrez ce site dans <b>Safari</b>, puis :</p><ol><li>Touchez le bouton <b>Partager</b> (carré avec une flèche vers le haut).</li><li>Choisissez <b>Sur l'écran d'accueil</b>.</li><li>Touchez <b>Ajouter</b>.</li></ol><div class="row"><button class="btn" id="cx">Compris</button></div>`;
      dlg.showModal();
      document.getElementById("cx").onclick=()=>dlg.close()}
  }
};
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();PWA.ev=e;if(typeof render==="function")render()});
window.addEventListener("appinstalled",()=>{PWA.ev=null;PWA.standalone=true;if(typeof render==="function")render()});
if("serviceWorker" in navigator&&location.protocol!=="file:"){
  window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
}
if(typeof render==="function")render();
