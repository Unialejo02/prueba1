function mergeCertUrl(contact, gasResponse) {
  if (!contact || !gasResponse || !gasResponse.certUrl) return contact;
  const updated = Object.assign({}, contact);
  updated.cert = Object.assign({}, contact.cert || {});
  updated.cert.url = gasResponse.certUrl;
  return updated;
}

function mergeSheetContacts(localContacts, sheetContacts) {
  const localById = {};
  for (const c of localContacts) {
    localById[c.id] = c;
  }
  return sheetContacts.map(sc => {
    const local = localById[sc.id];
    if (!local || !local.cert || !sc.cert) return sc;
    const mergedCert = Object.assign({}, sc.cert);
    if (local.cert.base64) mergedCert.base64 = local.cert.base64;
    return Object.assign({}, sc, { cert: mergedCert });
  });
}

function hasViewableCert(cert) {
  return !!cert;
}

function getCertSource(cert) {
  if (!cert) return null;
  if (cert.url) return cert.url;
  if (cert.base64) return cert.base64;
  return null;
}

if(typeof module !== 'undefined' && module.exports) module.exports = { mergeCertUrl, mergeSheetContacts, hasViewableCert, getCertSource };
