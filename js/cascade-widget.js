function createCascadeWidget(containerId, onChange) {
  const container = document.getElementById(containerId);
  if (!container) return;

  let state = initCascade();

  function render() {
    container.innerHTML = '';

    const deptGroup = makeSelectGroup('Departamento', 'cascadeDept', getDepartments(), state.department, true, (code) => {
      state = selectDepartment(state, code);
      render();
      if (onChange) onChange(state);
    });

    const munGroup = makeSelectGroup('Municipio', 'cascadeMun', state.municipalities, state.municipality, !!state.department, (code) => {
      state = selectMunicipality(state, code);
      render();
      if (onChange) onChange(state);
    });

    const stationGroup = makeSelectGroup('Puesto de votación', 'cascadeStation', state.votingStations, state.votingStation, !!state.municipality, (code) => {
      state = selectVotingStation(state, code);
      render();
      if (onChange) onChange(state);
    });

    container.appendChild(deptGroup);
    container.appendChild(munGroup);
    container.appendChild(stationGroup);
  }

  render();
  return {
    getState: () => state,
    reset: () => { state = initCascade(); render(); },
  };
}

function makeSelectGroup(label, id, items, selected, enabled, onSelect) {
  const group = document.createElement('div');
  group.className = 'cascade-group';

  const lbl = document.createElement('label');
  lbl.textContent = label;
  lbl.setAttribute('for', id);
  group.appendChild(lbl);

  const input = document.createElement('input');
  input.type = 'text';
  input.id = id;
  input.className = 'cascade-input';
  input.placeholder = selected ? (items.find(i => i.code === selected) || {}).name || '' : (items.length ? 'Escribe para buscar...' : '');
  input.disabled = !enabled;
  if (selected) {
    const found = items.find(i => i.code === selected);
    if (found) input.value = found.name;
  }
  group.appendChild(input);

  const list = document.createElement('div');
  list.className = 'cascade-list hidden';
  group.appendChild(list);

  let filtered = items;

  function showList() {
    filtered = items;
    renderList();
    list.classList.remove('hidden');
  }

  function hideList() {
    setTimeout(() => list.classList.add('hidden'), 150);
  }

  function renderList() {
    list.innerHTML = '';
    if (!filtered.length) {
      list.innerHTML = '<div class="cascade-empty">Sin resultados</div>';
      return;
    }
    filtered.forEach(item => {
      const opt = document.createElement('div');
      opt.className = 'cascade-option' + (item.code === selected ? ' active' : '');
      opt.textContent = item.name;
      opt.addEventListener('mousedown', (e) => {
        e.preventDefault();
        input.value = item.name;
        list.classList.add('hidden');
        onSelect(item.code);
      });
      list.appendChild(opt);
    });
  }

  input.addEventListener('focus', showList);
  input.addEventListener('blur', hideList);
  input.addEventListener('input', () => {
    const q = input.value.toLowerCase();
    filtered = items.filter(i => i.name.toLowerCase().includes(q));
    renderList();
    list.classList.remove('hidden');
  });

  return group;
}
