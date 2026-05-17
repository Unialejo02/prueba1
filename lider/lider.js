// ═══════════════════════════════════════════════════════════════
//  LÍDER JS — CRUD contactos completo
// ═══════════════════════════════════════════════════════════════

let editContactId = null;
let pendingCert = null;

// ── FILTER ──────────────────────────────────────────────────
function setFilter(f, el){
  activeFilter=f;
  document.querySelectorAll('.filter-tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  renderContacts();
}

// ── CONTACTS RENDER ─────────────────────────────────────────
function renderContacts(){
  const q = (document.getElementById('searchInput').value||'').toLowerCase();
  let list = contacts.filter(c=>c.lider===currentUser.id);
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
    const badge = voted
      ? `<span class="badge badge-voted">Confirmado</span>`
      : hasCert
        ? `<span class="badge badge-pending">Pendiente</span>`
        : `<span class="badge badge-no">Sin cert.</span>`;
    const certBtn = hasCert
      ? `<div class="cert-chip has-file" onclick="viewCertModal(contacts.find(x=>x.id==='${c.id}').cert)">📄 Ver certificado</div>`
      : `<div class="cert-chip">📎 Sin certificado</div>`;
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
      </div>
      ${certBtn}
      <div class="contact-actions">
        <button class="btn-sm ${voted?'success':''}" onclick="toggleVoted('${c.id}')">
          ${voted?'✓ Confirmado':'◯ Confirmar voto'}
        </button>
        <button class="btn-sm" onclick="openContactModal('${c.id}')">✏️ Editar</button>
        <button class="btn-sm danger" onclick="deleteContact('${c.id}')">🗑️</button>
      </div>
    </div>`;
  }).join('');
}

function updateStats(){
  const list = contacts.filter(c=>c.lider===currentUser.id);
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
