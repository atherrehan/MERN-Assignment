import { asyncHandler } from '../../common/async-handler';
import { ok } from '../../common/api-response';
import type { ValidatedLocals } from '../../common/validate';
import type { BulkDeleteInput } from '../../common/bulk';
import { StateService } from './state.service';
import type {
  CreateStateInput,
  UpdateStateInput,
  StateIdParam,
  StateSearchInput,
} from './state.validation';

/**
 * HTTP wiring for states. Each method only: reads validated input (typed via the
 * Locals type parameter), calls the matching service method, and responds via
 * ok(). No business logic, no DB.
 */
export class StateController {
  private readonly service = new StateService();

  search = asyncHandler<ValidatedLocals<{ query: StateSearchInput }>>(async (_req, res) => {
    const result = await this.service.search(res.locals.validated.query);
    res.json(ok(result, 'States fetched'));
  });

  getById = asyncHandler<ValidatedLocals<{ params: StateIdParam }>>(async (_req, res) => {
    const state = await this.service.getById(res.locals.validated.params.id);
    res.json(ok(state, 'State fetched'));
  });

  create = asyncHandler<ValidatedLocals<{ body: CreateStateInput }>>(async (_req, res) => {
    const state = await this.service.create(res.locals.validated.body);
    res.status(201).json(ok(state, 'State created'));
  });

  update = asyncHandler<ValidatedLocals<{ params: StateIdParam; body: UpdateStateInput }>>(
    async (_req, res) => {
      const { params, body } = res.locals.validated;
      const state = await this.service.update(params.id, body);
      res.json(ok(state, 'State updated'));
    },
  );

  remove = asyncHandler<ValidatedLocals<{ params: StateIdParam }>>(async (_req, res) => {
    await this.service.remove(res.locals.validated.params.id);
    res.json(ok(null, 'State deleted'));
  });

  bulkDelete = asyncHandler<ValidatedLocals<{ body: BulkDeleteInput }>>(async (_req, res) => {
    const deletedCount = await this.service.bulkDelete(res.locals.validated.body.ids);
    res.json(ok({ deletedCount }, `Deleted ${deletedCount} state${deletedCount === 1 ? '' : 's'}`));
  });
}
