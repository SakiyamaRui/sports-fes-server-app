import { getConnection, query } from '../index.js';
import { clacOdzz } from '../OdzzClac.js';

const DBRegist = async (pre_g_id, connection, timer) => {
    let oddzList = await clacOdzz({
        game_id: pre_g_id,
    }, connection);


    // DB登録
    for (let rank in oddzList) {
        for (let team_id in oddzList[rank]) {
            if (team_id == 'total') {
                continue;
            }

            let result = await query(
                "INSERT INTO `preductionGameOddz`(`game_id`, `rank`, `team_id`, `oddz`) VALUES(?, ?, ?, ?)",
                [pre_g_id, rank, team_id, oddzList[rank][team_id]],
                connection
            );

        }
    }

    timer = setTimeout(async () => {
        await DBRegist(pre_g_id, connection, timer);
    }, 15000);
}

const oddzAutoUpdate = async (pre_g_id) => {
    //
    try {
        var connection = await getConnection();
    }catch (e) {
        console.log(e);
    }

    let timer;
    await DBRegist(pre_g_id, connection, timer);
}

oddzAutoUpdate('001');
