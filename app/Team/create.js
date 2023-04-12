import nanoId from 'nano-id';


import {
    getConnection,
    beginTransaction,
    rollback,
    query,
    commit,
} from '../index.js';


async function teamCreate(teamName) {
    // DBコネクションの取得・トランザクションの開始
    try {
        var connection = await getConnection();
        if (!beginTransaction(connection)) {
            // トランザクションの取得に失敗
            console.log('トランザクションの取得に失敗');
            connection.release();
            return false;
        }
    } catch (err) {
        // コネクションの取得に失敗
        console.log('コネクションの取得に失敗');
        return false;
    }

    // すでに名前が使われていないか確認
    let usedCheckResult = await query(
        'SELECT * FROM `TB_TEAM_LIST` WHERE `team_name` = ?',
        [teamName],
        connection
    );

    if (usedCheckResult.results.length != 0) {
        // すでに使われている
        await rollback(connection);
        return { result: false, msg: 'すでに使われているチーム名です' };
    }

    // 使われていない場合はIDを生成してインサート
    let count = 0;
    let newId = '';
    while (true) {
        count++;

        // IDを生成
        newId = nanoId(5);

        // すでにIDが使われているか確認
        let usedIdCheckResult = await query(
            'SELECT * FROM `TB_TEAM_LIST` WHERE `team_id` = ?',
            [newId],
            connection
        );

        if (usedIdCheckResult.results.length != 0) {
            if (count > 10) {
                return { result: false, msg: 'ID生成エラー' };
            }

            continue;
        } else {
            break;
        }
    }

    try {
        let insertResult = await query(
            "INSERT INTO`TB_TEAM_LIST`(`team_id`, `team_name`) VALUES (?, ?)",
            [newId, teamName],
            connection
        );
    } catch (err) {
        // インサートエラー
        console.log(err);
        return { result: false, msg: 'DBインサートエラー' };
    }

    // コミット
    if (!commit(connection)) {
        // コミットに失敗
        console.log('コミットに失敗');
        return { result: false, msg: 'コミットエラー' };
    }

    connection.release();

    return { result: true, id: newId };
}


export {
    teamCreate
}