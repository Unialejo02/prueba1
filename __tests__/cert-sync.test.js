const {
  mergeCertUrl,
  mergeSheetContacts,
  hasViewableCert,
  getCertSource,
} = require('../js/cert-sync');

describe('mergeCertUrl', () => {
  test('adds cert URL from GAS response to contact', () => {
    const contact = {
      id: 'C1',
      cert: { name: 'foto.jpg', size: 50000, base64: 'data:image/jpeg;base64,abc' },
    };
    const gasResponse = { ok: true, certUrl: 'https://drive.google.com/file/d/XYZ/view' };
    const result = mergeCertUrl(contact, gasResponse);
    expect(result.cert.url).toBe('https://drive.google.com/file/d/XYZ/view');
  });

  test('returns contact unchanged when no certUrl in response', () => {
    const contact = { id: 'C1', cert: { name: 'foto.jpg', base64: 'abc' } };
    const result = mergeCertUrl(contact, { ok: true });
    expect(result.cert.url).toBeUndefined();
  });

  test('returns contact unchanged when response is null', () => {
    const contact = { id: 'C1', cert: { name: 'foto.jpg' } };
    const result = mergeCertUrl(contact, null);
    expect(result).toEqual(contact);
  });

  test('preserves existing cert fields when adding url', () => {
    const contact = {
      id: 'C1',
      cert: { name: 'foto.jpg', size: 50000, base64: 'data:image/jpeg;base64,abc' },
    };
    const result = mergeCertUrl(contact, { ok: true, certUrl: 'https://drive.google.com/xyz' });
    expect(result.cert.name).toBe('foto.jpg');
    expect(result.cert.size).toBe(50000);
    expect(result.cert.base64).toBe('data:image/jpeg;base64,abc');
    expect(result.cert.url).toBe('https://drive.google.com/xyz');
  });
});

describe('mergeSheetContacts', () => {
  test('sheet contacts with cert.url are preserved as-is', () => {
    const sheetContacts = [
      { id: 'C1', cert: { name: 'foto.jpg', size: 50000, url: 'https://drive.google.com/xyz' } },
      { id: 'C2', cert: null },
    ];
    const result = mergeSheetContacts([], sheetContacts);
    expect(result[0].cert.url).toBe('https://drive.google.com/xyz');
    expect(result[1].cert).toBeNull();
  });

  test('local base64 is preserved when sheet has no base64 but has url', () => {
    const localContacts = [
      { id: 'C1', cert: { name: 'foto.jpg', size: 50000, base64: 'data:image/jpeg;base64,abc' } },
    ];
    const sheetContacts = [
      { id: 'C1', cert: { name: 'foto.jpg', size: 50000, url: 'https://drive.google.com/xyz' } },
    ];
    const result = mergeSheetContacts(localContacts, sheetContacts);
    expect(result[0].cert.url).toBe('https://drive.google.com/xyz');
    expect(result[0].cert.base64).toBe('data:image/jpeg;base64,abc');
  });

  test('sheet contacts without cert remain without cert', () => {
    const sheetContacts = [
      { id: 'C1', cert: null },
      { id: 'C2' },
    ];
    const result = mergeSheetContacts([], sheetContacts);
    expect(result[0].cert).toBeNull();
    expect(result[1].cert).toBeUndefined();
  });
});

describe('hasViewableCert', () => {
  test('returns true for cert with base64 only', () => {
    expect(hasViewableCert({ name: 'foto.jpg', base64: 'data:image/jpeg;base64,abc' })).toBe(true);
  });

  test('returns true for cert with url only (no base64)', () => {
    expect(hasViewableCert({ name: 'foto.jpg', url: 'https://drive.google.com/xyz' })).toBe(true);
  });

  test('returns false for null cert', () => {
    expect(hasViewableCert(null)).toBe(false);
  });

  test('returns false for undefined cert', () => {
    expect(hasViewableCert(undefined)).toBe(false);
  });
});

describe('getCertSource', () => {
  test('returns url when cert has both url and base64', () => {
    const cert = { name: 'foto.jpg', base64: 'data:image/jpeg;base64,abc', url: 'https://drive.google.com/xyz' };
    expect(getCertSource(cert)).toBe('https://drive.google.com/xyz');
  });

  test('returns base64 when cert has only base64', () => {
    const cert = { name: 'foto.jpg', base64: 'data:image/jpeg;base64,abc' };
    expect(getCertSource(cert)).toBe('data:image/jpeg;base64,abc');
  });

  test('returns url when cert has only url', () => {
    const cert = { name: 'foto.jpg', url: 'https://drive.google.com/xyz' };
    expect(getCertSource(cert)).toBe('https://drive.google.com/xyz');
  });

  test('returns null for null cert', () => {
    expect(getCertSource(null)).toBeNull();
  });
});
