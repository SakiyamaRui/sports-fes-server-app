import { getConnection, query } from '../index.js';

// ゲームデータの取得
const getGameData = async (game_id, connection) => {
    //
    if (!connection) {
        // コネクションの取得
        try {
            var connection = await getConnection();
    
            if (!connection) throw 'DB Connection Error';
        }catch (e) {
            throw e;
        }
    }

    try {
        // データの取得
        let DBresponce = await query(
            'SELECT * FROM `gameMaster` WHERE `game_id` = ?',
            [game_id],
            connection
        );

        if (DBresponce.results.length == 1) {
            return {
                game_id: DBresponce.results[0].game_id,
                game_name: DBresponce.results[0].game_name
            }
        }else {
            return false;
        }
    }catch (e) {
        throw e;
    }
}

export {
    getGameData
}