const { parseFullName } = require('../js/leader-model');

describe('parseFullName', () => {
  test('parses 4-word name into all fields', () => {
    const result = parseFullName('Diana Isabel Guanga Velasco');
    expect(result.primerNombre).toBe('Diana');
    expect(result.segundoNombre).toBe('Isabel');
    expect(result.primerApellido).toBe('Guanga');
    expect(result.segundoApellido).toBe('Velasco');
  });

  test('parses 2-word name as primerNombre + primerApellido', () => {
    const result = parseFullName('Paola Goyes');
    expect(result.primerNombre).toBe('Paola');
    expect(result.segundoNombre).toBe('');
    expect(result.primerApellido).toBe('Goyes');
    expect(result.segundoApellido).toBe('');
  });

  test('parses 3-word name as primerNombre + segundoNombre + primerApellido', () => {
    const result = parseFullName('Winny Catalina Benavides');
    expect(result.primerNombre).toBe('Winny');
    expect(result.segundoNombre).toBe('Catalina');
    expect(result.primerApellido).toBe('Benavides');
    expect(result.segundoApellido).toBe('');
  });

  test('handles single name gracefully', () => {
    const result = parseFullName('Alejandro');
    expect(result.primerNombre).toBe('Alejandro');
    expect(result.segundoNombre).toBe('');
    expect(result.primerApellido).toBe('');
    expect(result.segundoApellido).toBe('');
  });

  test('trims whitespace from input', () => {
    const result = parseFullName('  Nicolas Duran  ');
    expect(result.primerNombre).toBe('Nicolas');
    expect(result.primerApellido).toBe('Duran');
  });

  test('handles extra spaces between words', () => {
    const result = parseFullName('Heidy  Lorena  Castillo  Oviedo');
    expect(result.primerNombre).toBe('Heidy');
    expect(result.segundoNombre).toBe('Lorena');
    expect(result.primerApellido).toBe('Castillo');
    expect(result.segundoApellido).toBe('Oviedo');
  });

  test('returns empty fields for empty string', () => {
    const result = parseFullName('');
    expect(result.primerNombre).toBe('');
    expect(result.segundoNombre).toBe('');
    expect(result.primerApellido).toBe('');
    expect(result.segundoApellido).toBe('');
  });

  test('parses all 11 staff names from client list', () => {
    const names = [
      'Diana Isabel Guanga Velasco',
      'Winny Catalina Benavides',
      'Paola Goyes',
      'Nicolas Duran',
      'Mayerling Giron',
      'Manuela Ramirez',
      'Nicole Caicedo',
      'Heidy Lorena Castillo Oviedo',
      'Doris Larrota',
      'Alejandro Uni',
      'Jaime Alirio Guanga',
    ];

    const results = names.map(parseFullName);

    expect(results[0]).toEqual({ primerNombre: 'Diana', segundoNombre: 'Isabel', primerApellido: 'Guanga', segundoApellido: 'Velasco' });
    expect(results[1]).toEqual({ primerNombre: 'Winny', segundoNombre: 'Catalina', primerApellido: 'Benavides', segundoApellido: '' });
    expect(results[2]).toEqual({ primerNombre: 'Paola', segundoNombre: '', primerApellido: 'Goyes', segundoApellido: '' });
    expect(results[3]).toEqual({ primerNombre: 'Nicolas', segundoNombre: '', primerApellido: 'Duran', segundoApellido: '' });
    expect(results[4]).toEqual({ primerNombre: 'Mayerling', segundoNombre: '', primerApellido: 'Giron', segundoApellido: '' });
    expect(results[5]).toEqual({ primerNombre: 'Manuela', segundoNombre: '', primerApellido: 'Ramirez', segundoApellido: '' });
    expect(results[6]).toEqual({ primerNombre: 'Nicole', segundoNombre: '', primerApellido: 'Caicedo', segundoApellido: '' });
    expect(results[7]).toEqual({ primerNombre: 'Heidy', segundoNombre: 'Lorena', primerApellido: 'Castillo', segundoApellido: 'Oviedo' });
    expect(results[8]).toEqual({ primerNombre: 'Doris', segundoNombre: '', primerApellido: 'Larrota', segundoApellido: '' });
    expect(results[9]).toEqual({ primerNombre: 'Alejandro', segundoNombre: '', primerApellido: 'Uni', segundoApellido: '' });
    expect(results[10]).toEqual({ primerNombre: 'Jaime', segundoNombre: 'Alirio', primerApellido: 'Guanga', segundoApellido: '' });
  });
});
