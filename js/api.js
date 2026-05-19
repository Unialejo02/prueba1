function syncFromSheet(role){
  if(role === 'admin'){
    return fetch(`${GAS_URL}?action=get&lider=ALL`)
      .then(r=>r.json())
      .then(data => {
        if(data.contacts && data.contacts.length) contacts = mergeSheetContacts(contacts, data.contacts);
        return contacts;
      });
  } else if(role === 'staff'){
    const myLeaders = leaders.filter(l => l.staffAsignado === currentUser.id && l.tipo !== 'staff');
    const liderIds = [currentUser.id, ...myLeaders.map(l=>l.id)];
    return fetch(`${GAS_URL}?action=get&lider=ALL`)
      .then(r=>r.json())
      .then(data => {
        if(data.contacts && data.contacts.length){
          contacts = mergeSheetContacts(contacts, data.contacts.filter(c => liderIds.includes(c.lider)));
          localStorage.setItem(lKey(currentUser.id), JSON.stringify(contacts.filter(c=>c.lider===currentUser.id)));
        }
        return contacts;
      });
  } else {
    return fetch(`${GAS_URL}?action=get&lider=${currentUser.id}`)
      .then(r=>r.json())
      .then(data => {
        if(data.contacts && data.contacts.length){
          contacts = mergeSheetContacts(contacts, data.contacts);
          localStorage.setItem(lKey(currentUser.id), JSON.stringify(contacts));
        }
        return contacts;
      });
  }
}

function syncContactToSheet(contact){
  if(!gasReady) return Promise.resolve();
  const certBase64 = contact.cert && contact.cert.base64 ? contact.cert.base64 : null;
  const contactSafe = Object.assign({}, contact, {
    cert: contact.cert ? { name: contact.cert.name, size: contact.cert.size, url: contact.cert.url||'' } : null
  });
  const payload = { action:'save', lider:contact.lider, liderNombre:contact.liderNombre, contact: contactSafe };
  const encoded = encodeURIComponent(JSON.stringify(payload));
  return fetch(`${GAS_URL}?data=${encoded}`)
    .then(r=>r.json())
    .then(d=>{
      if(!d.ok) return;
      if(certBase64){
        const certPayload = JSON.stringify({
          action: 'saveCert',
          contactId: contact.id,
          lider: contact.lider,
          liderNombre: contact.liderNombre,
          contactNombre: (contact.nombres||'') + '_' + (contact.apellidos||''),
          cert: { name: contact.cert.name, size: contact.cert.size, base64: certBase64 }
        });
        return fetch(GAS_URL, { method:'POST', body: certPayload })
          .then(r2=>r2.json())
          .then(d2=>{
            if(!d2.ok) return;
            if(d2.certUrl){
              const updated = mergeCertUrl(contact, d2);
              const gi = contacts.findIndex(c=>c.id===contact.id);
              if(gi>=0) contacts[gi] = updated;
              const myContacts = JSON.parse(localStorage.getItem(lKey(contact.lider))||'[]');
              const li = myContacts.findIndex(c=>c.id===contact.id);
              if(li>=0){ myContacts[li] = updated; localStorage.setItem(lKey(contact.lider), JSON.stringify(myContacts)); }
            }
            toast('Sincronizado con archivo ✓', 2200);
          })
          .catch(()=>{ toast('Datos guardados, archivo pendiente', 2200); });
      } else {
        toast('Sincronizado ✓', 1800);
      }
    })
    .catch(()=>{});
}

function deleteContactFromSheet(contact){
  if(!gasReady) return;
  const e = encodeURIComponent(JSON.stringify({action:'delete', lider:contact.lider, id:contact.id}));
  fetch(`${GAS_URL}?data=${e}`).catch(()=>{});
}

function saveLeaderToSheet(leader){
  if(!gasReady) return Promise.resolve();
  const payload = encodeURIComponent(JSON.stringify({ action:'saveLeader', leader }));
  return fetch(`${GAS_URL}?data=${payload}`)
    .then(r=>r.json());
}

function deleteLeaderFromSheet(leaderId){
  if(!gasReady) return;
  const payload = encodeURIComponent(JSON.stringify({ action:'deleteLeader', leaderId }));
  fetch(`${GAS_URL}?data=${payload}`).catch(()=>{});
}

// Sequential sync - fixes bug #18 (parallel requests exceeding GAS limits)
async function migrateLeadersToSheet(){
  if(!gasReady){ toast('Sin conexión al servidor'); return; }
  const raw = localStorage.getItem('usc_leaders');
  const list = raw ? JSON.parse(raw) : [];
  if(!list.length){ toast('No hay líderes para sincronizar'); return; }
  toast('Sincronizando ' + list.length + ' líderes...', 4000);
  let ok = 0, fail = 0;
  for(const l of list){
    try {
      const payload = encodeURIComponent(JSON.stringify({ action:'saveLeader', leader:l }));
      const r = await fetch(`${GAS_URL}?data=${payload}`);
      const d = await r.json();
      if(d.ok) ok++; else fail++;
    } catch(e){ fail++; }
  }
  if(fail === 0) toast('✓ ' + ok + ' líderes sincronizados correctamente.', 5000);
  else toast('✓ ' + ok + ' sincronizados, ⚠️ ' + fail + ' fallaron.', 5000);
}
