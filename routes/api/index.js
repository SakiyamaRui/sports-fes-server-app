import { Router } from 'express';
var router = Router();

import Team from './team.js';
import Roster from './roster.js';
import User from './user.js';
import Points from './points.js';

router.use('/team', Team);

router.use('/roster', Roster);

router.use('/user', User);

router.use('/points', Points);

export default router;
