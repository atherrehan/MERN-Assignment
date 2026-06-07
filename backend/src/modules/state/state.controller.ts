import { asyncHandler } from '../../common/async-handler';
import { ok } from '../../common/api-response';
import { StateService } from './state.service';
import type {
  CreateStateInput,
  UpdateStateInput,
  StateIdParam,
  StateSearchInput,
} from './state.validation';

/**
 * HTTP wiring for states. Each method only: reads validated input, calls the
 * matching service method, and responds via ok(). No business logic, no DB.
 */
export class StateController {
  private readonly service = new StateService();

  search = asyncHandler(async (_req, res) => {
    const query = res.locals.validated.query as StateSearchInput;
    const result = await this.service.search(query);
    res.json(ok(result, 'States fetched'));
  });

  getById = asyncHandler(async (_req, res) => {
    const { id } = res.locals.validated.params as StateIdParam;
    const state = await this.service.getById(id);
    res.json(ok(state, 'State fetched'));
  });

  create = asyncHandler(async (_req, res) => {
    const dto = res.locals.validated.body as CreateStateInput;
    const state = await this.service.create(dto);
    res.status(201).json(ok(state, 'State created'));
  });

  update = asyncHandler(async (_req, res) => {
    const { id } = res.locals.validated.params as StateIdParam;
    const dto = res.locals.validated.body as UpdateStateInput;
    const state = await this.service.update(id, dto);
    res.json(ok(state, 'State updated'));
  });

  remove = asyncHandler(async (_req, res) => {
    const { id } = res.locals.validated.params as StateIdParam;
    await this.service.remove(id);
    res.json(ok(null, 'State deleted'));
  });
}
