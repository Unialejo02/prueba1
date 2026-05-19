// ═══════════════════════════════════════════════════════════════
//  ADMIN JS — Credenciales + Registros solo lectura + Staff stats
// ═══════════════════════════════════════════════════════════════

let editLeaderId = null;
let adminTab = 'contacts';

// ── AUTO-GENERATE USER/PASSWORD ───────────────────────────────
function onNameInputAutoGen(){
  if(editLeaderId) return;
  const pNombre = document.getElementById('lPrimerNombre').value.trim();
  const sNombre = document.getElementById('lSegundoNombre').value.trim();
  const pApellido = document.getElementById('lPrimerApellido').value.trim();
  if(pNombre && pApellido){
    const existingUsers = leaders.map(l=>l.user);
    document.getElementById('lUser').value = generateUsername(pNombre, sNombre, pApellido, existingUsers);
    document.getElementById('lPass').value = generatePassword();
  }
}

// ── ADMIN TABS ──────────────────────────────────────────────
function showAdminTab(tab, el){
  adminTab = tab;
  document.querySelectorAll('#adminTabs .nav-tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('panelContacts').classList.add('hidden');
  document.getElementById('panelLeaders').classList.add('hidden');
  document.getElementById('panelStaff').classList.add('hidden');
  if(tab==='contacts'){
    document.getElementById('panelContacts').classList.remove('hidden');
    selectedPersonId = null;
    document.getElementById('leaderFilter').value = '';
    renderPersonCards();
    updateStats();
  } else if(tab==='leaders'){
    document.getElementById('panelLeaders').classList.remove('hidden');
    renderLeaders();
  } else if(tab==='staff'){
    document.getElementById('panelStaff').classList.remove('hidden');
    renderStaffSelector();
  }
}

// ── LEADER FILTER ───────────────────────────────────────────
let selectedPersonId = null;

function populateLeaderFilter(){
  const lf = document.getElementById('leaderFilter');
  if(!lf) return;
  const prev = lf.value;
  lf.innerHTML = '<option value="">👥 Todos</option>' +
    leaders.map(l=>`<option value="${l.id}">${escHtml(l.nombre)} (${l.tipo==='staff'?'Staff':'Líder'})</option>`).join('');
  if(prev) lf.value = prev;
}

function onLeaderFilterChange(){
  selectedPersonId = document.getElementById('leaderFilter').value || null;
  if(selectedPersonId){
    renderContacts();
  } else {
    renderPersonCards();
  }
  updateStats();
}

function renderPersonCards(){
  const q = (document.getElementById('searchInput').value||'').toLowerCase();
  let groups = groupContactsByPerson(contacts, leaders).sort((a, b) => b.total - a.total);
  if(q) groups = groups.filter(g => g.nombre.toLowerCase().includes(q));
  const el = document.getElementById('contactsList');
  if(!groups.length){
    el.innerHTML=`<div class="empty"><div class="empty-icon">👥</div><h3>Sin personas</h3><p>No hay líderes ni staff registrados.</p></div>`;
    return;
  }
  el.innerHTML = groups.map(g => {
    const ini = (g.nombre||'').charAt(0).toUpperCase();
    const tipoBadge = g.tipo==='staff'
      ? `<span style="background:#e8f4f4;color:var(--teal-d);font-size:9px;font-weight:700;padding:2px 8px;border-radius:99px;text-transform:uppercase">⭐ Staff</span>`
      : `<span style="background:#f0fdf4;color:#065f46;font-size:9px;font-weight:700;padding:2px 8px;border-radius:99px;text-transform:uppercase">👤 Líder</span>`;
    return `<div class="contact-card" style="cursor:pointer" onclick="selectPerson('${g.id}')">
      <div class="contact-header">
        <div class="contact-avatar">${ini}</div>
        <div class="contact-info">
          <div style="display:flex;align-items:center;gap:6px">${tipoBadge}<span class="contact-name">${escHtml(g.nombre)}</span></div>
          <div class="contact-doc">@${escHtml(g.user)}</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:8px">
        <div style="text-align:center;background:var(--gray-50);border-radius:8px;padding:8px;border-top:2px solid var(--teal)">
          <div style="font-size:18px;font-weight:700;color:var(--teal)">${g.total}</div>
          <div style="font-size:10px;color:var(--gray-400)">Registros</div>
        </div>
        <div style="text-align:center;background:var(--gray-50);border-radius:8px;padding:8px;border-top:2px solid var(--dark)">
          <div style="font-size:18px;font-weight:700;color:var(--dark)">${g.cert}</div>
          <div style="font-size:10px;color:var(--gray-400)">Con cert.</div>
        </div>
        <div style="text-align:center;background:var(--gray-50);border-radius:8px;padding:8px;border-top:2px solid var(--green)">
          <div style="font-size:18px;font-weight:700;color:var(--green)">${g.voted}</div>
          <div style="font-size:10px;color:var(--gray-400)">Confirmados</div>
        </div>
      </div>
    </div>`;
  }).join('');
}

function selectPerson(id){
  selectedPersonId = id;
  document.getElementById('leaderFilter').value = id;
  renderContacts();
  updateStats();
}

// ── CONTACTS RENDER (solo lectura) ─────────────────────────
function setFilter(f, el){
  activeFilter=f;
  document.querySelectorAll('.filter-tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  renderContacts();
}

function renderContacts(){
  const q = (document.getElementById('searchInput').value||'').toLowerCase();
  let list = [...contacts];
  if(selectedPersonId) list = list.filter(c=>c.lider===selectedPersonId);
  if(q) list = list.filter(c=>`${c.nombres} ${c.apellidos}`.toLowerCase().includes(q) || String(c.doc).includes(q));
  if(activeFilter==='voted')   list = list.filter(c=>c.estado==='voted');
  if(activeFilter==='pending') list = list.filter(c=>c.estado!=='voted');
  if(activeFilter==='cert')    list = list.filter(c=>c.cert);

  const el = document.getElementById('contactsList');
  if(!list.length){
    el.innerHTML=`<div class="empty"><div class="empty-icon">👥</div><h3>${q?'Sin resultados':'Sin registros aún'}</h3><p>${q?'No se encontró ningún registro.':'Aún no hay registros en el sistema.'}</p></div>`;
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
    const leaderInfo = c.liderNombre
      ? `<div class="meta-item"><strong>Líder:</strong> ${escHtml(c.liderNombre)}</div>` : '';
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
    </div>`;
  }).join('');
}

function updateStats(){
  const list = selectedPersonId ? contacts.filter(c=>c.lider===selectedPersonId) : [...contacts];
  document.getElementById('statTotal').textContent = list.length;
  document.getElementById('statCert').textContent  = list.filter(c=>c.cert).length;
  document.getElementById('statVoted').textContent = list.filter(c=>c.estado==='voted').length;
}

// ── LEADERS CRUD ────────────────────────────────────────────
function onTipoChange(){
  const tipo = document.getElementById('lTipo').value;
  const wrap = document.getElementById('staffAsignadoWrap');
  wrap.classList.toggle('hidden', tipo !== 'leader');
  if(tipo==='leader'){
    const staffList = leaders.filter(l=>l.tipo==='staff');
    const sel = document.getElementById('lStaffAsignado');
    sel.innerHTML = '<option value="">— Sin staff asignado —</option>' +
      staffList.map(l=>`<option value="${l.id}">${escHtml(l.nombre)}</option>`).join('');
  }
}

function onNivelEducativoChange(){
  const nivel = document.getElementById('lNivelEducativo').value;
  const tituloNivelWrap = document.getElementById('tituloNivelWrap');
  const tituloPregradoWrap = document.getElementById('tituloPregradoWrap');
  const observacionesWrap = document.getElementById('observacionesEstudiosWrap');

  if(!nivel || nivel === 'Bachiller'){
    tituloNivelWrap.classList.add('hidden');
    tituloPregradoWrap.classList.add('hidden');
    observacionesWrap.classList.add('hidden');
  } else if(nivel === 'Posgrado'){
    tituloNivelWrap.classList.remove('hidden');
    document.querySelector('#tituloNivelWrap label').textContent = '¿Cuál es su título de posgrado?';
    tituloPregradoWrap.classList.remove('hidden');
    observacionesWrap.classList.remove('hidden');
  } else {
    tituloNivelWrap.classList.remove('hidden');
    tituloPregradoWrap.classList.add('hidden');
    observacionesWrap.classList.remove('hidden');
    const labels = { 'Técnico': '¿Cuál es su título técnico?', 'Tecnólogo': '¿Cuál es su título tecnológico?', 'Pregrado': '¿Cuál es su título de pregrado?' };
    document.querySelector('#tituloNivelWrap label').textContent = labels[nivel] || 'Título';
  }
}

function openLeaderModal(id=null){
  editLeaderId = id;
  document.getElementById('errLUser').classList.remove('show');
  if(id){
    const l = leaders.find(x=>x.id===id);
    if(!l) return;
    document.getElementById('leaderModalTitle').textContent = 'Editar credencial';
    document.getElementById('lPrimerNombre').value = l.primerNombre || '';
    document.getElementById('lSegundoNombre').value = l.segundoNombre || '';
    document.getElementById('lPrimerApellido').value = l.primerApellido || '';
    document.getElementById('lSegundoApellido').value = l.segundoApellido || '';
    document.getElementById('lUser').value   = l.user;
    document.getElementById('lPass').value   = l.pass;
    document.getElementById('lTipoDoc').value = l.tipoDoc || 'CC';
    document.getElementById('lDoc').value = l.doc || '';
    document.getElementById('lCiudad').value = l.ciudad || '';
    document.getElementById('lDireccion').value = l.direccion || '';
    document.getElementById('lFechaNacimiento').value = l.fechaNacimiento || '';
    document.getElementById('lEstado').value = l.estado || '';
    document.getElementById('lProfesion').value = l.profesion || '';
    document.getElementById('lNivelEducativo').value = l.nivelEducativo || '';
    document.getElementById('lTituloNivel').value = l.tituloNivel || '';
    document.getElementById('lTituloPregrado').value = l.tituloPregrado || '';
    document.getElementById('lObservacionesEstudios').value = l.observacionesEstudios || '';
    document.getElementById('lZona').value   = l.zona||'';
    document.getElementById('lTipo').value   = l.tipo||'leader';
    onTipoChange();
    onNivelEducativoChange();
    if(l.staffAsignado) document.getElementById('lStaffAsignado').value = l.staffAsignado;
    // Hoja de vida preview
    const hvPreview = document.getElementById('hojaVidaPreview');
    document.getElementById('lHojaVida').value = '';
    if(l.hojaVida){
      hvPreview.innerHTML = `<div class="cert-chip has-file" onclick="viewCertModal(leaders.find(x=>x.id==='${l.id}').hojaVida)">📄 ${escHtml(l.hojaVida.name)} (${fmt(l.hojaVida.size)})</div>`;
    } else {
      hvPreview.innerHTML = '';
    }
  } else {
    document.getElementById('leaderModalTitle').textContent = 'Nueva credencial';
    ['lPrimerNombre','lSegundoNombre','lPrimerApellido','lSegundoApellido',
     'lUser','lPass','lDoc','lCiudad','lDireccion','lFechaNacimiento',
     'lProfesion','lTituloNivel','lTituloPregrado','lObservacionesEstudios','lZona'
    ].forEach(i=>document.getElementById(i).value='');
    document.getElementById('lTipoDoc').value = 'CC';
    document.getElementById('lEstado').value = '';
    document.getElementById('lNivelEducativo').value = '';
    document.getElementById('lHojaVida').value = '';
    document.getElementById('hojaVidaPreview').innerHTML = '';
    document.getElementById('lTipo').value = 'leader';
    onTipoChange();
    onNivelEducativoChange();
  }
  document.getElementById('leaderModal').classList.remove('hidden');
}

async function saveLeader(){
  const primerNombre = document.getElementById('lPrimerNombre').value.trim();
  const primerApellido = document.getElementById('lPrimerApellido').value.trim();
  const user   = document.getElementById('lUser').value.trim().toLowerCase();
  const pass   = document.getElementById('lPass').value.trim();

  if(!primerNombre||!primerApellido||!user||!pass){ toast('Todos los campos marcados son obligatorios'); return; }
  if(pass.length<6){ toast('La contraseña debe tener mínimo 6 caracteres'); return; }

  const dup = leaders.find(l=>l.user===user && l.id!==editLeaderId);
  if(dup||user===ADMIN.user.toLowerCase()){
    document.getElementById('errLUser').classList.add('show'); return;
  }
  document.getElementById('errLUser').classList.remove('show');

  const tipo = document.getElementById('lTipo').value || 'leader';
  const staffAsignado = tipo==='leader' ? (document.getElementById('lStaffAsignado').value||'') : '';

  // Process hoja de vida
  const hvInput = document.getElementById('lHojaVida');
  const hvFile = hvInput && hvInput.files && hvInput.files[0] ? hvInput.files[0] : null;
  let hojaVida = null;
  if(hvFile){
    hojaVida = await processHojaVida(hvFile);
    if(!hojaVida){ toast('Hoja de vida: solo PDF, máximo 5MB'); return; }
  }

  const params = {
    primerNombre,
    segundoNombre: document.getElementById('lSegundoNombre').value.trim(),
    primerApellido,
    segundoApellido: document.getElementById('lSegundoApellido').value.trim(),
    tipoDoc: document.getElementById('lTipoDoc').value,
    doc: document.getElementById('lDoc').value.trim(),
    ciudad: document.getElementById('lCiudad').value.trim(),
    direccion: document.getElementById('lDireccion').value.trim(),
    fechaNacimiento: document.getElementById('lFechaNacimiento').value,
    estado: document.getElementById('lEstado').value,
    profesion: document.getElementById('lProfesion').value.trim(),
    nivelEducativo: document.getElementById('lNivelEducativo').value,
    tituloNivel: document.getElementById('lTituloNivel').value.trim(),
    tituloPregrado: document.getElementById('lTituloPregrado').value.trim(),
    observacionesEstudios: document.getElementById('lObservacionesEstudios').value.trim(),
    user, pass,
    zona: document.getElementById('lZona').value.trim(),
    tipo, staffAsignado,
  };

  let leader;
  if(editLeaderId){
    const existing = leaders.find(l=>l.id===editLeaderId);
    if(hojaVida) params.hojaVida = hojaVida;
    leader = mergeLeader(existing || { id: editLeaderId, fecha: '' }, params);
    leader.id = editLeaderId;
  } else {
    if(hojaVida) params.hojaVida = hojaVida;
    leader = createLeader(params);
  }

  if(editLeaderId){
    const idx = leaders.findIndex(l=>l.id===editLeaderId);
    if(idx>=0) leaders[idx]=leader; else leaders.push(leader);
  } else {
    leaders.push(leader);
  }

  saveLeaders();
  closeModal('leaderModal');
  renderLeaders();
  populateLeaderFilter();
  toast(editLeaderId ? 'Credencial actualizada ✓' : 'Credencial creada ✓');

  if(gasReady){
    saveLeaderToSheet(leader)
      .then(d=>{
        if(d && d.ok) toast('✓ Sincronizado — ya puede entrar desde cualquier celular', 3500);
        else toast('⚠️ Guardado localmente pero NO sincronizado. Usa el botón Sincronizar.', 5000);
      })
      .catch(()=>{ toast('⚠️ Sin conexión. Usa el botón Sincronizar.', 5000); });
  }
}

function deleteLeader(id){
  if(!confirm('¿Eliminar este líder? Se eliminarán también sus contactos.')) return;
  // Delete contacts from server for this leader
  const leaderContacts = contacts.filter(c=>c.lider===id);
  leaderContacts.forEach(c => deleteContactFromSheet(c));
  leaders = leaders.filter(l=>l.id!==id);
  saveLeaders();
  localStorage.removeItem(lKey(id));
  deleteLeaderFromSheet(id);
  renderLeaders();
  populateLeaderFilter();
  toast('Credencial eliminada');
}

function renderLeaders(){
  loadLeaders();
  const el = document.getElementById('leaderList');
  if(!leaders.length){
    el.innerHTML=`<div class="empty"><div class="empty-icon">👥</div><h3>Sin credenciales</h3><p>Agrega tu primer líder o staff tocando <strong>Nueva credencial</strong>.</p></div>`;
    return;
  }

  const q = (document.getElementById('credSearchInput')?.value||'').toLowerCase();
  let filtered = sortLeadersByContacts(leaders, contacts);
  if(q){
    filtered = filtered.filter(l =>
      (l.nombre||'').toLowerCase().includes(q) ||
      (l.doc||'').includes(q) ||
      (l.primerNombre||'').toLowerCase().includes(q) ||
      (l.primerApellido||'').toLowerCase().includes(q)
    );
  }

  if(!filtered.length){
    el.innerHTML=`<div class="empty"><div class="empty-icon">🔍</div><h3>Sin resultados</h3><p>No se encontraron credenciales con "${escHtml(q)}".</p></div>`;
    return;
  }

  el.innerHTML = filtered.map(l=>{
    const lContacts = contacts.filter(c=>c.lider===l.id);
    const voted = lContacts.filter(c=>c.estado==='voted').length;
    const cert  = lContacts.filter(c=>c.cert).length;
    const ini   = l.nombre.charAt(0).toUpperCase();
    const tipoBadge = l.tipo==='staff'
      ? `<span style="background:#e8f4f4;color:var(--teal-d);font-size:9px;font-weight:700;padding:2px 8px;border-radius:99px;text-transform:uppercase">⭐ Staff</span>`
      : `<span style="background:#f0fdf4;color:#065f46;font-size:9px;font-weight:700;padding:2px 8px;border-radius:99px;text-transform:uppercase">👤 Líder</span>`;
    const staffInfo = l.staffAsignado ? (() => {
      const s = leaders.find(x=>x.id===l.staffAsignado);
      return s ? `<div style="font-size:10px;color:var(--gray-400);margin-top:2px">⭐ ${escHtml(s.nombre)}</div>` : '';
    })() : '';
    return `<div class="leader-card">
      <div class="leader-av">${ini}</div>
      <div class="leader-info">
        <div style="display:flex;align-items:center;gap:6px">${tipoBadge}<span class="leader-name">${escHtml(l.nombre)}</span></div>
        <div class="leader-user">@${escHtml(l.user)} ${l.zona?'· '+escHtml(l.zona):''}</div>
        ${staffInfo}
        <div class="leader-stats">📋 ${lContacts.length} registros · ✓ ${voted} confirmados · 📄 ${cert} cert.</div>
      </div>
      <div class="leader-actions">
        <button class="btn-sm" onclick="openLeaderModal('${l.id}')">✏️</button>
        <button class="btn-sm danger" onclick="deleteLeader('${l.id}')">🗑️</button>
      </div>
    </div>`;
  }).join('');
}

// ── STAFF VIEW ──────────────────────────────────────────────
function viewLeaderFromStaff(leaderId){
  const contactsTab = document.querySelector('#adminTabs .nav-tab');
  if(contactsTab) showAdminTab('contacts', contactsTab);
  selectPerson(leaderId);
}

function renderStaffSelector(){
  const staffList = leaders.filter(l=>l.tipo==='staff');
  const ss = document.getElementById('staffSelector');
  if(!ss) return;
  ss.innerHTML = '<option value="">— Selecciona un miembro Staff —</option>' +
    staffList.map(l=>`<option value="${l.id}">${escHtml(l.nombre)}</option>`).join('');
  document.getElementById('staffViewContent').innerHTML = '';
}

function renderStaffView(){
  const staffId = document.getElementById('staffSelector').value;
  const el = document.getElementById('staffViewContent');
  if(!staffId){ el.innerHTML='<div class="empty"><div class="empty-icon">⭐</div><h3>Selecciona un miembro del Staff</h3></div>'; return; }
  const staffMember = leaders.find(l=>l.id===staffId);
  if(!staffMember){ el.innerHTML=''; return; }
  const myLeaders = sortLeadersByContacts(leaders.filter(l=>l.staffAsignado===staffId && l.tipo!=='staff'), contacts);
  if(!myLeaders.length){
    el.innerHTML=`<div class="empty"><div class="empty-icon">👥</div><h3>Sin líderes asignados</h3><p>Asigna líderes a ${escHtml(staffMember.nombre)} desde Credenciales.</p></div>`;
    return;
  }
  // Use loaded contacts instead of fetching again (fix bug #9)
  el.innerHTML = myLeaders.map(l => {
    const lc = contacts.filter(c=>c.lider===l.id);
    const voted = lc.filter(c=>c.estado==='voted').length;
    const cert  = lc.filter(c=>c.cert).length;
    const ini   = l.nombre.charAt(0).toUpperCase();
    const verPerfilBtn = currentUser && currentUser.role === 'admin'
      ? `<button class="btn-add" style="margin-top:8px;width:100%;justify-content:center;font-size:12px;padding:6px 12px" onclick="viewLeaderFromStaff('${l.id}')">Ver perfil</button>`
      : '';
    return `<div class="leader-card" style="margin-bottom:10px;flex-direction:column;align-items:flex-start">
      <div style="display:flex;align-items:center;gap:12px;width:100%">
        <div class="leader-av">${ini}</div>
        <div class="leader-info">
          <div class="leader-name">${escHtml(l.nombre)}</div>
          <div class="leader-user">@${escHtml(l.user)} ${l.zona?'· '+escHtml(l.zona):''}</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;width:100%;margin-top:10px">
        <div style="text-align:center;background:var(--gray-50);border-radius:8px;padding:8px;border-top:2px solid var(--teal)">
          <div style="font-size:20px;font-weight:700;color:var(--teal)">${lc.length}</div>
          <div style="font-size:10px;color:var(--gray-400)">Registros</div>
        </div>
        <div style="text-align:center;background:var(--gray-50);border-radius:8px;padding:8px;border-top:2px solid var(--dark)">
          <div style="font-size:20px;font-weight:700;color:var(--dark)">${cert}</div>
          <div style="font-size:10px;color:var(--gray-400)">Con cert.</div>
        </div>
        <div style="text-align:center;background:var(--gray-50);border-radius:8px;padding:8px;border-top:2px solid var(--green)">
          <div style="font-size:20px;font-weight:700;color:var(--green)">${voted}</div>
          <div style="font-size:10px;color:var(--gray-400)">Confirmados</div>
        </div>
      </div>
      ${verPerfilBtn}
    </div>`;
  }).join('');
}
