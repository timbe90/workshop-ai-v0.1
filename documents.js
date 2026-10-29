/* Workshop AI v1.4 — Fahrzeugbezogene PDF-Reiter. PDFs lokal in IndexedDB. */
(()=>{'use strict';
const MAX=20*1024*1024, GROUPS=[['ABE','ABE'],['Fahrzeugschein','Fahrzeugschein'],['Weitere','Weitere Dokumente']];
const make=(tag,txt)=>{const e=document.createElement(tag);if(txt!==undefined)e.textContent=txt;return e};
function db(){return new Promise((resolve,reject)=>{const req=indexedDB.open('workshop-ai-documents',1);req.onupgradeneeded=()=>{const store=req.result.createObjectStore('files',{keyPath:'id'});store.createIndex('carId','carId')};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
async function transact(mode,cb){const d=await db();return new Promise((resolve,reject)=>{const tx=d.transaction('files',mode),store=tx.objectStore('files');try{cb(store)}catch(e){d.close();reject(e);return}tx.oncomplete=()=>{d.close();resolve()};tx.onerror=()=>{d.close();reject(tx.error)}})}
async function list(carId){const d=await db();return new Promise((resolve,reject)=>{const tx=d.transaction('files','readonly'),r=tx.objectStore('files').index('carId').getAll(carId);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);tx.oncomplete=()=>d.close()})}
function download(blob,name){const u=URL.createObjectURL(blob),a=make('a');a.href=u;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),60000)}
function groupOf(rec){return rec.category==='ABE'?'ABE':rec.category==='Fahrzeugschein'?'Fahrzeugschein':'Weitere'}
const state=new Map();
async function show(carId,root,requested){
 if(!root.isConnected)return;
 const active=requested||state.get(carId)||'ABE';state.set(carId,active);
 let wrap=root.querySelector('#docManager');if(!wrap){wrap=make('section');wrap.id='docManager';root.append(wrap)}
 wrap.replaceChildren();wrap.append(make('h2','Fahrzeugdokumente'));
 wrap.append(make('p','PDFs sind nur auf diesem Gerät gespeichert. Sichere wichtige Unterlagen zusätzlich außerhalb der App.'));
 const tabs=make('div');tabs.className='docTabs';tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','Fahrzeugdokumente');
 for(const [key,label] of GROUPS){const b=make('button',label);b.type='button';b.className='docTab'+(active===key?' active':'');b.setAttribute('role','tab');b.setAttribute('aria-selected',String(active===key));b.onclick=()=>show(carId,root,key);tabs.append(b)}wrap.append(tabs);
 const records=await list(carId);if(!root.isConnected||state.get(carId)!==active)return;
 const current=records.filter(r=>groupOf(r)===active).sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
 const form=make('form');form.className='docUpload';
 const titleLabel=make('label','Dokumenttitel');const title=make('input');title.maxLength=140;title.placeholder=active==='ABE'?'z. B. ABE Felgen KBA 12345':active==='Fahrzeugschein'?'z. B. Zulassungsbescheinigung Teil I':'z. B. TÜV-Bericht 2026';title.required=true;
 const fileLabel=make('label','PDF auswählen (max. 20 MB)');const fileInput=make('input');fileInput.type='file';fileInput.accept='application/pdf,.pdf';fileInput.required=true;
 form.append(titleLabel,title,fileLabel,fileInput);
 let category;
 if(active==='Weitere'){const l=make('label','Kategorie');category=make('select');for(const cat of ['Teilegutachten','TÜV / Eintragung','Rechnung','Sonstiges']){const opt=make('option',cat);opt.value=cat;category.append(opt)}form.append(l,category)}
 const save=make('button','PDF in '+(active==='Weitere'?'Weitere Dokumente':active)+' speichern');save.type='submit';form.append(save);
 form.onsubmit=async e=>{e.preventDefault();const f=fileInput.files?.[0],t=title.value.trim();if(!f||!t)return;if(f.size>MAX){alert('PDF ist größer als 20 MB.');return}const head=new Uint8Array(await f.slice(0,5).arrayBuffer());if(String.fromCharCode(...head)!=='%PDF-'){alert('Bitte eine gültige PDF-Datei auswählen.');return}const id=crypto.randomUUID?.()||String(Date.now())+Math.random();save.disabled=true;try{await transact('readwrite',store=>store.put({id,carId,title:t,category:category?.value||active,file:f,date:new Date().toISOString()}));await show(carId,root,active)}catch(err){alert('Speichern fehlgeschlagen: '+err.message);save.disabled=false}};
 wrap.append(form);wrap.append(make('h3',`Gespeicherte PDFs (${current.length})`));if(!current.length)wrap.append(make('p','In diesem Reiter sind noch keine PDFs gespeichert.'));
 for(const rec of current){const row=make('div');row.className='docRow';const heading=make('div');heading.append(make('strong',rec.title));heading.append(make('small',` ${rec.category} · ${(rec.file.size/1048576).toFixed(1)} MB`));row.append(heading);
 const actions=make('div');actions.className='docActions';const open=make('button','Öffnen');open.type='button';open.onclick=()=>{const url=URL.createObjectURL(rec.file);const w=window.open(url,'_blank');if(!w)download(rec.file,rec.title+'.pdf');setTimeout(()=>URL.revokeObjectURL(url),60000)};
 const exportBtn=make('button','PDF sichern');exportBtn.type='button';exportBtn.className='secondary';exportBtn.onclick=()=>download(rec.file,rec.title.replace(/[\\/:*?"<>|]/g,'_')+'.pdf');
 const del=make('button','Löschen');del.type='button';del.className='danger';del.onclick=async()=>{if(!confirm('Dieses PDF dauerhaft löschen?'))return;try{await transact('readwrite',store=>store.delete(rec.id));await show(carId,root,active)}catch(err){alert('Löschen fehlgeschlagen: '+err.message)}};
 actions.append(open,exportBtn,del);row.append(actions);wrap.append(row)}
}
window.workshopDocsRender=(id,root)=>{show(id,root).catch(err=>{const p=make('p','Dokumentenverwaltung nicht verfügbar: '+err.message);root.append(p)})};
const root=document.querySelector('#garageVehicle');if(root?.dataset.pendingDocs)window.workshopDocsRender(root.dataset.pendingDocs,root);
})();
