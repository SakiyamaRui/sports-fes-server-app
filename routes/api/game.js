import { Router } from 'express';
import { isLogin } from '../../app/User/login.js';
import { beginTransaction, getConnection, query, rollback, commit } from '../../app/index.js';
var router = Router();

const setStundentIdCookie = async (req, res) => {
    // Cookie内に
    if (!req.cookies.USER_ID) {
        // セッションの検索
        try {
            //
            let student_id = await isLogin(req, res, true);

            if (result == false) {
                // ログインページへリダイレクト
                return false;
            }else if (result == 'error') {
                // エラーのためページを返す
                res.sendStatus(500);
                return false;
            }else if (result == 403) {
                res.sendStatus(403);
                return false;
            }

            // Cookieにセット
            res.cookie('USER_ID', student_id, {
                maxAge: 1000 * 60 * 60 * 48,
                httpOnly: true,
                sameSite: 'None',
            });
        }catch (e) {
            throw e;
        }
    }

    // 含まれている場合
    return req.cookies.USER_ID;
}

const getOddz = async (pre_g_id, connection) => {

    try {
        let result = await query(
            "SELECT\
            `preductionGameOddz`.*\
            FROM\
                `preductionGameOddz`\
            INNER JOIN(\
                SELECT `game_id`,\
                    `rank`,\
                    `team_id`,\
                    `oddz`,\
                    MAX(`add_time`) as `add_time`\
                FROM\
                    `preductionGameOddz`\
                WHERE\
                    `game_id` = ?\
                GROUP BY\
                    `rank`,\
                    `team_id`\
            ) AS `sub_t`\
            ON\
                `preductionGameOddz`.`game_id` = `sub_t`.`game_id`\
                AND\
                `preductionGameOddz`.`rank` = `sub_t`.`rank`\
                AND\
                `preductionGameOddz`.`team_id` = `sub_t`.`team_id`\
                AND\
                `preductionGameOddz`.`add_time` = `sub_t`.`add_time`",
            [pre_g_id],
            connection
        );

        // データの整理
        let oddzList = {};

        result.results.forEach((elm, i) => {
            if (!oddzList.hasOwnProperty(elm.rank)) {
                oddzList[elm.rank] = {};
            }
            // 値の格納
            oddzList[elm.rank][elm.team_id] = elm.oddz;
        });

        return oddzList;

    }catch (e) {
        return null;
    }
}

router.use('/vote', async (req, res, next) => {
    
    try {
        var student_id = await setStundentIdCookie();

        if (!student_id) {
            return false;
        }
    }catch (err) {
        res.sendStatus(500).send({
            result: 'false',
        });
        return false;
    }


    // ゲームの状況を取得
    try {
        var connection = await getConnection();

        if (!connection) {
            throw 'Connection Error';
        }
    }catch (err) {
        res.sendStatus(500).send({
            result: 'false',
        });
        return false;
    }

    // ゲームのステータスを取得
    try {
        let result = await query(
            'SELECT `status_code` FROM `status` WHERE `status_id` = \'1\'',
            [],
            connection
        );

        var status = result.results[0].status_code;

        switch (status) {
            case 'ServerStop':
            case 'Counting':
            case 'VoteTimeEnd':
                connection.release();
                res.send({
                    status: status,
                    result: 'false',
                });
                return false;
        }
    }catch(e) {
        connection.release();
        res.sendStatus(500).send({
            result: 'false',
        });
        return false;
    }

    // ゲームデータを取得
    try {
        let gameData = await query(
            'SELECT * FROM `preductionGame` WHERE `preduction_g_id` = ?;',
            [status],
            connection
        );

        var numOfVotes = gameData.results[0].vote_type;
    }catch (e) {
        connection.release();
        res.sendStatus(500).send({
            result: 'false',
            status: 'Accepting',
        });
        return false;
    }

    // クエリに投票データが入っているかを確認
    try {
        //
        let userVoteData = req.query['vote'];

        var vote = JSON.parse(userVoteData);
    }catch (e) {
        connection.release();
        res.sendStatus(500).send({
            result: 'false',
            status: 'Accepting',
        });
        return false;
    }

    // 投票の登録処理
    try {
        // トランザクションの開始
        if (!await beginTransaction(connection)) {
            throw 'Transaction Failed';
        }

        for (let i = 1; i <= numOfVotes; i++) {
            // 
            await query(
                'INSERT INTO `preductionVote`(`game_id`, `student_id`, `ranking`, `select_team`) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE `select_team` = ?',
                [status, student_id, i, vote[i - 1], vote[i - 1]],
                connection
            );
        }

        if (await commit(connection)) {
            res.send({
                status: 'Voted',
                result: 'true',
            });
            return true;
        }
    }catch (e) {
        //
        await rollback(connection);
    }finally {
        connection.release();
    }
});

router.use('/getStatus', async (req, res) => {
    
    try {
        var student_id = await setStundentIdCookie(req, res);

        if (!student_id) {
            return false;
        }

    }catch (err) {
        res.sendStatus(500);
        return false;
    }

    try {
        var connection = await getConnection();

        if (!connection) {
            throw 'Connection Error';
        }
    }catch (err) {
        res.sendStatus(500);
        return false;
    }

    // ステータスの取得
    try {
        //
        let result = await query(
            'SELECT `status_code` FROM `status` WHERE `status_id` = \'1\'',
            [],
            connection
        );

        let status = result.results[0].status_code;

        switch (status) {
            // 受付停止中
            case 'ServerStop':
            case 'Counting':
            case 'VoteTimeEnd':
                //
                connection.release();
                res.json({
                    status: status,
                });
                return true;

            default:
                // ゲームの投票中
                
                // ゲームデータの取得
                let preductionGameData = await query(
                    'SELECT\
                        `preductionGame`.`game_name`,\
                        `preductionGame`.`vote_type`,\
                        `gameContestantTeam`.`team_id`,\
                        `teamList`.`team_name`\
                    FROM\
                        `preductionGame`\
                    RIGHT OUTER JOIN\
                        `gameContestantTeam`\
                    ON\
                        `preductionGame`.`game_id` = `gameContestantTeam`.`game_id`\
                    RIGHT OUTER JOIN\
                        `teamList`\
                    ON\
                        `gameContestantTeam`.`team_id` = `teamList`.`team_id`\
                    WHERE\
                        `preduction_g_id` = ?;',
                    [status],
                    connection
                );

                if (preductionGameData.results.length == 0) {
                    throw 'No Game Data';
                }

                // 投票データを取得
                let userPreductionVote = await query(
                    'SELECT * FROM `preductionVote` WHERE `student_id` = ? AND `game_id` = ? ORDER BY `ranking` DESC;',
                    [student_id, status],
                    connection
                );

                // 投票済み
                if (userPreductionVote.results.length > 0) {
                    connection.release();

                    res.json({
                        status: 'Voted',
                    });
                    return true;
                }

                // オッズの取得
                let oddz = await getOddz(status, connection);

                // データの送信
                let responseData = {
                    status: 'Accepting',
                    preductionGameId: status,
                    game_name: preductionGameData.results[0].game_name,
                    teamData: {
                        num: preductionGameData.results[0].vote_type,
                        teamList: preductionGameData.results.map((elm) => {
                            return {
                                team_id: elm.team_id,
                                team_name: elm.team_name
                            };
                        }),
                    },
                    oddz: oddz,
                }

                connection.release();
                res.send(responseData);
                return true;
        }
    }catch (e) {
        console.log(e);
        connection.release();
        res.sendStatus(500);
        return false;
    }
});

export default router;