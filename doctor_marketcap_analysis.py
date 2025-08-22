"""
This script computes an approximate market valuation for doctors practising in the
province of Seville (Andalusia, Spain).  It uses demographic figures from the
2024 demographic report published by the Consejo Andaluz de Colegios de Médicos
(CACM) and publicly reported salary ranges to estimate the total salary
expenditure (market cap) for the medical profession in the province.

Key assumptions
----------------
* **Number of active doctors**: According to the CACM 2024 report there are
  9,631 doctors in active service in Seville (including both public and
  private sectors)【282232784900643†L212-L223】.  This figure is used as the
  baseline number of practising doctors.
* **Average salary**: Glassdoor salary data for doctors in Seville reports
  an average gross salary around €48,000 per year with a range between
  €36k–€63k【93213640509497†L20-L36】.  To account for uncertainty the script
  can optionally run the calculation with alternative average salaries
  (e.g. €55k or €65k) representing different scenarios.
* **High‑earning specialities**: Specialities such as dermatology, gynaecology
  and invasive cardiology can exceed €100k per year【738407194350164†L596-L604】.
  For a rough estimate the script assumes that the top 5 % of doctors
  correspond to these high‑earning specialists and assigns them an average
  salary of €110k.

The output includes:
* The number of doctors in the top 5 % and their combined payroll.
* The number of doctors in the remaining 95 % and their combined payroll.
* The total annual salary expenditure (market cap) across all doctors.

This script is written for educational purposes to illustrate how one might
approximate the economic size of the medical profession in a region using
publicly available data and reasonable assumptions.
"""

from __future__ import annotations

import argparse
import json


def compute_market_cap(
    n_active: int = 9631,
    avg_salary: float = 48_000.0,
    high_percentile: float = 0.05,
    high_salary: float = 110_000.0,
) -> dict[str, float]:
    """Estimate the total annual payroll for doctors in Seville.

    Args:
        n_active: Number of active doctors (default from CACM 2024 report).
        avg_salary: Average annual salary for most doctors.
        high_percentile: Fraction of doctors assumed to earn the high salary.
        high_salary: Average salary for the top-earning specialities.

    Returns:
        A dictionary with counts and payrolls for the high‑earning group,
        remaining group and the overall market cap.
    """
    # Determine number of doctors in the high‑earning group
    count_high = int(round(n_active * high_percentile))
    count_remaining = n_active - count_high

    # Compute payrolls
    total_high_payroll = count_high * high_salary
    total_remaining_payroll = count_remaining * avg_salary
    total_market_cap = total_high_payroll + total_remaining_payroll

    return {
        "n_active": n_active,
        "avg_salary": avg_salary,
        "high_percentile": high_percentile,
        "high_salary": high_salary,
        "count_high": count_high,
        "count_remaining": count_remaining,
        "total_high_payroll": total_high_payroll,
        "total_remaining_payroll": total_remaining_payroll,
        "total_market_cap": total_market_cap,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Estimate doctor market cap in Seville")
    parser.add_argument(
        "--avg-salary",
        type=float,
        default=48_000.0,
        help="Average annual salary for a doctor (default: 48k)",
    )
    parser.add_argument(
        "--high-salary",
        type=float,
        default=110_000.0,
        help="Average salary for top-earning specialities (default: 110k)",
    )
    parser.add_argument(
        "--n-active",
        type=int,
        default=9631,
        help="Number of active doctors in Seville (default: 9631)",
    )
    parser.add_argument(
        "--percent-high",
        type=float,
        default=0.05,
        help="Fraction of doctors assumed to be high earners (default: 0.05)",
    )
    parser.add_argument(
        "--json-out",
        type=str,
        default=None,
        help="Path to write the result as JSON. If not provided, result is printed.",
    )
    args = parser.parse_args()

    result = compute_market_cap(
        n_active=args.n_active,
        avg_salary=args.avg_salary,
        high_percentile=args.percent_high,
        high_salary=args.high_salary,
    )

    if args.json_out:
        with open(args.json_out, "w", encoding="utf-8") as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
    else:
        # Pretty‑print results in a human‑readable format
        print(
            f"Number of active doctors: {result['n_active']}\n"
            f"Average salary (remaining 95\u00a0%): €{result['avg_salary']:,.2f}\n"
            f"Top {int(result['high_percentile'] * 100)}\u00a0% count: {result['count_high']}, "
            f"with average salary €{result['high_salary']:,.2f}\n"
            f"Total payroll for high earners: €{result['total_high_payroll'] / 1e6:,.2f}M\n"
            f"Total payroll for remaining doctors: €{result['total_remaining_payroll'] / 1e6:,.2f}M\n"
            f"Estimated total market cap (annual salary expenditure): "
            f"€{result['total_market_cap'] / 1e6:,.2f}M"
        )


if __name__ == "__main__":  # pragma: no cover
    main
