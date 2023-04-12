import { getConnection, query } from '../index.js';

const getTeamList = async () => {
    // DBコネクションの取得
    try {
        var connection = await getConnection();
    }catch ( err ) {
        // コネクションの取得に失敗
        console.log('コネクションの取得に失敗');
        return false;
    }

    // チーム一覧の取得
    try {
        var responce = await query(
            "SELECT * FROM `TB_TEAM_LIST` WHERE 1",
            [],
            connection
        );
    }catch (err) {
        // クエリの実行エラー
        return false;
    }

    // コネクションの開放
    connection.release();


    // データ形式の変換
    let returnData = responce.results.map((record) => {
        return {
            DBID: record['team_id'],
            name: record['team_name'],
        };
    });


    return returnData;
}

export {
    getTeamList
}