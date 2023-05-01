import {
    getConnection,
    query,
} from '../DB/database.js';

// 各競技用のポイント付与

const option = {
    // ゲームID
    'game_id': '10003',
    // チームID
    'team_id': '00032',
    // ポイント数
    'points': 3,
    // ポイントラベル
    'label': '41',
}

const GiveSportsGamePoint = async (option) => {
    try {
        var connection = await getConnection();
    }catch (e) {
        //
        console.log(e);
        return false;
    }

    try {
        let result = await query(
            "INSERT INTO `userPoints`(\
                `student_id`,\
                `point_type`,\
                `label_id`,\
                `point`\
            )\
            SELECT\
                `student_id`,\
                0,\
                ?,\
                ?\
            FROM\
                `gameContestantRoster`\
            WHERE\
                `game_id` = ? AND `team_id` = ?;",
            [option.label, option.points, option.game_id, option.team_id],
            connection
        );

        console.log(result.results);
    }catch (e) {
        console.log(e);
    }finally {
        connection.release();
    }
}

GiveSportsGamePoint(option);