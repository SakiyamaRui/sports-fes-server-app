import { Router } from 'express';
var router = Router();

import { searchUser } from '../../app/User/search.js';


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

export default router;