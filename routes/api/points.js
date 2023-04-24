import { Router } from 'express';
var router = Router();

import { isLogin } from '../../app/User/login.js';
import { getConnection, query } from '../../app/index.js';

// 個人ポイントの取得
router.use('/personal', async (req, res) => {
    // ログインの確認
    let result = await isLogin(req, res, true);

    if (result == false) {
        return false;
    }else if (result == 'error') {
        // エラーのためページを返す
        res.sendStatus(500);
        return false;
    }else if (result == 403) {
        res.sendStatus(403);
        return false;
    }

    // 個人ポイントの取得をする
    try {
        // コネクションの取得
        var connection = await getConnection();

        if (!connection) {
            throw 'connection error';
        }
    }catch (e) {
        connection.release();

        res.send(500);
        return false;
    }

    // 
    try {
        let DBResponse = await query(
            "SELECT `userPoints`.`point_id`, `userPointLabel`.`label_name` as label, `userPoints`.`grant_time` as date, `userPoints`.`point` FROM `userPoints` INNER JOIN `userPointLabel` ON `userPoints`.`label_id` = `userPointLabel`.`label_id` WHERE `userPoints`.`student_id` = ? AND `userPoints`.`deleted` = 0 AND ( `userPoints`.`point_type` = 0 OR `userPoints`.`point_type` = 1 ) ORDER BY `userPoints`.`grant_time` DESC, `userPoints`.`point_id` DESC LIMIT 150",
            [result],
            connection
        );

        res.json(DBResponse.results);
        connection.release();
        return false;
    }catch (e) {
        console.log(e);
        res.send(500);
        connection.release();
        return false;
    }
});

// 

export default router;