import { Router } from 'express';
var router = Router();

import Team from './team.js';
import Roster from './roster.js';
import User from './user.js';
import Points from './points.js';
import Game from './game.js';

router.use('/team', Team);

router.use('/roster', Roster);

router.use('/user', User);

router.use('/points', Points);

router.use('/game', Game);

router.use('/v', (req, res) => {
    res.send('Version: 1.0.0');
})

export default router;
