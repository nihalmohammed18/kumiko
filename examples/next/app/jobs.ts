const roles = ["Product designer", "Frontend engineer", "UX researcher", "Support engineer", "Junior developer"];
const companies = ["Maple Studio", "Cedar Labs", "Fieldwork", "Northstar", "Kumiko"];
const locations = ["Remote", "Bengaluru", "London"];
const statuses = ["Applied", "Interview", "Offer"];

/** A complete local dataset shared by browsing and application tracking.
 * Use when: exercising client filtering and sorting. Avoid when: representing live vacancies.
 */
export const jobs = Array.from({ length: 50 }, (_, index) => ({
  id: `job-${index + 1}`,
  role: roles[index % roles.length]!,
  company: companies[Math.floor(index / roles.length) % companies.length]!,
  location: locations[index % locations.length]!,
  status: statuses[index % statuses.length]!,
}));

/** One serializable job-board record.
 * Use when: passing jobs from server pages to client views. Avoid when: storing an account profile.
 */
export type Job = (typeof jobs)[number];
