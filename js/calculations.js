/*
 * Pure mathematical functions for salary, tax and wealth calculations.
 * These functions have no side effects and accept plain data.
 */

/** Progressive income tax calculator.
 * @param {number} gross - gross income for the year.
 * @param {Array<{up_to: number|null, rate: number}>} brackets - tax brackets sorted by upper bound.
 */
export function incomeTax(gross, brackets) {
  let taxableIncome = gross;
  let lower = 0;
  let tax = 0;
  for (const bracket of brackets) {
    const upper = bracket.up_to == null ? Infinity : bracket.up_to;
    if (taxableIncome <= lower) break;
    // compute portion in this bracket
    const amount = Math.min(taxableIncome, upper) - lower;
    if (amount > 0) {
      tax += amount * bracket.rate;
    }
    lower = upper;
  }
  return tax;
}

/** Compute social security contribution (simple rate with optional cap).
 * @param {number} gross - gross salary.
 * @param {number} rate - employee social security rate.
 * @param {number} cap - upper limit for base (optional; Infinity means no cap).
 */
export function socialSecurity(gross, rate, cap = Infinity) {
  const base = Math.min(gross, cap);
  return base * rate;
}

/** Generate a series of gross salaries applying annual inflation.
 * @param {number} base - initial gross salary.
 * @param {number} years - number of years.
 * @param {number} salaryInfl - annual salary increase rate.
 * @returns {number[]} an array of gross salaries for each year.
 */
export function salarySeries(base, years, salaryInfl) {
  const arr = [];
  for (let y = 0; y < years; y++) {
    arr.push(base * Math.pow(1 + salaryInfl, y));
  }
  return arr;
}

/** Compute annuity payment for a loan.
 * @param {number} principal - principal amount.
 * @param {number} rate - annual interest rate (e.g., 0.03 for 3%).
 * @param {number} term - term in years.
 */
export function annuityPayment(principal, rate, term) {
  const r = rate;
  const n = term;
  if (r === 0) return principal / n;
  return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

/** Build series for salaries, disposable income and cumulative net worth.
 * Accepts a config object and toggles for expenses.
 */
export function buildSeries({
  baseGross,
  years,
  salaryInfl,
  taxBrackets,
  ssRate,
  mortgage,
  car,
  family,
  toggles,
  investReturn,
  realCPI
}) {
  // compute gross salary series
  const gross = salarySeries(baseGross, years, salaryInfl);
  // compute annual net salary after taxes and social security
  const net = gross.map(g => {
    const tax = incomeTax(g, taxBrackets);
    const ss = socialSecurity(g, ssRate);
    return g - tax - ss;
  });
  // initialize expense array
  const expenses = Array(years).fill(0);
  // mortgage expenses
  if (toggles.house && mortgage && typeof mortgage.housePrice === 'number') {
    const start = mortgage.startYear || 0;
    const H = mortgage.housePrice;
    const dep = H * (mortgage.deposit_pct ?? 0.2);
    const costs = H * (mortgage.one_off_purchase_cost_pct ?? 0.1);
    const principal = H - dep;
    const pay = annuityPayment(principal, mortgage.rate || 0.03, mortgage.term_years || 30);
    if (start < years) {
      expenses[start] += dep + costs;
      for (let y = start; y < Math.min(years, start + (mortgage.term_years || 30)); y++) {
        expenses[y] += pay;
      }
    }
  }
  // car expenses
  if (toggles.car && car && typeof car.price === 'number') {
    const start = car.startYear || 0;
    const P = car.price;
    const pay = annuityPayment(P, car.loan_rate || 0.05, car.term_years || 5);
    for (let y = start; y < Math.min(years, start + (car.term_years || 5)); y++) {
      expenses[y] += pay;
    }
  }
  // family expenses
  if (toggles.family && family && typeof family.annual_cost === 'number') {
    for (let y = 0; y < years; y++) {
      expenses[y] += family.annual_cost;
    }
  }
  // compute free cash flow (net salary minus expenses)
  const fcf = net.map((n, i) => n - expenses[i]);
  // accumulate to compute cumulative net worth
  const cnw = [];
  let acc = 0;
  for (let i = 0; i < years; i++) {
    acc = (acc + fcf[i]) * (1 + investReturn);
    cnw.push(acc);
  }
  // convert to real values if needed
  function deflate(array) {
    return array.map((v, i) => v / Math.pow(1 + realCPI, i));
  }
  const result = {
    gross,
    net,
    expenses,
    fcf,
    cnw,
    net_real: deflate(net),
    fcf_real: deflate(fcf),
    cnw_real: deflate(cnw)
  };
  return result;
}
