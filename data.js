// Données de départ, état de l'application et sauvegarde (localStorage)
const MEDECINS=["Dr Adjovi (généraliste)","Dr Kpadonou (pédiatre)","Dr Sossou (gynécologue)"];
const STATUTS=["Attendu","En salle d'attente","En consultation","Terminé"];
const seed={
patients:[
{id:1,nom:"Aurelle Hounkpatin",age:34,tel:"01 97 12 34 56",motif:"Suivi hypertension"},
{id:2,nom:"Koffi Agbodjan",age:7,tel:"01 96 45 67 89",motif:"Fièvre et toux"},
{id:3,nom:"Mariam Salami",age:29,tel:"01 95 22 11 00",motif:"Consultation prénatale"},
{id:4,nom:"Fabrice Dossou",age:52,tel:"01 91 76 54 32",motif:"Douleurs lombaires"}],
rdv:[
{id:1,pid:1,heure:"08:30",med:0,motif:"Contrôle tension",st:3},
{id:2,pid:2,heure:"09:15",med:1,motif:"Fièvre depuis 3 jours",st:2},
{id:3,pid:3,heure:"10:00",med:2,motif:"Échographie du 2e trimestre",st:1},
{id:4,pid:4,heure:"11:30",med:0,motif:"Douleurs lombaires",st:0}],
fact:[
{id:1,pid:1,acte:"Consultation générale",montant:5000,payee:true},
{id:2,pid:2,acte:"Consultation pédiatrique",montant:6000,payee:false}],
n:{p:5,r:5,f:3}};
let S;
try{S=JSON.parse(localStorage.getItem("clinique")||"null")}catch(e){S=null}
if(!S)S=JSON.parse(JSON.stringify(seed));
function save(){try{localStorage.setItem("clinique",JSON.stringify(S))}catch(e){}}
