import { Router } from 'express';
var router = Router();

import { query, getConnection } from '../../app/index.js';
import { searchUser } from '../../app/User/search.js';
import { isLogin } from '../../app/User/login.js';


router.get('/search', async (req, res) => {
    //
    try {
        let result = await searchUser(req.query['student_id']);

        if (!result) {
            result = {
                UserId: null,
                UserName: null,
                grade: null,
                classNum: null,
                attendanceNum: null
            };
        }

        res.json(result);
        return true;
    }catch (err) {
        res.json({
            UserId: null,
            UserName: null,
            grade: null,
            classNum: null,
            attendanceNum: null
        });
        return true;
    }
});

router.get('/username', async (req, res) => {
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

    try {
        // コネクションの取得
        var connection = await getConnection();

        if (!connection) {
            connection.release();
            throw 'connection error';
        }
    }catch (e) {

        res.send(500);
        return false;
    }

    // 
    try {
        let DBResponse = await query(
            "SELECT `username` FROM `userMaster` WHERE `student_id` = ?",
            [result],
            connection
        );

        if (DBResponse.results.length > 0) {
            res.json(DBResponse.results[0].username);
        }else{
            req.json(null);
        }
        connection.release();
        return false;
    }catch (e) {
        console.log(e);
        res.send(500);
        connection.release();
        return false;
    }
});

export default router;