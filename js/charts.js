import { fmtEuro } from './ui.js';

/**
 * Create and return a Chart.js instance for annual disposable vs free cash flow.
 * @param {HTMLCanvasElement} ctx The canvas element.
 */
export function makeAnnualChart(ctx) {
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        {
          label: 'ADI (no expenses)',
          data: [],
          borderColor: '#0057b8',
          backgroundColor: 'rgba(0,87,184,0.1)',
          borderWidth: 2,
        },
        {
          label: 'FCF (after expenses)',
          data: [],
          borderColor: '#38a169',
          backgroundColor: 'rgba(56,161,105,0.1)',
          borderWidth: 2,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      scales: {
        y: {
          ticks: {
            callback: (value) => fmtEuro(value)
          },
          title: {
            display: true,
            text: '€/year'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Years'
          }
        }
      },
      plugins: {
        legend: { position: 'bottom' },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${fmtEuro(ctx.parsed.y)}`
          }
        }
      }
    }
  });
}

/**
 * Create and return a Chart.js instance for cumulative net worth.
 * @param {HTMLCanvasElement} ctx The canvas element.
 */
export function makeWealthChart(ctx) {
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        {
          label: 'CNW (nominal)',
          data: [],
          borderColor: '#0c4a6e',
          backgroundColor: 'rgba(12,74,110,0.1)',
          borderWidth: 3,
        },
        {
          label: 'CNW (real €)',
          data: [],
          borderColor: '#a855f7',
          backgroundColor: 'rgba(168,85,247,0.1)',
          borderDash: [6,6],
          borderWidth: 2,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      scales: {
        y: {
          ticks: {
            callback: (value) => fmtEuro(value)
          },
          title: {
            display: true,
            text: '€'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Years'
          }
        }
      },
      plugins: {
        legend: { position: 'bottom' },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${fmtEuro(ctx.parsed.y)}`
          }
        }
      }
    }
  });
}
