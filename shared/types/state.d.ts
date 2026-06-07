/** A state belonging to a country. `id` is unique; `countryId` is a FK to Country.id. */
export interface State {
  id: number;
  code: string;
  name: string;
  isActive: boolean;
  countryId: number;
}
