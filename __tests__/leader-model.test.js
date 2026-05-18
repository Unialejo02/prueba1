const { buildFullName, createLeader, mergeLeader, normalizeName, generateUsername, generatePassword, processHojaVida, groupContactsByPerson } = require('../js/leader-model');

describe('buildFullName', () => {
  test('combines all 4 name parts', () => {
    expect(buildFullName('Diana', 'Marcela', 'Gómez', 'Pérez'))
      .toBe('Diana Marcela Gómez Pérez');
  });

  test('works without second name', () => {
    expect(buildFullName('Juan', '', 'Pérez', 'García'))
      .toBe('Juan Pérez García');
  });

  test('works without second surname', () => {
    expect(buildFullName('Diana', 'Marcela', 'Gómez', ''))
      .toBe('Diana Marcela Gómez');
  });

  test('works with only first name and first surname', () => {
    expect(buildFullName('Juan', '', 'Pérez', ''))
      .toBe('Juan Pérez');
  });

  test('trims whitespace from parts', () => {
    expect(buildFullName('  Diana  ', '  Marcela  ', '  Gómez  ', '  Pérez  '))
      .toBe('Diana Marcela Gómez Pérez');
  });
});

describe('createLeader', () => {
  const baseParams = {
    primerNombre: 'Diana',
    segundoNombre: 'Marcela',
    primerApellido: 'Gómez',
    segundoApellido: 'Pérez',
    tipoDoc: 'CC',
    doc: '12345678',
    ciudad: 'Cali',
    direccion: 'Calle 5 # 10-20',
    fechaNacimiento: '1990-05-15',
    estado: 'PSE contratado',
    profesion: 'Ingeniera',
    nivelEducativo: 'Pregrado',
    tituloNivel: 'Ingeniería de Sistemas',
    tituloPregrado: '',
    observacionesEstudios: '',
    user: 'diana.gomez',
    pass: 'Valle729!',
    zona: 'Comuna 5',
    tipo: 'leader',
    staffAsignado: '',
  };

  test('creates leader with all new fields', () => {
    const leader = createLeader(baseParams);
    expect(leader.primerNombre).toBe('Diana');
    expect(leader.segundoNombre).toBe('Marcela');
    expect(leader.primerApellido).toBe('Gómez');
    expect(leader.segundoApellido).toBe('Pérez');
    expect(leader.tipoDoc).toBe('CC');
    expect(leader.doc).toBe('12345678');
    expect(leader.ciudad).toBe('Cali');
    expect(leader.direccion).toBe('Calle 5 # 10-20');
    expect(leader.fechaNacimiento).toBe('1990-05-15');
    expect(leader.estado).toBe('PSE contratado');
    expect(leader.profesion).toBe('Ingeniera');
    expect(leader.nivelEducativo).toBe('Pregrado');
    expect(leader.tituloNivel).toBe('Ingeniería de Sistemas');
  });

  test('generates nombre from name parts', () => {
    const leader = createLeader(baseParams);
    expect(leader.nombre).toBe('Diana Marcela Gómez Pérez');
  });

  test('sets role based on tipo', () => {
    const leader = createLeader(baseParams);
    expect(leader.role).toBe('leader');
    const staff = createLeader({ ...baseParams, tipo: 'staff' });
    expect(staff.role).toBe('staff');
  });

  test('generates unique id', () => {
    const leader1 = createLeader(baseParams);
    const leader2 = createLeader(baseParams);
    expect(leader1.id).toBeDefined();
    expect(leader2.id).toBeDefined();
    expect(leader1.id).not.toBe(leader2.id);
  });

  test('id starts with L prefix', () => {
    const leader = createLeader(baseParams);
    expect(leader.id).toMatch(/^L\d+$/);
  });

  test('sets fecha to current date', () => {
    const leader = createLeader(baseParams);
    expect(leader.fecha).toBeDefined();
    expect(leader.fecha.length).toBeGreaterThan(0);
  });

  test('handles optional fields as empty strings', () => {
    const minimal = {
      ...baseParams,
      segundoNombre: '',
      segundoApellido: '',
      tituloPregrado: '',
      observacionesEstudios: '',
      staffAsignado: '',
    };
    const leader = createLeader(minimal);
    expect(leader.segundoNombre).toBe('');
    expect(leader.segundoApellido).toBe('');
    expect(leader.tituloPregrado).toBe('');
    expect(leader.observacionesEstudios).toBe('');
    expect(leader.staffAsignado).toBe('');
  });

  test('preserves existing fields (zona, tipo, staffAsignado)', () => {
    const leader = createLeader(baseParams);
    expect(leader.zona).toBe('Comuna 5');
    expect(leader.tipo).toBe('leader');
    expect(leader.user).toBe('diana.gomez');
    expect(leader.pass).toBe('Valle729!');
  });
});

describe('mergeLeader', () => {
  test('updates existing leader with new field values', () => {
    const existing = {
      id: 'L123',
      nombre: 'JUAN PEREZ',
      user: 'juan.perez',
      pass: 'oldpass',
      zona: 'Comuna 1',
      tipo: 'leader',
      staffAsignado: '',
      role: 'leader',
      fecha: '1/1/2026',
    };
    const updates = {
      primerNombre: 'Juan',
      segundoNombre: 'Carlos',
      primerApellido: 'Pérez',
      segundoApellido: 'García',
      tipoDoc: 'CC',
      doc: '98765432',
      ciudad: 'Bogotá',
      direccion: 'Cra 10 # 20-30',
      fechaNacimiento: '1985-03-20',
      estado: 'Nombrado',
      profesion: 'Abogado',
      nivelEducativo: 'Posgrado',
      tituloNivel: 'Especialización en Derecho',
      tituloPregrado: 'Derecho',
      observacionesEstudios: 'Diplomado en X',
    };
    const merged = mergeLeader(existing, updates);
    expect(merged.primerNombre).toBe('Juan');
    expect(merged.segundoNombre).toBe('Carlos');
    expect(merged.ciudad).toBe('Bogotá');
    expect(merged.nivelEducativo).toBe('Posgrado');
  });

  test('preserves existing id and fecha', () => {
    const existing = {
      id: 'L123',
      fecha: '1/1/2026',
    };
    const merged = mergeLeader(existing, { primerNombre: 'Juan' });
    expect(merged.id).toBe('L123');
    expect(merged.fecha).toBe('1/1/2026');
  });

  test('regenerates nombre from new name parts', () => {
    const existing = { id: 'L123', nombre: 'OLD NAME', fecha: '' };
    const merged = mergeLeader(existing, {
      primerNombre: 'Diana',
      segundoNombre: '',
      primerApellido: 'Gómez',
      segundoApellido: '',
    });
    expect(merged.nombre).toBe('Diana Gómez');
  });

  test('preserves old nombre if no new name parts provided', () => {
    const existing = { id: 'L123', nombre: 'JUAN PEREZ', fecha: '' };
    const merged = mergeLeader(existing, { ciudad: 'Cali' });
    expect(merged.nombre).toBe('JUAN PEREZ');
  });

  test('does not overwrite existing fields with empty values', () => {
    const existing = {
      id: 'L123',
      fecha: '',
      ciudad: 'Cali',
      profesion: 'Ingeniero',
    };
    const merged = mergeLeader(existing, {
      ciudad: '',
      profesion: '',
    });
    expect(merged.ciudad).toBe('Cali');
    expect(merged.profesion).toBe('Ingeniero');
  });
});

describe('normalizeName', () => {
  test('converts to lowercase', () => {
    expect(normalizeName('Diana')).toBe('diana');
  });

  test('removes accents', () => {
    expect(normalizeName('Gómez')).toBe('gomez');
    expect(normalizeName('Pérez')).toBe('perez');
    expect(normalizeName('Nuñez')).toBe('nunez');
  });

  test('removes special characters, keeps letters only', () => {
    expect(normalizeName("O'Brien")).toBe('obrien');
    expect(normalizeName('Ana María')).toBe('anamaria');
  });

  test('handles empty string', () => {
    expect(normalizeName('')).toBe('');
  });
});

describe('generateUsername', () => {
  test('Rule 1: primernombre.primerapellido', () => {
    const result = generateUsername('Diana', '', 'Gómez', []);
    expect(result).toBe('diana.gomez');
  });

  test('Rule 1: with accents removed', () => {
    const result = generateUsername('José', '', 'Nuñez', []);
    expect(result).toBe('jose.nunez');
  });

  test('Rule 2: segundonombre.primerapellido when Rule 1 exists', () => {
    const existing = ['diana.gomez'];
    const result = generateUsername('Diana', 'Marcela', 'Gómez', existing);
    expect(result).toBe('marcela.gomez');
  });

  test('Rule 2: skipped when no segundo nombre', () => {
    const existing = ['juan.perez'];
    const result = generateUsername('Juan', '', 'Pérez', existing);
    expect(result).toBe('juan.perez1');
  });

  test('Rule 3: appends number when both rules give duplicates', () => {
    const existing = ['diana.gomez', 'marcela.gomez'];
    const result = generateUsername('Diana', 'Marcela', 'Gómez', existing);
    expect(result).toBe('diana.gomez1');
  });

  test('Rule 3: increments number until unique', () => {
    const existing = ['diana.gomez', 'marcela.gomez', 'diana.gomez1', 'diana.gomez2'];
    const result = generateUsername('Diana', 'Marcela', 'Gómez', existing);
    expect(result).toBe('diana.gomez3');
  });

  test('returns primernombre.primerapellido when no conflicts', () => {
    const result = generateUsername('Carlos', 'Andrés', 'Rivera', ['maria.lopez']);
    expect(result).toBe('carlos.rivera');
  });
});

describe('generatePassword', () => {
  test('returns a string of at least 8 characters', () => {
    const pwd = generatePassword();
    expect(typeof pwd).toBe('string');
    expect(pwd.length).toBeGreaterThanOrEqual(8);
  });

  test('contains at least one digit', () => {
    const pwd = generatePassword();
    expect(/\d/.test(pwd)).toBe(true);
  });

  test('contains at least one special character', () => {
    const pwd = generatePassword();
    expect(/[!@#$%&*?]/.test(pwd)).toBe(true);
  });

  test('contains at least one letter', () => {
    const pwd = generatePassword();
    expect(/[a-zA-Z]/.test(pwd)).toBe(true);
  });

  test('generates different passwords on successive calls', () => {
    const pwd1 = generatePassword();
    const pwd2 = generatePassword();
    const pwd3 = generatePassword();
    const allSame = pwd1 === pwd2 && pwd2 === pwd3;
    expect(allSame).toBe(false);
  });
});

describe('processHojaVida', () => {
  function makeFile(name, size, type) {
    const content = new Uint8Array(size);
    return { name, size, type, content };
  }

  test('rejects non-PDF files', async () => {
    const file = makeFile('hoja.docx', 1000, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    const result = await processHojaVida(file);
    expect(result).toBeNull();
  });

  test('rejects files over 5MB', async () => {
    const file = makeFile('hoja.pdf', 6 * 1024 * 1024, 'application/pdf');
    const result = await processHojaVida(file);
    expect(result).toBeNull();
  });

  test('returns null when no file provided', async () => {
    const result = await processHojaVida(null);
    expect(result).toBeNull();
  });
});

describe('groupContactsByPerson', () => {
  const leaders = [
    { id: 'L1', nombre: 'Diana Gómez', tipo: 'leader', user: 'diana.gomez' },
    { id: 'L2', nombre: 'Carlos Pérez', tipo: 'staff', user: 'carlos.perez' },
    { id: 'L3', nombre: 'Ana Rivera', tipo: 'leader', user: 'ana.rivera' },
  ];
  const contacts = [
    { id: 'C1', lider: 'L1', estado: 'voted', cert: { name: 'cert.pdf' } },
    { id: 'C2', lider: 'L1', estado: 'pending', cert: null },
    { id: 'C3', lider: 'L1', estado: 'voted', cert: null },
    { id: 'C4', lider: 'L3', estado: 'pending', cert: null },
  ];

  test('groups contacts by leader id', () => {
    const groups = groupContactsByPerson(contacts, leaders);
    expect(groups.length).toBe(3);
    const diana = groups.find(g => g.id === 'L1');
    expect(diana.total).toBe(3);
    expect(diana.voted).toBe(2);
    expect(diana.cert).toBe(1);
  });

  test('includes staff with zero contacts', () => {
    const groups = groupContactsByPerson(contacts, leaders);
    const carlos = groups.find(g => g.id === 'L2');
    expect(carlos).toBeDefined();
    expect(carlos.total).toBe(0);
    expect(carlos.tipo).toBe('staff');
  });

  test('includes person info (nombre, tipo, user)', () => {
    const groups = groupContactsByPerson(contacts, leaders);
    const diana = groups.find(g => g.id === 'L1');
    expect(diana.nombre).toBe('Diana Gómez');
    expect(diana.tipo).toBe('leader');
    expect(diana.user).toBe('diana.gomez');
  });

  test('returns empty array when no leaders', () => {
    const groups = groupContactsByPerson([], []);
    expect(groups).toEqual([]);
  });

  test('returns all leaders with 0 contacts when contacts empty', () => {
    const groups = groupContactsByPerson([], leaders);
    expect(groups.length).toBe(3);
    groups.forEach(g => expect(g.total).toBe(0));
  });
});
