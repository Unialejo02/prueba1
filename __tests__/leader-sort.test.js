const { sortLeadersByContacts } = require('../js/leader-model');

describe('sortLeadersByContacts', () => {
  test('sorts leaders by contact count descending', () => {
    const leaders = [
      { id: 'L1', nombre: 'Ana' },
      { id: 'L2', nombre: 'Bob' },
      { id: 'L3', nombre: 'Carlos' },
    ];
    const contacts = [
      { id: 'C1', lider: 'L1' },
      { id: 'C2', lider: 'L1' },
      { id: 'C3', lider: 'L1' },
      { id: 'C4', lider: 'L2' },
      { id: 'C5', lider: 'L3' },
      { id: 'C6', lider: 'L3' },
    ];
    const sorted = sortLeadersByContacts(leaders, contacts);
    expect(sorted[0].id).toBe('L1');
    expect(sorted[1].id).toBe('L3');
    expect(sorted[2].id).toBe('L2');
  });

  test('leaders with 0 contacts appear at the end', () => {
    const leaders = [
      { id: 'L1', nombre: 'Ana' },
      { id: 'L2', nombre: 'Bob' },
      { id: 'L3', nombre: 'Sin registros' },
    ];
    const contacts = [
      { id: 'C1', lider: 'L2' },
      { id: 'C2', lider: 'L2' },
    ];
    const sorted = sortLeadersByContacts(leaders, contacts);
    expect(sorted[0].id).toBe('L2');
    expect(sorted[2].id).toBe('L3');
  });

  test('handles ties by preserving relative order', () => {
    const leaders = [
      { id: 'L1', nombre: 'Ana' },
      { id: 'L2', nombre: 'Bob' },
    ];
    const contacts = [
      { id: 'C1', lider: 'L1' },
      { id: 'C2', lider: 'L2' },
    ];
    const sorted = sortLeadersByContacts(leaders, contacts);
    expect(sorted.map(l => l.id)).toEqual(['L1', 'L2']);
  });

  test('returns empty array for empty leaders', () => {
    expect(sortLeadersByContacts([], [])).toEqual([]);
  });

  test('returns all leaders when contacts is empty', () => {
    const leaders = [
      { id: 'L1', nombre: 'Ana' },
      { id: 'L2', nombre: 'Bob' },
    ];
    const sorted = sortLeadersByContacts(leaders, []);
    expect(sorted.length).toBe(2);
  });

  test('does not mutate original leaders array', () => {
    const leaders = [
      { id: 'L1', nombre: 'Ana' },
      { id: 'L2', nombre: 'Bob' },
    ];
    const contacts = [
      { id: 'C1', lider: 'L2' },
      { id: 'C2', lider: 'L2' },
      { id: 'C3', lider: 'L1' },
    ];
    const original = [...leaders];
    sortLeadersByContacts(leaders, contacts);
    expect(leaders.map(l => l.id)).toEqual(original.map(l => l.id));
  });
});
