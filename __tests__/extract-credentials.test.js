const { extractCredentials } = require('../js/leader-model');

describe('extractCredentials', () => {
  test('extracts name, user and pass from leaders array', () => {
    const leaders = [
      { nombre: 'Diana Guanga', user: 'diana.guanga', pass: 'Valle729!' },
      { nombre: 'Alejandro Uni', user: 'alejandro.uni', pass: 'Cali456@' },
    ];
    const result = extractCredentials(leaders);
    expect(result).toEqual([
      { nombre: 'Diana Guanga', user: 'diana.guanga', pass: 'Valle729!' },
      { nombre: 'Alejandro Uni', user: 'alejandro.uni', pass: 'Cali456@' },
    ]);
  });

  test('filters out records without user or pass', () => {
    const leaders = [
      { nombre: 'Diana Guanga', user: 'diana.guanga', pass: 'Valle729!' },
      { nombre: 'Sin Creds', user: '', pass: '' },
      { nombre: 'Solo User', user: 'solo.user', pass: '' },
    ];
    const result = extractCredentials(leaders);
    expect(result).toHaveLength(1);
    expect(result[0].nombre).toBe('Diana Guanga');
  });

  test('returns empty array for empty input', () => {
    expect(extractCredentials([])).toEqual([]);
    expect(extractCredentials(null)).toEqual([]);
  });
});
