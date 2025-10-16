import express from 'express';
import {
    getProfileController,
} from './user.controller';
import { authenticate } from '../../../middlewares/auth.middleware';

const userRoutes = express.Router();

userRoutes.get('/profile', authenticate, getProfileController);

export default userRoutes;