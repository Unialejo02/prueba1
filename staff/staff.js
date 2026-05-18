// ═══════════════════════════════════════════════════════════════
//  STAFF JS — Mis registros + Mis líderes + Ver perfil
// ═══════════════════════════════════════════════════════════════

let editContactId = null;
let pendingCert = null;
let selectedLeaderId = null;

// ── TABS ────────────────────────────────────────────────────
function showStaffTab(tab, el){
  document.querySelectorAll('#staffTabs .nav-tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('panelContacts').classList.add('hidden');
  document.getElementById('panelMyLeaders').classList.add('hidden');
  if(tab==='myContacts'){
    document.getElementById('panelContacts').classList.remove('hidden');
    renderContacts(); updateStats();
  } else if(tab==='myLeaders'){
    document.getElementById('panelMyLeaders').classList.remove('hidden');
    renderMyLeaders();
  }
}

// ── FILTER ──────────────────────────────────────────────────
function setFilter(f, el){
  activeFilter=f;
  document.querySelectorAll('.filter-tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  renderContacts();
}

// ── LEADER FILTER ──────────────────────────────────────────
function populateLeaderFilter(){
  const lf = document.getElementById('leaderFilter');
  if(!lf) return;
  const myLeaders = leaders.filter(l => l.staffAsignado === currentUser.id && l.tipo !== 'staff');
  lf.innerHTML = '<option value="">👥 Todos mis registros</option>' +
    myLeaders.map(l => `<option value="${l.id}">${escHtml(l.nombre)}</option>`).join('');
}

function onLeaderFilterChange(){
  selectedLeaderId = document.getElementById('leaderFilter').value || null;
  renderContacts();
  updateStats();
}

function viewLeaderFromStaff(leaderId){
  selectedLeaderId = leaderId;
  document.getElementById('leaderFilter').value = leaderId;
  showStaffTab('myContacts', document.querySelector('#staffTabs .nav-tab'));
}

// ── CONTACTS RENDER ─────────────────────────────────────────
// Fix bug #17: staff sees own contacts + assigned leaders' contacts
function getVisibleContacts(){
  const myLeaders = leaders.filter(l => l.staffAsignado === currentUser.id && l.tipo !== 'staff');
  const liderIds = [currentUser.id, ...myLeaders.map(l=>l.id)];
  let list = contacts.filter(c => liderIds.includes(c.lider));
  if(selectedLeaderId) list = list.filter(c => c.lider === selectedLeaderId);
  return list;
}

function renderContacts(){
  const q = (document.getElementById('searchInput').value||'').toLowerCase();
  let list = getVisibleContacts();
  if(q) list = list.filter(c=>`${c.nombres} ${c.apellidos}`.toLowerCase().includes(q) || String(c.doc).includes(q));
  if(activeFilter==='voted')   list = list.filter(c=>c.estado==='voted');
  if(activeFilter==='pending') list = list.filter(c=>c.estado!=='voted');
  if(activeFilter==='cert')    list = list.filter(c=>c.cert);

  const el = document.getElementById('contactsList');
  if(!list.length){
    el.innerHTML=`<div class="empty"><div class="empty-icon">👥</div><h3>${q?'Sin resultados':'Sin registros aún'}</h3><p>${q?'No se encontró ningún registro.':'Toca <strong>Agregar</strong> para empezar.'}</p></div>`;
    return;
  }
  el.innerHTML = list.map(c=>{
    const ini = ((c.nombres||'').charAt(0)+(c.apellidos||'').charAt(0)).toUpperCase();
    const voted = c.estado==='voted';
    const hasCert = !!c.cert;
    const isOwn = c.lider === currentUser.id;
    const badge = voted
      ? `<span class="badge badge-voted">Confirmado</span>`
      : hasCert
        ? `<span class="badge badge-pending">Pendiente</span>`
        : `<span class="badge badge-no">Sin cert.</span>`;
    const certBtn = hasCert
      ? `<div class="cert-chip has-file" onclick="viewCertModal(contacts.find(x=>x.id==='${c.id}').cert)">📄 Ver certificado</div>`
      : `<div class="cert-chip">📎 Sin certificado</div>`;
    const leaderInfo = !isOwn && c.liderNombre
      ? `<div class="meta-item"><strong>Líder:</strong> ${escHtml(c.liderNombre)}</div>` : '';
    const actions = isOwn ? `
      <div class="contact-actions">
        <button class="btn-sm ${voted?'success':''}" onclick="toggleVoted('${c.id}')">
          ${voted?'✓ Confirmado':'◯ Confirmar voto'}
        </button>
        <button class="btn-sm" onclick="openContactModal('${c.id}')">✏️ Editar</button>
        <button class="btn-sm danger" onclick="deleteContact('${c.id}')">🗑️</button>
      </div>` : '';
    return `<div class="contact-card ${voted?'voted':'pending'}">
      <div class="contact-header">
        <div class="contact-avatar">${ini}</div>
        <div class="contact-info">
          <div class="contact-name">${escHtml(c.nombres)} ${escHtml(c.apellidos)}</div>
          <div class="contact-doc">${escHtml(c.tipoDoc||'CC')} ${escHtml(c.doc)}</div>
        </div>
        ${badge}
      </div>
      <div class="contact-meta">
        ${c.celular?`<div class="meta-item"><strong>📱</strong> ${escHtml(c.celular)}</div>`:''}
        ${c.municipio?`<div class="meta-item"><strong>📍</strong> ${escHtml(c.municipio)}</div>`:''}
        ${c.puesto?`<div class="meta-item"><strong>🗳️</strong> ${escHtml(c.puesto)}</div>`:''}
        ${leaderInfo}
      </div>
      ${certBtn}
      ${actions}
    </div>`;
  }).join('');
}

// Fix bug #21: stats include own + leaders' contacts
function updateStats(){
  const list = getVisibleContacts();
  document.getElementById('statTotal').textContent = list.length;
  document.getElementById('statCert').textContent  = list.filter(c=>c.cert).length;
  document.getElementById('statVoted').textContent = list.filter(c=>c.estado==='voted').length;
}

// ── CONTACT CRUD ────────────────────────────────────────────
function openContactModal(id=null){
  editContactId = id;
  pendingCert = null;
  document.getElementById('certPreview').classList.add('hidden');
  document.getElementById('certPreview').innerHTML='';
  document.getElementById('certUploadZone').classList.remove('hidden');
  document.getElementById('errDoc').classList.remove('show');
  document.getElementById('errCel').classList.remove('show');
  document.getElementById('certInput').value = ''; // Fix bug #28: reset file input

  if(id){
    const c = contacts.find(x=>x.id===id);
    if(!c) return;
    document.getElementById('contactModalTitle').textContent='Editar registro';
    document.getElementById('fNombres').value  = c.nombres||'';
    document.getElementById('fApellidos').value= c.apellidos||'';
    document.getElementById('fTipoDoc').value  = c.tipoDoc||'CC';
    document.getElementById('fDoc').value      = c.doc||'';
    document.getElementById('fCel').value      = c.celular||'';
    document.getElementById('fMunicipio').value= c.municipio||'';
    document.getElementById('fBarrio').value   = c.barrio||'';
    document.getElementById('fPuesto').value   = c.puesto||'';
    document.getElementById('fEstado').value   = c.estado||'pending';
    if(c.cert) showCertPreview(c.cert.name, c.cert.size, null, true);
  } else {
    document.getElementById('contactModalTitle').textContent='Nuevo registro';
    ['fNombres','fApellidos','fDoc','fCel','fMunicipio','fBarrio','fPuesto'].forEach(i=>document.getElementById(i).value='');
    document.getElementById('fTipoDoc').value='CC';
    document.getElementById('fEstado').value='pending';
  }
  document.getElementById('contactModal').classList.remove('hidden');
  document.getElementById('fNombres').focus();
}

function saveContact(){
  const nombres   = document.getElementById('fNombres').value.trim().toUpperCase();
  const apellidos = document.getElementById('fApellidos').value.trim().toUpperCase();
  const doc       = document.getElementById('fDoc').value.replace(/\D/g,'').trim();
  const celular   = document.getElementById('fCel').value.replace(/\D/g,'').trim();
  document.getElementById('fDoc').value = doc;
  document.getElementById('fCel').value = celular;
  let valid = true;

  if(!nombres||!apellidos){ toast('Nombres y apellidos son obligatorios'); return; }
  if(!doc || doc.length < 6){
    document.getElementById('errDoc').classList.add('show');
    document.getElementById('fDoc').classList.add('error');
    toast('El documento debe tener mínimo 6 dígitos'); valid = false;
  } else {
    document.getElementById('errDoc').classList.remove('show');
    document.getElementById('fDoc').classList.remove('error');
  }

  // Fix bug #3: celular is mandatory
  if(!celular || celular.length !== 10){
    document.getElementById('errCel').classList.add('show');
    document.getElementById('fCel').classList.add('error');
    toast('El celular es obligatorio y debe tener 10 dígitos'); valid = false;
  } else {
    document.getElementById('errCel').classList.remove('show');
    document.getElementById('fCel').classList.remove('error');
  }
  if(!valid) return;

  // Fix bug #12: validate duplicate cédula
  const dup = contacts.find(c => c.doc === doc && c.id !== editContactId);
  if(dup){ toast('Ya existe un registro con este número de documento'); return; }

  let cert = pendingCert;
  if(editContactId && !cert){
    const prev = contacts.find(c=>c.id===editContactId);
    if(prev) cert = prev.cert || null;
  }
  const prevContact = editContactId ? contacts.find(c=>c.id===editContactId) : null;

  const contact = {
    id: editContactId || 'C'+Date.now(),
    lider: (prevContact && prevContact.lider) || currentUser.id,
    liderNombre: (prevContact && prevContact.liderNombre) || currentUser.nombre,
    nombres, apellidos,
    tipoDoc: document.getElementById('fTipoDoc').value,
    doc, celular,
    municipio: document.getElementById('fMunicipio').value.trim().toUpperCase(),
    barrio: document.getElementById('fBarrio').value.trim().toUpperCase(),
    puesto: document.getElementById('fPuesto').value.trim().toUpperCase(),
    estado: document.getElementById('fEstado').value,
    cert,
    fecha: (prevContact && prevContact.fecha) || new Date().toLocaleDateString('es-CO'),
  };

  const myContacts = JSON.parse(localStorage.getItem(lKey(currentUser.id))||'[]');
  if(editContactId){
    const idx = myContacts.findIndex(c=>c.id===editContactId);
    if(idx>=0) myContacts[idx]=contact; else myContacts.push(contact);
    const gi = contacts.findIndex(c=>c.id===editContactId);
    if(gi>=0) contacts[gi]=contact; else contacts.push(contact);
  } else {
    myContacts.push(contact);
    contacts.push(contact);
  }
  localStorage.setItem(lKey(currentUser.id), JSON.stringify(myContacts));
  closeModal('contactModal');
  renderContacts(); updateStats();
  toast(editContactId ? 'Registro actualizado ✓' : 'Registro guardado ✓');
  syncContactToSheet(contact);
}

function deleteContact(id){
  if(!confirm('¿Eliminar este registro?')) return;
  const c = contacts.find(x=>x.id===id);
  contacts = contacts.filter(x=>x.id!==id);
  const myContacts = JSON.parse(localStorage.getItem(lKey(currentUser.id))||'[]').filter(x=>x.id!==id);
  localStorage.setItem(lKey(currentUser.id), JSON.stringify(myContacts));
  renderContacts(); updateStats();
  toast('Registro eliminado');
  if(c) deleteContactFromSheet(c);
}

function toggleVoted(id){
  const c = contacts.find(x=>x.id===id);
  if(!c) return;
  c.estado = c.estado==='voted' ? 'pending' : 'voted';
  const myContacts = JSON.parse(localStorage.getItem(lKey(currentUser.id))||'[]');
  const idx = myContacts.findIndex(x=>x.id===id);
  if(idx>=0) myContacts[idx]=c;
  localStorage.setItem(lKey(currentUser.id), JSON.stringify(myContacts));
  renderContacts(); updateStats();
  toast(c.estado==='voted' ? 'Confirmado ✓' : 'Marcado como pendiente');
  syncContactToSheet(c);
}

// ── CERT ────────────────────────────────────────────────────
async function handleCert(file){
  if(!file) return;
  pendingCert = await processCertFile(file);
  if(pendingCert) showCertPreview(pendingCert.name, file.size, pendingCert.base64);
}

function showCertPreview(name, size, base64, existing=false){
  document.getElementById('certUploadZone').classList.add('hidden');
  const prev = document.getElementById('certPreview');
  prev.classList.remove('hidden');
  prev.innerHTML = `
    <div class="uploaded-file">
      <span style="font-size:20px">${name.toLowerCase().endsWith('.pdf')?'📄':'🖼️'}</span>
      <span class="fname">${escHtml(name)}</span>
      <span class="fsize">${existing?'guardado':fmt(size)}</span>
      <button class="fdelete" onclick="removeCert()" title="Eliminar archivo">×</button>
    </div>
    ${!existing && base64 ? `<div style="margin-top:8px;font-size:11px;color:var(--green)">✓ Listo para guardar</div>` : ''}
  `;
}

function removeCert(){
  pendingCert = null;
  if(editContactId){
    const c = contacts.find(x=>x.id===editContactId);
    if(c) c.cert = null;
  }
  document.getElementById('certPreview').classList.add('hidden');
  document.getElementById('certPreview').innerHTML='';
  document.getElementById('certUploadZone').classList.remove('hidden');
  document.getElementById('certInput').value='';
}

// ── MY LEADERS ──────────────────────────────────────────────
function renderMyLeaders(){
  const el = document.getElementById('myLeadersList');
  if(!el) return;
  const myLeaders = leaders.filter(l => l.staffAsignado === currentUser.id && l.tipo !== 'staff');
  if(!myLeaders.length){
    el.innerHTML = `<div class="empty"><div class="empty-icon">👥</div><h3>Sin líderes asignados</h3><p>El administrador aún no te ha asignado líderes.</p></div>`;
    return;
  }
  el.innerHTML = myLeaders.map(l => {
    // Fix bug #9: use loaded contacts
    const lc = contacts.filter(c=>c.lider===l.id);
    const voted = lc.filter(c=>c.estado==='voted').length;
    const cert  = lc.filter(c=>c.cert).length;
    const ini   = l.nombre.charAt(0).toUpperCase();
    return `<div class="leader-card" style="margin-bottom:10px;flex-direction:column;align-items:flex-start">
      <div style="display:flex;align-items:center;gap:12px;width:100%">
        <div class="leader-av">${ini}</div>
        <div class="leader-info">
          <div class="leader-name">${escHtml(l.nombre)}</div>
          <div class="leader-user">@${escHtml(l.user)} ${l.zona?'· '+escHtml(l.zona):''}</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;width:100%;margin-top:10px">
        <div style="text-align:center;background:var(--gray-50);border-radius:8px;padding:10px;border-top:2px solid var(--teal)">
          <div style="font-size:22px;font-weight:700;color:var(--teal)">${lc.length}</div>
          <div style="font-size:10px;color:var(--gray-400);margin-top:2px">Registros</div>
        </div>
        <div style="text-align:center;background:var(--gray-50);border-radius:8px;padding:10px;border-top:2px solid var(--dark)">
          <div style="font-size:22px;font-weight:700;color:var(--dark)">${cert}</div>
          <div style="font-size:10px;color:var(--gray-400);margin-top:2px">Con cert.</div>
        </div>
        <div style="text-align:center;background:var(--gray-50);border-radius:8px;padding:10px;border-top:2px solid var(--green)">
          <div style="font-size:22px;font-weight:700;color:var(--green)">${voted}</div>
          <div style="font-size:10px;color:var(--gray-400);margin-top:2px">Confirmados</div>
        </div>
      </div>
      <button class="btn-add" style="margin-top:8px;width:100%;justify-content:center;font-size:12px;padding:6px 12px" onclick="viewLeaderFromStaff('${l.id}')">Ver perfil</button>
    </div>`;
  }).join('');
}
