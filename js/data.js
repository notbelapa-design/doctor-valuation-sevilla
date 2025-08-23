/*
 * Simple data loader for the static JSON files.
 */
export async function loadData() {
  const [specRes, jobsRes, configRes] = await Promise.all([
    fetch('/data/specialties.sevilla.json'),
    fetch('/data/jobs.sevilla.json'),
    fetch('/data/config.json')
  ]);
  if (!specRes.ok || !jobsRes.ok || !configRes.ok) {
    throw new Error('Failed to load one or more data files');
  }
  const specialties = await specRes.json();
  const jobs = await jobsRes.json();
  const config = await configRes.json();
  return { specialties: specialties.specialties, jobs: jobs.jobs, config };
}
