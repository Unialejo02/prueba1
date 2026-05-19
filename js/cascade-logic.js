(function() {
  const _getMunicipalities = typeof require === 'function'
    ? require('./geo-catalog').getMunicipalities
    : window.getMunicipalities;
  const _getVotingStations = typeof require === 'function'
    ? require('./geo-catalog').getVotingStations
    : window.getVotingStations;
  const _getDepartments = typeof require === 'function'
    ? require('./geo-catalog').getDepartments
    : window.getDepartments;
  const _getBarriosCali = typeof require === 'function'
    ? require('./geo-catalog').getBarriosCali
    : window.getBarriosCali;
  const _getComunaByBarrio = typeof require === 'function'
    ? require('./geo-catalog').getComunaByBarrio
    : window.getComunaByBarrio;

  function initCascade() {
    return { department: null, municipality: null, votingStation: null, municipalities: [], votingStations: [] };
  }

  function selectDepartment(state, code) {
    return {
      department: code,
      municipality: null,
      votingStation: null,
      municipalities: _getMunicipalities(code),
      votingStations: [],
    };
  }

  function selectMunicipality(state, code) {
    return {
      department: state.department,
      municipality: code,
      votingStation: null,
      municipalities: state.municipalities,
      votingStations: _getVotingStations(code),
    };
  }

  function selectVotingStation(state, code) {
    return {
      department: state.department,
      municipality: state.municipality,
      votingStation: code,
      municipalities: state.municipalities,
      votingStations: state.votingStations,
    };
  }

  function buildLocationData(state, barrioName) {
    const depts = _getDepartments();
    const dept = depts.find(d => d.code === state.department);
    const allMuns = state.department ? _getMunicipalities(state.department) : [];
    const mun = allMuns.find(m => m.code === state.municipality);
    const allStations = state.municipality ? _getVotingStations(state.municipality) : [];
    const station = allStations.find(s => s.code === state.votingStation);
    const isCali = state.municipality === '76001';
    let comuna = null;
    if (isCali && barrioName) {
      comuna = _getComunaByBarrio(barrioName);
    }
    return {
      departamento: dept ? dept.name : '',
      municipio: mun ? mun.name : '',
      puesto: station ? station.name : '',
      barrio: barrioName || '',
      comuna: comuna,
    };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initCascade, selectDepartment, selectMunicipality, selectVotingStation, buildLocationData };
  } else {
    window.initCascade = initCascade;
    window.selectDepartment = selectDepartment;
    window.selectMunicipality = selectMunicipality;
    window.selectVotingStation = selectVotingStation;
    window.buildLocationData = buildLocationData;
  }
})();
