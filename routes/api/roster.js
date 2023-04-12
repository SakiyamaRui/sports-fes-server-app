import { Router } from 'express';
var router = Router();

import { getRosterData } from '../../app/Roster/getRoster.js';
import { userRegist } from '../../app/Roster/regist.js';

router.get('/getList', async (req, res) => {
    //
    try {
        let game_id = req.query['game_id'];
        let team_id = req.query['team_id'];

        // セッションの確認
        let student_id = '211216';

        let result = await getRosterData(
            game_id,
            team_id,
            student_id
        );

        if (!result) {
            res.send(403);
        }

        res.json(result);
    }catch (e) {
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