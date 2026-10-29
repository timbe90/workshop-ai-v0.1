/* Workshop AI v1.6: LOKALER PROTOTYP, KEINE SICHERE LIZENZPRUEFUNG. */
(()=>{'use strict';
const KEY='workshop-ai-license-demo-v1';
let state={tier:'all',slots:1};
try{const stored=JSON.parse(localStorage.getItem(KEY)||'null');if(stored&&['all','database','garage'].includes(stored.tier)&&Number.isSafeInteger(stored.slots)&&stored.slots>=1&&stored.slots<=1000)state=stored;}catch{}
const $=id=>document.getElementById(id);
function can(section){return ['home','workshop','account','smart'].includes(section)||state.tier==='all'||(state.tier==='database'&&section==='database')||(state.tier==='garage'&&section==='garage');}
function canAddCar(currentCount){return state.tier==='all'||(state.tier==='garage'&&currentCount<state.slots);}
function refresh(){const tierNames={all:'All Access',database:'Fahrzeugdatenbank',garage:'Garage Only'};$('licenseState').textContent=`Aktiver Testmodus: ${tierNames[state.tier]}`;$('licenseDemoTier').value=state.tier;$('garageSlotsPanel').hidden=state.tier!=='garage';$('garageSlotsInfo').textContent=`${state.slots} Fahrzeugplatz/-plätze freigeschaltet (nur Test)`;for(const [id,section] of [['navGarage','garage'],['navDatabase','database'],['homeGarage','garage'],['homeDatabase','database']]){const b=$(id);if(b){b.style.opacity=can(section)?'1':'.38';b.setAttribute('aria-disabled',String(!can(section)));}}if(window.workshopGarageRefresh)window.workshopGarageRefresh();if(window.workshopNavigate)window.workshopNavigate('account');}
function save(){localStorage.setItem(KEY,JSON.stringify(state));refresh()}
$('licenseDemoActivate').onclick=()=>{state={tier:$('licenseDemoTier').value,slots:1};save()};
$('licenseDemoReset').onclick=()=>{state={tier:'all',slots:1};save()};
$('licenseDemoAddSlot').onclick=()=>{if(state.tier==='garage'&&state.slots<1000){state.slots++;save()}};
window.workshopLicense={can,canAddCar,getState:()=>({...state})};
refresh();
})();
