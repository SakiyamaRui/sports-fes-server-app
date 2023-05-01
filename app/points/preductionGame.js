

// 勝敗予想ポイント付与

import { query } from "../DB/database";

const option = {
    p_game_id: '',
    rank: {1: '', 2:'', 3: '', 4: '', 5: ''},
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

const preductionGameCommit = async () => {
    // コネクションの取得
    try {
        var connection = await getConnection();
    }catch (e) {
        //
        console.log(e);
        return false;
    }

    try {
        // オッズを取得
        let oddz = await getOddz(option.p_game_id, connection);

        // あたっている人の一覧を取得
        let vote = await query(
            "SELECT\
                `id`,\
                `game_id`,\
                `student_id`,\
                `ranking`,\
                `select_team`\
            FROM\
                `preductionVote`\
            WHERE\
                `game_id` = ? AND\
                (\
                    (`ranking` = 1 AND `select_team` = ?)\
                    OR\
                    (`ranking` = 2 AND `select_team` = ?)\
                    OR\
                    (`ranking` = 3 AND `select_team` = ?)\
                    OR\
                    (`ranking` = 4 AND `select_team` = ?)\
                    OR\
                    (`ranking` = 5 AND `select_team` = ?)\
                )",
            [option.p_game_id, option.rank[1], option.rank[2], option.rank[3], option.rank[4], option.rank[5]],
            connection
        );

        // フォーマット化
        let total = {};
        vote.results.forEach((elm) => {
            if (!total.hasOwnProperty[elm.student_id]) {
                //
            }
        });
    }
}

preductionGameCommit();