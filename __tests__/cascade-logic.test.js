const { initCascade, selectDepartment, selectMunicipality, selectVotingStation } = require('../js/cascade-logic');

describe('initCascade', () => {
  test('returns empty initial state', () => {
    const state = initCascade();
    expect(state.department).toBeNull();
    expect(state.municipality).toBeNull();
    expect(state.votingStation).toBeNull();
    expect(state.municipalities).toEqual([]);
    expect(state.votingStations).toEqual([]);
  });
});

describe('selectDepartment', () => {
  test('sets department and loads municipalities for Valle del Cauca', () => {
    const state = initCascade();
    const next = selectDepartment(state, '76');
    expect(next.department).toBe('76');
    expect(next.municipalities.length).toBeGreaterThan(30);
    expect(next.municipality).toBeNull();
    expect(next.votingStation).toBeNull();
    expect(next.votingStations).toEqual([]);
  });

  test('resets municipality and station when department changes', () => {
    let state = selectDepartment(initCascade(), '76');
    state = selectMunicipality(state, '76001');
    state = selectDepartment(state, '11');
    expect(state.department).toBe('11');
    expect(state.municipality).toBeNull();
    expect(state.votingStation).toBeNull();
  });

  test('handles unknown department code', () => {
    const state = selectDepartment(initCascade(), '99');
    expect(state.department).toBe('99');
    expect(state.municipalities).toEqual([]);
  });
});

describe('selectMunicipality', () => {
  test('sets municipality and loads voting stations for Cali', () => {
    let state = selectDepartment(initCascade(), '76');
    state = selectMunicipality(state, '76001');
    expect(state.municipality).toBe('76001');
    expect(state.votingStations.length).toBeGreaterThan(0);
    expect(state.votingStation).toBeNull();
  });

  test('resets station when municipality changes', () => {
    let state = selectDepartment(initCascade(), '76');
    state = selectMunicipality(state, '76001');
    state = selectMunicipality(state, '76109');
    expect(state.municipality).toBe('76109');
    expect(state.votingStation).toBeNull();
  });

  test('handles municipality with no stations', () => {
    let state = selectDepartment(initCascade(), '76');
    state = selectMunicipality(state, '76020');
    expect(state.municipality).toBe('76020');
    expect(state.votingStations).toEqual([]);
  });
});

describe('selectVotingStation', () => {
  test('sets voting station', () => {
    let state = selectDepartment(initCascade(), '76');
    state = selectMunicipality(state, '76001');
    state = selectVotingStation(state, '7600101');
    expect(state.votingStation).toBe('7600101');
  });
});
