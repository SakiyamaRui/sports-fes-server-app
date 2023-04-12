import { getConnection, query } from '../index.js';
import { getGameData } from '../Game/getGameData.js';

const getRosterData = async (game_id, team_id, student_id) => {
    // コネクションの取得

    try {
        var connection = await getConnection();

        if (!connection) throw 'DB Connection Error';
    }catch (e) {
        throw e;
    }

    try {
        if (!permissionCheck(student_id, connection)) {
            return false;
        }

        // 取得するクエリの実行
        let res = await query(
            'SELECT\
                `gameContestantRoster`.`roster_id`,\
                `gameContestantRoster`.`position_id`,\
                `gameContestantRoster`.`student_id`,\
                `gameContestantRoster`.`changed`,\
                `gameContestantRoster`.`joined`,\
                `gamePositionLabels`.`position_name`,\
                `userMaster`.`grade`,\
                `userMaster`.`class_num`,\
                `userMaster`.`attendance_num`,\
                `userMaster`.`username`\
            FROM\
                `gameContestantRoster`\
            INNER JOIN\
                `gamePositionLabels`\
            ON\
                `gameContestantRoster`.`position_id` = `gamePositionLabels`.`position_id`\
            LEFT JOIN\
                `userMaster`\
            ON\
                `gameContestantRoster`.`student_id` = `userMaster`.`student_id`\
            WHERE\
                `game_id` = ? AND `team_id` = ?\
            ORDER BY\
                `gameContestantRoster`.`roster_id`',
            [game_id, team_id],
            connection
        ); 

        // 
        if (res.results.length == 0) {
            throw 'Data Not Found';
        }

        // データをフォーマット化
        let dataTree = {};


        res.results.forEach(elm => {
            if (!dataTree.hasOwnProperty(elm.position_id)) {
                dataTree[elm.position_id] = {
                    PositionName: elm.position_name,
                    Number: 0,
                    PositionId: elm.position_id,
                    Input: []
                };
            }

            // データをプッシュ
            dataTree[elm.position_id].Number++;
            dataTree[elm.position_id].Input.push(
                {
                    Id: elm.roster_id,
                    Value: {
                        UserId: elm.student_id,
                        UserName: elm.username,
                        grade: elm.grade,
                        classNum: elm.class_num,
                        attendanceNum: elm.attendance_num,
                    }
                }
            );
        });

        // ゲームデータの取得
        let gameData = await getGameData(game_id, connection);

        // チームデータの取得
        let teamDataRes = await query(
            'SELECT * FROM `teamList` WHERE `team_id` = ?',
            [team_id],
            connection
        );

        if (!gameData) {
            throw 'Game Not Found';
        }

        if (teamDataRes.results.length == 0) {
            throw 'Team Not Found';
        }

        // コネクションの開放
        connection.release();

        // フォーマットして返す
        return {
            'Version': '1.0.0',
            'SportsId': gameData.game_id,
            'SportsName': gameData.game_name,
            'TeamName': teamDataRes.results[0].team_name,
            'TeamId': teamDataRes.results[0].team_id,
            'Roster': Object.values(dataTree)
        };

    }catch (e) {
        //
        connection.release();
    }
}


// 権限管理
const permissionCheck = async (student_id, connection) => {
    // 
    return true;
}


export {
    getRosterData
} 