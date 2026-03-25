import { Router } from 'express';
import { createProfile, readProfiles, updateProfile, deleteProfile } from '../controllers/profileController.js';

const router = Router();

router.post('/', createProfile);
router.get('/', readProfiles);
router.patch('/:id', updateProfile);
router.delete('/:id', deleteProfile);

export default router;
