function togglePass(){
  const input = document.getElementById('loginPass');
  const icon  = document.getElementById('eyeIcon');
  if(input.type === 'password'){
    input.type = 'text';
    icon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>';
  } else {
    input.type = 'password';
    icon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
  }
}

function doLogin(){
  const user = document.getElementById('loginUser').value.trim();
  const pass = document.getElementById('loginPass').value;
  const err  = document.getElementById('loginErr');
  err.textContent = '';
  if(!user||!pass){ err.textContent='Ingresa usuario y contraseña'; return; }

  // Admin
  if(user.toUpperCase() === ADMIN.user.toUpperCase() && pass === ADMIN.pass){
    currentUser = {...ADMIN};
    sessionStorage.setItem('usc_session', JSON.stringify(currentUser));
    redirectToRole(); return;
  }

  // localStorage first
  loadLeaders();
  const local = leaders.find(l => l.user.toLowerCase() === user.toLowerCase() && l.pass === pass);
  if(local){
    currentUser = {...local, role: local.tipo==='staff' ? 'staff' : 'leader'};
    sessionStorage.setItem('usc_session', JSON.stringify(currentUser));
    redirectToRole(); return;
  }

  // Check sheet
  showLoading('Verificando credenciales...');
  err.textContent = 'Verificando...';
  const ctrl = new AbortController();
  const t = setTimeout(()=>ctrl.abort(), 10000);
  fetch(`${GAS_URL}?action=getLeaders`, {signal:ctrl.signal})
    .then(r=>r.json())
    .then(data=>{
      clearTimeout(t);
      if(data.leaders && data.leaders.length){
        localStorage.setItem(leadersKey(), JSON.stringify(data.leaders));
        leaders = data.leaders;
        const found = data.leaders.find(l => l.user.toLowerCase() === user.toLowerCase() && l.pass === pass);
        if(found){
          currentUser = {...found, role: found.tipo==='staff' ? 'staff' : 'leader'};
          sessionStorage.setItem('usc_session', JSON.stringify(currentUser));
          hideLoading();
          redirectToRole(); return;
        }
      }
      hideLoading();
      err.textContent = 'Usuario o contraseña incorrectos';
    })
    .catch(()=>{
      clearTimeout(t);
      hideLoading();
      err.textContent = 'Sin conexión al servidor. Verifica tu internet.';
    });
}

function doLogout(){
  sessionStorage.removeItem('usc_session');
  window.location.href = '../index.html';
}

function redirectToRole(){
  if(!currentUser) return;
  if(currentUser.role === 'admin') window.location.href = 'admin/index.html';
  else if(currentUser.role === 'staff') window.location.href = 'staff/index.html';
  else window.location.href = 'lider/index.html';
}

function checkSession(){
  const s = sessionStorage.getItem('usc_session');
  if(s){ currentUser = JSON.parse(s); return true; }
  return false;
}
