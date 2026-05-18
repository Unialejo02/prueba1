function normalizeName(name) {
  return (name || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z]/g, '')
    .toLowerCase();
}

function buildFullName(primerNombre, segundoNombre, primerApellido, segundoApellido) {
  const parts = [primerNombre, segundoNombre, primerApellido, segundoApellido]
    .map(p => (p || '').trim())
    .filter(p => p.length > 0);
  return parts.join(' ');
}

let _idCounter = 0;
function createLeader(params) {
  _idCounter++;
  return {
    id: 'L' + Date.now() + _idCounter,
    primerNombre: params.primerNombre || '',
    segundoNombre: params.segundoNombre || '',
    primerApellido: params.primerApellido || '',
    segundoApellido: params.segundoApellido || '',
    nombre: buildFullName(params.primerNombre, params.segundoNombre, params.primerApellido, params.segundoApellido),
    tipoDoc: params.tipoDoc || '',
    doc: params.doc || '',
    ciudad: params.ciudad || '',
    direccion: params.direccion || '',
    fechaNacimiento: params.fechaNacimiento || '',
    estado: params.estado || '',
    profesion: params.profesion || '',
    nivelEducativo: params.nivelEducativo || '',
    tituloNivel: params.tituloNivel || '',
    tituloPregrado: params.tituloPregrado || '',
    observacionesEstudios: params.observacionesEstudios || '',
    hojaVida: params.hojaVida || null,
    user: params.user || '',
    pass: params.pass || '',
    zona: params.zona || '',
    tipo: params.tipo || 'leader',
    staffAsignado: params.staffAsignado || '',
    role: params.tipo === 'staff' ? 'staff' : 'leader',
    fecha: new Date().toLocaleDateString('es-CO'),
  };
}

function mergeLeader(existing, updates) {
  const merged = { ...existing };

  const updatableFields = [
    'primerNombre', 'segundoNombre', 'primerApellido', 'segundoApellido',
    'tipoDoc', 'doc', 'ciudad', 'direccion', 'fechaNacimiento',
    'estado', 'profesion', 'nivelEducativo', 'tituloNivel',
    'tituloPregrado', 'observacionesEstudios', 'hojaVida',
    'user', 'pass', 'zona', 'tipo', 'staffAsignado',
  ];

  for (const field of updatableFields) {
    if (updates[field] !== undefined && updates[field] !== '') {
      merged[field] = updates[field];
    }
  }

  if (updates.tipo !== undefined) {
    merged.role = updates.tipo === 'staff' ? 'staff' : 'leader';
  }

  const hasNameParts = updates.primerNombre || updates.primerApellido;
  if (hasNameParts) {
    merged.nombre = buildFullName(
      updates.primerNombre || existing.primerNombre || '',
      updates.segundoNombre || existing.segundoNombre || '',
      updates.primerApellido || existing.primerApellido || '',
      updates.segundoApellido || existing.segundoApellido || ''
    );
  }

  return merged;
}

function generateUsername(primerNombre, segundoNombre, primerApellido, existingUsers) {
  const pName = normalizeName(primerNombre);
  const sName = normalizeName(segundoNombre);
  const pSurname = normalizeName(primerApellido);
  const existing = existingUsers || [];

  // Rule 1: primernombre.primerapellido
  const attempt1 = pName + '.' + pSurname;
  if (!existing.includes(attempt1)) return attempt1;

  // Rule 2: segundonombre.primerapellido (only if segundo nombre exists)
  if (sName) {
    const attempt2 = sName + '.' + pSurname;
    if (!existing.includes(attempt2)) return attempt2;
  }

  // Rule 3: primernombre.primerapellido + number
  let n = 1;
  while (existing.includes(attempt1 + n)) n++;
  return attempt1 + n;
}
function generatePassword() {
  const words = ['Valle', 'Cali', 'Cauca', 'Rios', 'Luna', 'Star', 'Nube',
    'Puma', 'Toro', 'Lobo', 'Rosa', 'Loto', 'Norte', 'Paz', 'Vida', 'Espe', 'Fuer',
    'Ondo', 'Pica', 'Luma', 'Gata', 'Mora', 'Lima', 'Vaca', 'Nube'];
  const symbols = ['!', '@', '#', '$', '%', '&', '*', '?'];
  const word = words[Math.floor(Math.random() * words.length)];
  const num = Math.floor(Math.random() * 900) + 100;
  const sym = symbols[Math.floor(Math.random() * symbols.length)];
  return word + num + sym;
}

function processHojaVida(file) {
  return new Promise((resolve) => {
    if (!file) { resolve(null); return; }
    if (file.type !== 'application/pdf') { resolve(null); return; }
    if (file.size > 5 * 1024 * 1024) { resolve(null); return; }
    const reader = new FileReader();
    reader.onload = (e) => resolve({ name: file.name, size: file.size, base64: e.target.result });
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

function groupContactsByPerson(contacts, leaders) {
  if (!leaders || !leaders.length) return [];
  return leaders.map(l => {
    const personContacts = contacts.filter(c => c.lider === l.id);
    return {
      id: l.id,
      nombre: l.nombre,
      tipo: l.tipo,
      user: l.user,
      total: personContacts.length,
      voted: personContacts.filter(c => c.estado === 'voted').length,
      cert: personContacts.filter(c => c.cert).length,
    };
  });
}

function classifyRecords(leaders, preserveNames) {
  const names = (preserveNames || []).map(n => n.toLowerCase());
  const toPreserve = [];
  const toDelete = [];
  for (const l of (leaders || [])) {
    const words = (l.nombre || '').toLowerCase().split(/\s+/);
    const matches = names.some(n => words.some(w => w === n));
    if (matches) toPreserve.push(l);
    else toDelete.push(l);
  }
  return { toPreserve, toDelete };
}

function parseFullName(fullName) {
  const parts = (fullName || '').trim().split(/\s+/).filter(p => p.length > 0);
  if (parts.length === 0) return { primerNombre: '', segundoNombre: '', primerApellido: '', segundoApellido: '' };
  if (parts.length === 1) return { primerNombre: parts[0], segundoNombre: '', primerApellido: '', segundoApellido: '' };
  if (parts.length === 2) return { primerNombre: parts[0], segundoNombre: '', primerApellido: parts[1], segundoApellido: '' };
  if (parts.length === 3) return { primerNombre: parts[0], segundoNombre: parts[1], primerApellido: parts[2], segundoApellido: '' };
  return { primerNombre: parts[0], segundoNombre: parts[1], primerApellido: parts[2], segundoApellido: parts.slice(3).join(' ') };
}

function extractCredentials(leaders) {
  return (leaders || [])
    .filter(l => l.user && l.pass)
    .map(l => ({ nombre: l.nombre, user: l.user, pass: l.pass }));
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { buildFullName, createLeader, mergeLeader, normalizeName, generateUsername, generatePassword, processHojaVida, groupContactsByPerson, classifyRecords, parseFullName, extractCredentials };
}
