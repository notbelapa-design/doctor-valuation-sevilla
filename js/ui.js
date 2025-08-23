/*
 * UI state and helper functions.
 * Provides formatting utilities and binds HTML controls to chart updates.
 */
export const state = {
  specialtyKey: null,
  years: 35,
  showReal: false,
  toggles: { house: false, car: false, family: false },
  house: { price: 275000, startYear: 2 },
  car: { price: 26000, startYear: 0 },
  family: { annual_cost: 8000 }
};

/** Format number as euro currency without cents. */
export function fmtEuro(v) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency', currency: 'EUR', maximumFractionDigits: 0
  }).format(v);
}

// Elements references (populated at runtime)
export const refs = {};

/**
 * Populate specialty dropdown from data and set default.
 * @param {Array} specialties List of specialty objects from JSON.
 */
export function loadSpecialtyOptions(specialties) {
  const select = document.getElementById('specialtySelect');
  specialties.forEach(spec => {
    const opt = document.createElement('option');
    opt.value = spec.key;
    opt.textContent = spec.name;
    select.appendChild(opt);
  });
  // default to first specialty
  if (specialties.length > 0) {
    state.specialtyKey = specialties[0].key;
    select.value = state.specialtyKey;
  }
  select.addEventListener('change', () => {
    state.specialtyKey = select.value;
    window.updateAll();
  });
}

/** Setup event handlers for toggles and inputs. */
export function setupControls() {
  refs.toggleReal = document.getElementById('toggleReal');
  refs.toggleHouse = document.getElementById('toggleHouse');
  refs.toggleCar = document.getElementById('toggleCar');
  refs.toggleFamily = document.getElementById('toggleFamily');
  refs.housePrice = document.getElementById('housePrice');
  refs.carPrice = document.getElementById('carPrice');
  refs.familyCost = document.getElementById('familyCost');
  // assign defaults
  refs.housePrice.value = state.house.price;
  refs.carPrice.value = state.car.price;
  refs.familyCost.value = state.family.annual_cost;
  // event listeners
  refs.toggleReal.addEventListener('change', () => {
    state.showReal = refs.toggleReal.checked;
    window.updateAll();
  });
  refs.toggleHouse.addEventListener('change', () => {
    state.toggles.house = refs.toggleHouse.checked;
    window.updateAll();
  });
  refs.toggleCar.addEventListener('change', () => {
    state.toggles.car = refs.toggleCar.checked;
    window.updateAll();
  });
  refs.toggleFamily.addEventListener('change', () => {
    state.toggles.family = refs.toggleFamily.checked;
    window.updateAll();
  });
  refs.housePrice.addEventListener('input', () => {
    const val = parseFloat(refs.housePrice.value);
    if (!isNaN(val)) state.house.price = val;
    window.updateAll();
  });
  refs.carPrice.addEventListener('input', () => {
    const val = parseFloat(refs.carPrice.value);
    if (!isNaN(val)) state.car.price = val;
    window.updateAll();
  });
  refs.familyCost.addEventListener('input', () => {
    const val = parseFloat(refs.familyCost.value);
    if (!isNaN(val)) state.family.annual_cost = val;
    window.updateAll();
  });
}

/** Update snapshot cards with current specialty data. */
export function updateSnapshots(spec, series) {
  const snap = document.getElementById('snapshots');
  snap.innerHTML = '';
  const card = (title, value) => {
    const div = document.createElement('div');
    div.className = 'col-md-3 mb-3';
    div.innerHTML = `<div class="card shadow-sm"><div class="card-body"><h6 class="card-title text-muted">${title}</h6><p class="card-text fs-5 fw-semibold">${value}</p></div></div>`;
    return div;
  };
  const grossFirst = series.gross[0];
  const netFirst = series.net[0];
  snap.classList.add('row');
  snap.appendChild(card('Gross (yr 1)', fmtEuro(grossFirst)));
  snap.appendChild(card('Net (yr 1)', fmtEuro(netFirst)));
  snap.appendChild(card('Hours/week', spec.hours_per_week));
  snap.appendChild(card('Doctors in Sevilla', spec.doctors_est));
}

/** Render job cards filtered by specialty. */
export function renderJobs(jobs, specialtyKey) {
  const list = document.getElementById('jobList');
  list.innerHTML = '';
  const filtered = jobs.filter(job => !specialtyKey || job.specialty_key === specialtyKey);
  filtered.forEach(job => {
    const div = document.createElement('div');
    div.className = 'col-md-6 col-lg-4 mb-3';
    div.innerHTML = `<div class="card h-100"><div class="card-body">
      <h6 class="card-title">${job.title}</h6>
      <p class="small text-muted mb-1">${job.employer}</p>
      <p class="mb-1"><strong>Salary:</strong> ${fmtEuro(job.salary_gross_min)}${job.salary_gross_max && job.salary_gross_max !== job.salary_gross_min ? '–' + fmtEuro(job.salary_gross_max) : ''}</p>
      <p class="mb-1"><strong>Contract:</strong> ${job.contract}</p>
      <a href="${job.source}" class="small">Source</a>
    </div></div>`;
    list.appendChild(div);
  });
}
