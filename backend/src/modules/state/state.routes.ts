import { Router } from 'express';
import { validate } from '../../common/validate';
import { bulkDeleteSchema } from '../../common/bulk';
import { StateController } from './state.controller';
import {
  createStateSchema,
  updateStateSchema,
  stateIdParamSchema,
  stateSearchSchema,
} from './state.validation';

const router = Router();
const controller = new StateController();

// `/search` must be declared before `/:id`, else ":id" would capture "search".
router.get('/search', validate(stateSearchSchema, 'query'), controller.search);
router.get('/:id', validate(stateIdParamSchema, 'params'), controller.getById);
router.post('/bulk-delete', validate(bulkDeleteSchema, 'body'), controller.bulkDelete);
router.post('/', validate(createStateSchema, 'body'), controller.create);
router.put(
  '/:id',
  validate(stateIdParamSchema, 'params'),
  validate(updateStateSchema, 'body'),
  controller.update,
);
router.delete('/:id', validate(stateIdParamSchema, 'params'), controller.remove);

export const stateRouter = router;
