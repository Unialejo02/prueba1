const GAS_URL = 'https://script.google.com/macros/s/AKfycbzgaw2zyLQPoPPjlq99T1k-FqBd8uBn7NCGXueHgj6-f08M26HHcJosdgBtgzjA3R09/exec';
const gasReady = GAS_URL !== 'TU_URL_AQUI';
const ADMIN = { user:'Novvavalle2026', pass:'Cali2026*', nombre:'NOVVA VALLE Admin', id:'ADMIN', role:'admin' };

let currentUser = null;
let contacts    = [];
let leaders     = [];
let activeFilter = 'all';

function toUpper(el){ const p=el.selectionStart; el.value=el.value.toUpperCase(); el.setSelectionRange(p,p); }
function onlyNumbers(el){ el.value=el.value.replace(/\D/g,''); }
function escHtml(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function fmt(b){ if(b<1024)return b+'B'; if(b<1048576)return Math.round(b/1024)+'KB'; return(b/1048576).toFixed(1)+'MB'; }
function showLoading(m='Guardando...'){ document.getElementById('loadingMsg').textContent=m; document.getElementById('loading').classList.remove('hidden'); }
function hideLoading(){ document.getElementById('loading').classList.add('hidden'); }
function toast(msg,dur=2800){ const t=document.getElementById('toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(t._t); t._t=setTimeout(()=>t.classList.remove('show'),dur); }
function lKey(id){ return 'usc_'+id; }
function leadersKey(){ return 'usc_leaders'; }

function loadLeaders(){
  const raw = localStorage.getItem(leadersKey());
  if(raw){ leaders = JSON.parse(raw); return; }
  if(typeof parseFullName !== 'function'){ leaders = []; return; }
  const STAFF_NAMES = [
    'Diana Isabel Guanga Velasco','Winny Catalina Benavides','Paola Goyes',
    'Nicolas Duran','Mayerling Giron','Manuela Ramirez','Nicole Caicedo',
    'Heidy Lorena Castillo Oviedo','Doris Larrota','Alejandro Uni','Jaime Alirio Guanga'
  ];
  leaders = [];
  for(const name of STAFF_NAMES){
    const p = parseFullName(name);
    const user = generateUsername(p.primerNombre, p.segundoNombre, p.primerApellido, leaders.map(l=>l.user));
    const pass = generatePassword();
    leaders.push(createLeader({ primerNombre:p.primerNombre, segundoNombre:p.segundoNombre, primerApellido:p.primerApellido, segundoApellido:p.segundoApellido, user, pass, tipo:'staff', staffAsignado:'' }));
  }
  saveLeaders();
}

function saveLeaders(){
  localStorage.setItem(leadersKey(), JSON.stringify(leaders));
}

// Certificado: comprimir imagen antes de guardar
function processCertFile(file){
  return new Promise((resolve) => {
    if(!file){ resolve(null); return; }
    if(file.size > 5*1024*1024){ toast('El archivo supera 5MB'); resolve(null); return; }
    if(file.type.startsWith('image/')){
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = function(){
        URL.revokeObjectURL(objectUrl);
        const canvas = document.createElement('canvas');
        const MAX = 1200;
        let w = img.width, h = img.height;
        if(w > MAX || h > MAX){
          if(w > h){ h = Math.round(h * MAX / w); w = MAX; }
          else { w = Math.round(w * MAX / h); h = MAX; }
        }
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        const base64 = canvas.toDataURL('image/jpeg', 0.7);
        resolve({ name: file.name.replace(/\.[^.]+$/, '.jpg'), size: file.size, base64 });
      };
      img.src = objectUrl;
    } else {
      const reader = new FileReader();
      reader.onload = e => resolve({ name:file.name, size:file.size, base64:e.target.result });
      reader.readAsDataURL(file);
    }
  });
}

// Ver certificado en modal (no window.open)
function viewCertModal(cert){
  if(!cert) return toast('Sin certificado');
  if(cert.url){ window.open(cert.url,'_blank'); return; }
  if(!cert.base64) return toast('Sin certificado');
  const overlay = document.createElement('div');
  overlay.className = 'cert-modal-overlay';
  overlay.onclick = (e) => { if(e.target===overlay) overlay.remove(); };
  const modal = document.createElement('div');
  modal.className = 'cert-modal';
  if(cert.base64.startsWith('data:image')){
    modal.innerHTML = `<img src="${cert.base64}" style="max-width:100%"><button class="cert-modal-close" onclick="this.closest('.cert-modal-overlay').remove()">Cerrar</button>`;
  } else {
    const iframe = document.createElement('iframe');
    iframe.src = cert.base64;
    iframe.style.cssText = 'width:100%;height:70vh;border:none;border-radius:12px';
    modal.appendChild(iframe);
    const btn = document.createElement('button');
    btn.className = 'cert-modal-close';
    btn.textContent = 'Cerrar';
    btn.onclick = () => overlay.remove();
    modal.appendChild(btn);
  }
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}

// Modal helpers
function closeModal(id){ document.getElementById(id).classList.add('hidden'); }
function closeIfOutside(e,id){ if(e.target===document.getElementById(id)) closeModal(id); }
