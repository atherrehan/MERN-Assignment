import { db } from './index';
import { country, state } from './schema';

/**
 * Dev seed: 5 countries and 10 states with a mix of active/inactive rows.
 * Every country gets at least one ACTIVE state. Re-runnable: clears both tables
 * first (states before countries to respect the FK).
 */
async function seed() {
  await db.delete(state);
  await db.delete(country);

  const countries = await db
    .insert(country)
    .values([
      { code: 'PK', name: 'Pakistan', isActive: true },
      { code: 'US', name: 'United States', isActive: true },
      { code: 'CA', name: 'Canada', isActive: true },
      { code: 'AU', name: 'Australia', isActive: false },
      { code: 'GB', name: 'United Kingdom', isActive: true },
    ])
    .returning();

  const id = Object.fromEntries(countries.map((c) => [c.code, c.id])) as Record<string, number>;

  await db.insert(state).values([
    // Pakistan — 1 active, 1 inactive
    { code: 'PB', name: 'Punjab', countryId: id.PK, isActive: true },
    { code: 'SD', name: 'Sindh', countryId: id.PK, isActive: false },
    // United States — 2 active, 1 inactive
    { code: 'CA', name: 'California', countryId: id.US, isActive: true },
    { code: 'NY', name: 'New York', countryId: id.US, isActive: true },
    { code: 'TX', name: 'Texas', countryId: id.US, isActive: false },
    // Canada — 1 active, 1 inactive
    { code: 'ON', name: 'Ontario', countryId: id.CA, isActive: true },
    { code: 'QC', name: 'Quebec', countryId: id.CA, isActive: false },
    // Australia (country inactive) — still 1 active state
    { code: 'NSW', name: 'New South Wales', countryId: id.AU, isActive: true },
    // United Kingdom — 1 active, 1 inactive
    { code: 'ENG', name: 'England', countryId: id.GB, isActive: true },
    { code: 'SCT', name: 'Scotland', countryId: id.GB, isActive: false },
  ]);

  console.log(`Seeded ${countries.length} countries and 10 states.`);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
