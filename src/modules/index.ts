import { Router } from 'express';
import auth from './user/auth/auth.route';
import user from './user/user/user.route';
const router: Router = Router();

router.use('/auth', auth);
router.use('/user', user);
export default router;
