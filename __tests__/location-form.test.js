const { buildLocationData } = require('../js/cascade-logic');

describe('buildLocationData', () => {
  test('returns empty location when no cascade selection', () => {
    const result = buildLocationData({ department: null, municipality: null, votingStation: null, municipalities: [], votingStations: [] }, '');
    expect(result.departamento).toBe('');
    expect(result.municipio).toBe('');
    expect(result.puesto).toBe('');
    expect(result.barrio).toBe('');
    expect(result.comuna).toBeNull();
  });

  test('returns department name when department selected', () => {
    const state = { department: '76', municipality: null, votingStation: null, municipalities: [], votingStations: [] };
    const result = buildLocationData(state, '');
    expect(result.departamento).toBe('Valle del Cauca');
    expect(result.municipio).toBe('');
  });

  test('returns full location for Cali with barrio', () => {
    const state = { department: '76', municipality: '76001', votingStation: '7600101', municipalities: [], votingStations: [] };
    const result = buildLocationData(state, 'Granada');
    expect(result.departamento).toBe('Valle del Cauca');
    expect(result.municipio).toBe('Cali');
    expect(result.puesto).toBe('UNIVERSIDAD DEL VALLE - SEDE MELÉNDEZ');
    expect(result.barrio).toBe('Granada');
    expect(result.comuna).toBe(2);
  });

  test('returns location without barrio for non-Cali municipality', () => {
    const state = { department: '76', municipality: '76109', votingStation: null, municipalities: [], votingStations: [] };
    const result = buildLocationData(state, '');
    expect(result.departamento).toBe('Valle del Cauca');
    expect(result.municipio).toBe('Palmira');
    expect(result.comuna).toBeNull();
  });

  test('returns null comuna for unknown barrio in Cali', () => {
    const state = { department: '76', municipality: '76001', votingStation: null, municipalities: [], votingStations: [] };
    const result = buildLocationData(state, 'Barrio Inexistente');
    expect(result.municipio).toBe('Cali');
    expect(result.barrio).toBe('Barrio Inexistente');
    expect(result.comuna).toBeNull();
  });
});
