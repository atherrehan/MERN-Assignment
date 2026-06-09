import { Router } from 'express';
import { validate } from '../../common/validate';
import { bulkDeleteSchema } from '../../common/bulk';
import { CountryController } from './country.controller';
import {
  createCountrySchema,
  updateCountrySchema,
  countryIdParamSchema,
  countrySearchSchema,
} from './country.validation';

const router = Router();
const controller = new CountryController();

// `/search` must be declared before `/:id`, else ":id" would capture "search".
router.get('/search', validate(countrySearchSchema, 'query'), controller.search);
router.get('/:id', validate(countryIdParamSchema, 'params'), controller.getById);
router.post('/bulk-delete', validate(bulkDeleteSchema, 'body'), controller.bulkDelete);
router.post('/', validate(createCountrySchema, 'body'), controller.create);
router.put(
  '/:id',
  validate(countryIdParamSchema, 'params'),
  validate(updateCountrySchema, 'body'),
  controller.update,
);
router.delete('/:id', validate(countryIdParamSchema, 'params'), controller.remove);

export const countryRouter = router;
