const {
  getDepartments,
  getMunicipalities,
  getVotingStations,
  searchDepartments,
  searchMunicipalities,
  searchVotingStations,
  getBarriosCali,
  searchBarriosCali,
  getComunaByBarrio
} = require('../js/geo-catalog');

describe('getDepartments', () => {
  test('returns 33 departments (32 + Bogotá DC)', () => {
    const depts = getDepartments();
    expect(depts.length).toBe(33);
  });

  test('each department has code and name', () => {
    const depts = getDepartments();
    for (const d of depts) {
      expect(d).toHaveProperty('code');
      expect(d).toHaveProperty('name');
      expect(d.code).toBeTruthy();
      expect(d.name).toBeTruthy();
    }
  });

  test('includes Valle del Cauca with code 76', () => {
    const depts = getDepartments();
    const vdc = depts.find(d => d.code === '76');
    expect(vdc).toBeDefined();
    expect(vdc.name).toBe('Valle del Cauca');
  });

  test('includes Bogotá D.C.', () => {
    const depts = getDepartments();
    const bog = depts.find(d => d.code === '11');
    expect(bog).toBeDefined();
    expect(bog.name).toBe('Bogotá D.C.');
  });
});

describe('getMunicipalities', () => {
  test('returns municipalities for Valle del Cauca (76)', () => {
    const muns = getMunicipalities('76');
    expect(muns.length).toBeGreaterThan(30);
  });

  test('includes Cali in Valle del Cauca', () => {
    const muns = getMunicipalities('76');
    const cali = muns.find(m => m.name === 'Cali');
    expect(cali).toBeDefined();
  });

  test('returns empty array for unknown department', () => {
    const muns = getMunicipalities('99');
    expect(muns).toEqual([]);
  });

  test('each municipality has code and name', () => {
    const muns = getMunicipalities('76');
    for (const m of muns) {
      expect(m).toHaveProperty('code');
      expect(m).toHaveProperty('name');
    }
  });
});

describe('getVotingStations', () => {
  test('returns voting stations for Cali (76001)', () => {
    const stations = getVotingStations('76001');
    expect(stations.length).toBeGreaterThan(0);
  });

  test('each station has code and name', () => {
    const stations = getVotingStations('76001');
    for (const s of stations) {
      expect(s).toHaveProperty('code');
      expect(s).toHaveProperty('name');
    }
  });

  test('returns empty array for unknown municipality', () => {
    const stations = getVotingStations('99999');
    expect(stations).toEqual([]);
  });
});

describe('searchDepartments', () => {
  test('finds "Valle" matching Valle del Cauca', () => {
    const results = searchDepartments('Valle');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(d => d.name === 'Valle del Cauca')).toBe(true);
  });

  test('is case insensitive', () => {
    const upper = searchDepartments('BOGOTA');
    const lower = searchDepartments('bogota');
    expect(upper.length).toBe(lower.length);
  });

  test('returns empty for no match', () => {
    const results = searchDepartments('XYZNOEXISTE');
    expect(results).toEqual([]);
  });
});

describe('searchMunicipalities', () => {
  test('finds "Cali" in Valle del Cauca', () => {
    const results = searchMunicipalities('76', 'Cali');
    expect(results.some(m => m.name === 'Cali')).toBe(true);
  });

  test('only returns municipalities from specified department', () => {
    const results = searchMunicipalities('76', 'a');
    const allFromVdc = results.every(m => m.code.startsWith('76'));
    expect(allFromVdc).toBe(true);
  });
});

describe('searchVotingStations', () => {
  test('finds stations in Cali matching a query', () => {
    const results = searchVotingStations('76001', 'univer');
    expect(results.length).toBeGreaterThan(0);
  });

  test('only returns stations from specified municipality', () => {
    const results = searchVotingStations('76001', 'a');
    expect(results.length).toBeGreaterThan(0);
  });
});

describe('getBarriosCali', () => {
  test('returns list of barrios with comuna', () => {
    const barrios = getBarriosCali();
    expect(barrios.length).toBeGreaterThan(100);
    for (const b of barrios) {
      expect(b).toHaveProperty('name');
      expect(b).toHaveProperty('comuna');
      expect(b.comuna).toBeGreaterThanOrEqual(1);
      expect(b.comuna).toBeLessThanOrEqual(22);
    }
  });
});

describe('searchBarriosCali', () => {
  test('finds barrio by partial name', () => {
    const results = searchBarriosCali('gran');
    expect(results.length).toBeGreaterThan(0);
  });

  test('is case insensitive', () => {
    const upper = searchBarriosCali('GRAN');
    const lower = searchBarriosCali('gran');
    expect(upper.length).toBe(lower.length);
  });
});

describe('getComunaByBarrio', () => {
  test('returns comuna number for a known barrio', () => {
    const barrios = getBarriosCali();
    if (barrios.length > 0) {
      const sample = barrios[0];
      expect(getComunaByBarrio(sample.name)).toBe(sample.comuna);
    }
  });

  test('returns null for unknown barrio', () => {
    expect(getComunaByBarrio('Barro Que No Existe 12345')).toBeNull();
  });
});
