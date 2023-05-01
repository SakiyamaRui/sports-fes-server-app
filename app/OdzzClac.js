import { getConnection, query, rollback, commit, beginTransaction } from "./DB/database.js";

const optionTemplate = {
    game_id: "予想ゲームID"
}

const clacOdzz = async (option, connection) => {
    // 投票を集計
    try {
        // 参加チームを取得
        let teamList = await query(
            "SELECT\
                `gameContestantTeam`.`team_id`,\
                `teamList`.`team_name`\
            FROM\
                `preductionGame`\
            RIGHT OUTER JOIN\
                `gameContestantTeam`\
            ON\
                `preductionGame`.`game_id` = `gameContestantTeam`.`game_id`\
            INNER JOIN\
                `teamList`\
            ON\
                `gameContestantTeam`.`team_id` = `teamList`.`team_id`\
            WHERE\
                `preductionGame`.`preduction_g_id` = ?;",
            [option.game_id],
            connection
        );

        // vote_type
        let teamLength = await query(
            "SELECT * FROM `preductionGame` WHERE `preduction_g_id` = ?;",
            [option.game_id],
            connection
        );

        teamList = teamList.results;

        // 全部の投票数
        let voteNumTotal = await query(
            "SELECT `game_id`, `ranking`, `select_team`, COUNT(`select_team`) as `count` FROM `preductionVote` WHERE `game_id` = ?GROUP BY `ranking`, `select_team`;",
            [option.game_id],
            connection
        );

        let voteData = {total: 0, length: 0};

        voteNumTotal.results.forEach((elm) => {
            if (!voteData.hasOwnProperty(elm.ranking)) {
                voteData[elm.ranking] = {
                    total: 0
                }
                voteData.length++;
            }

            voteData.total += elm.count;
            voteData[elm.ranking].total += elm.count;
            voteData[elm.ranking][elm.select_team] = elm.count;
        });

        // オッズの計算
        let oddzList = {};
        for (let i = 1; i <= teamLength.results[0].vote_type; i++) {
            //
            oddzList[i] = {};

            teamList.forEach((elm) => {
                // 値があるかを確認
                if (voteData[i].hasOwnProperty(elm.team_id)) {
                    var votes = voteData[i][elm.team_id]
                }else{
                    var votes = 1;
                }

                // レートの計算
                oddzList[i][elm.team_id] = Math.round(voteData[i].total / votes * 10) / 10;
                console.log(`${i}位 ${elm.team_name}: ${oddzList[i][elm.team_id]}`);
            });
        }

        return oddzList;
    }catch (e) {
        console.log(e);
    }
}

export {
    clacOdzz,
}
