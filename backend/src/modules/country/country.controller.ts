import { asyncHandler } from '../../common/async-handler';
import { ok } from '../../common/api-response';
import type { ValidatedLocals } from '../../common/validate';
import type { BulkDeleteInput } from '../../common/bulk';
import { CountryService } from './country.service';
import type {
  CreateCountryInput,
  UpdateCountryInput,
  CountryIdParam,
  CountrySearchInput,
} from './country.validation';

/**
 * HTTP wiring for countries. Each method only: reads validated input (typed via
 * the Locals type parameter), calls the matching service method, and responds
 * with the standard ApiResponse via ok(). No business logic, no DB.
 */
export class CountryController {
  private readonly service = new CountryService();

  search = asyncHandler<ValidatedLocals<{ query: CountrySearchInput }>>(async (_req, res) => {
    const result = await this.service.search(res.locals.validated.query);
    res.json(ok(result, 'Countries fetched'));
  });

  getById = asyncHandler<ValidatedLocals<{ params: CountryIdParam }>>(async (_req, res) => {
    const country = await this.service.getById(res.locals.validated.params.id);
    res.json(ok(country, 'Country fetched'));
  });

  create = asyncHandler<ValidatedLocals<{ body: CreateCountryInput }>>(async (_req, res) => {
    const country = await this.service.create(res.locals.validated.body);
    res.status(201).json(ok(country, 'Country created'));
  });

  update = asyncHandler<ValidatedLocals<{ params: CountryIdParam; body: UpdateCountryInput }>>(
    async (_req, res) => {
      const { params, body } = res.locals.validated;
      const country = await this.service.update(params.id, body);
      res.json(ok(country, 'Country updated'));
    },
  );

  remove = asyncHandler<ValidatedLocals<{ params: CountryIdParam }>>(async (_req, res) => {
    await this.service.remove(res.locals.validated.params.id);
    res.json(ok(null, 'Country deleted'));
  });

  bulkDelete = asyncHandler<ValidatedLocals<{ body: BulkDeleteInput }>>(async (_req, res) => {
    const result = await this.service.bulkDelete(res.locals.validated.body.ids);
    res.json(
      ok(result, `Deleted ${result.deletedIds.length}, skipped ${result.skipped.length}`),
    );
  });
}
