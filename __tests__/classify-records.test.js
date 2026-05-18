const { classifyRecords } = require('../js/leader-model');

describe('classifyRecords', () => {
  const leaders = [
    { id: 'L1', nombre: 'Alejandra Perez', tipo: 'lider', user: 'alejandra.perez' },
    { id: 'L2', nombre: 'Luz Maria Torres', tipo: 'lider', user: 'luz.torres' },
    { id: 'L3', nombre: 'Juan Test', tipo: 'staff', user: 'juan.test' },
    { id: 'L4', nombre: 'Maria Prueba', tipo: 'leader', user: 'maria.prueba' },
    { id: 'L5', nombre: 'Pedro Demo', tipo: 'staff', user: 'pedro.demo' },
  ];

  test('separates records matching preserve names into toPreserve', () => {
    const result = classifyRecords(leaders, ['Alejandra', 'Luz']);
    expect(result.toPreserve).toHaveLength(2);
    expect(result.toPreserve[0].nombre).toBe('Alejandra Perez');
    expect(result.toPreserve[1].nombre).toBe('Luz Maria Torres');
  });

  test('puts non-matching records into toDelete', () => {
    const result = classifyRecords(leaders, ['Alejandra', 'Luz']);
    expect(result.toDelete).toHaveLength(3);
    expect(result.toDelete.map(l => l.nombre)).toEqual(['Juan Test', 'Maria Prueba', 'Pedro Demo']);
  });

  test('handles empty leaders array', () => {
    const result = classifyRecords([], ['Alejandra']);
    expect(result.toPreserve).toEqual([]);
    expect(result.toDelete).toEqual([]);
  });

  test('handles empty preserveNames (everything goes to toDelete)', () => {
    const result = classifyRecords(leaders, []);
    expect(result.toPreserve).toEqual([]);
    expect(result.toDelete).toHaveLength(5);
  });

  test('preserves record if nombre contains preserve keyword as substring', () => {
    const leaders2 = [
      { id: 'L6', nombre: 'Alejandra Sofia Gomez', tipo: 'lider', user: 'alejandra.gomez' },
    ];
    const result = classifyRecords(leaders2, ['Alejandra']);
    expect(result.toPreserve).toHaveLength(1);
    expect(result.toDelete).toHaveLength(0);
  });

  test('is case-insensitive for matching', () => {
    const result = classifyRecords(leaders, ['alejandra', 'luz']);
    expect(result.toPreserve).toHaveLength(2);
  });

  test('preserve matching works on partial nombre field', () => {
    const leaders2 = [
      { id: 'L7', nombre: 'Luz Elena', tipo: 'lider', user: 'luz.elena' },
      { id: 'L8', nombre: 'Deluz Marin', tipo: 'lider', user: 'deluz.marin' },
    ];
    const result = classifyRecords(leaders2, ['Luz']);
    expect(result.toPreserve).toHaveLength(1);
    expect(result.toPreserve[0].nombre).toBe('Luz Elena');
  });
});
