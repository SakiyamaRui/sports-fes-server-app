import { Router } from 'express';
var router = Router();

import { getRosterData } from '../../app/Roster/getRoster.js';
import { userRegist } from '../../app/Roster/regist.js';
import checkRosterAccessCheck from '../../app/Team/checkTeamRosterAccess.js';

router.get('/getList', async (req, res) => {
    //
    try {
        let game_id = req.query['game_id'];
        let team_id = req.query['team_id'];

        // セッションの確認
        let permissionResult = await checkRosterAccessCheck(req, res, team_id, true);

        if (!permissionResult) {
            return false;
        }

        if (permissionResult == 'Access denied') {
            res.json(403, {
                type: 'access_denied',
            });
            return false;
        }

        let result = await getRosterData(
            game_id,
            team_id,
            null
        );

        if (!result) {
            res.send(403);
        }

        res.json(result);
    }catch (e) {
        console.log(e)
        res.send(404);
    }
});

router.use('/changeRoster', async (req, res) => {
    //
    try {
        let roster_id = req.query['roster_id'];
        let student_id = req.query['student_id'];

        //
        let result = await userRegist(roster_id, student_id);

        if (!result) {
            res.send(403);
        }

        res.json(result);
    }catch (e) {
        //
        console.log(e);
        res.send(500);
    }
});

export default router;