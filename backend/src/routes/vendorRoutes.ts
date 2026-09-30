import { Router } from 'express';
import { VendorController } from '../controllers/vendorController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateVendorSchema } from '../validators/entityValidators';

const router = Router();

router.patch('/:vendorId', authenticate, validate(updateVendorSchema), VendorController.update);
router.delete('/:vendorId', authenticate, VendorController.delete);

export default router;
