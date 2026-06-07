import { asyncHandler } from '../../common/async-handler';
import { ok } from '../../common/api-response';
import { CountryService } from './country.service';
import type {
  CreateCountryInput,
  UpdateCountryInput,
  CountryIdParam,
  CountrySearchInput,
} from './country.validation';

/**
 * HTTP wiring for countries. Each method only: reads validated input, calls the
 * matching service method, and responds with the standard ApiResponse via ok().
 * No business logic, no DB. Methods are arrow fields so `this` binds when used
 * as Express handlers, and each is wrapped with asyncHandler.
 */
export class CountryController {
  private readonly service = new CountryService();

  search = asyncHandler(async (_req, res) => {
    const query = res.locals.validated.query as CountrySearchInput;
    const result = await this.service.search(query);
    res.json(ok(result, 'Countries fetched'));
  });

  getById = asyncHandler(async (_req, res) => {
    const { id } = res.locals.validated.params as CountryIdParam;
    const country = await this.service.getById(id);
    res.json(ok(country, 'Country fetched'));
  });

  create = asyncHandler(async (_req, res) => {
    const dto = res.locals.validated.body as CreateCountryInput;
    const country = await this.service.create(dto);
    res.status(201).json(ok(country, 'Country created'));
  });

  update = asyncHandler(async (_req, res) => {
    const { id } = res.locals.validated.params as CountryIdParam;
    const dto = res.locals.validated.body as UpdateCountryInput;
    const country = await this.service.update(id, dto);
    res.json(ok(country, 'Country updated'));
  });

  remove = asyncHandler(async (_req, res) => {
    const { id } = res.locals.validated.params as CountryIdParam;
    await this.service.remove(id);
    res.json(ok(null, 'Country deleted'));
  });
}
