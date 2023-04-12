import { Router } from 'express';
var router = Router();

import { getTeamList, teamCreate } from '../../app/Team.js';

/**
 * チーム一覧の取得
 */
router.get('/getList', async (req, res, next) => {
    // チーム一覧の取得
    let teamList = await getTeamList();

    res.json(teamList);
});

/**
 * チームの追加
 */
router.post('/addTeam', async (req, res, next) => {
    //
    if (!req.body.teamName) {
        res.json({result: false, msg: 'チーム名を入力してください'})
    }
    let responce = await teamCreate(req.body.teamName);

    res.json(responce);
})

export default router;