const {
    query,
    commit,
    rollback,
    getConnection,
    beginTransaction,

    generateNumberId
} = require('../');

// 役職
const positionLabelSave = (data, connection) => {
    //
}

// 参加チーム
const contestantTeamSave = async (data, game_id, connection) => {
    //
    if (data.length == 0) {
        return true;
    }

    let sql = 'INSERT INTO `gameContestantTeam`(`roster_id`, `game_id`, `team_id`) VALUES';
    let placeholder = '(?, ?, ?),'.repeat(data.length).slice(0, -1);
    let placeholderData = [];

    for (let elm of data) {
        placeholderData.push(await generateNumberId(5), game_id, elm.team_id);
    }

    let res = await query(
        `${sql}${placeholder}`,
        [placeholderData],
        connection
    )

    return true;
}

// ゲームデータを保存
const gameMasterDataSave = async (data) => {
    
    // DBコネクションの取得
    try {
        var connection = await getConnection();

        if (!connection) throw 'DB Connection Error';

        // トランザクションの開始
        if (await beginTransaction(connection)) throw 'DB Transaction Error';
    }catch (e) {
        connection.release();
        throw e;
    }

    if (data.game_id == 'new') {
        // 新しく作成

        try {
            // gameMaster
            var newId = await generateNumberId(5);
            data.game_id = newId;
            let gmResponce = await query(
                'INSERT INTO `gameMaster`(`game_id`, `game_name`) VALUES (?, ?)',
                [newId, data.gameName],
                connection
            );
        }catch (e) {
            rollback(connection);
            connection.release();
            throw e;
        }
    } else {
        // データを保存
        try {
            // gameName
            if (data.gameName) {
                let responce = await query(
                    'UPDATE `gameMaster` SET `game_name` = ? WHERE `game_id` = ?;',
                    [data.gameName, data.game_id],
                    connection
                );
            }

            // 名簿データ
        }catch (e) {
            rollback(connection);
            connection.release();
            throw e;
        }
    }

    // 共通
    try {
        // 参加チームの設定
        await contestantTeamSave(data.contestantTeam, data.game_id, connection);

        // 参加名簿の登録
    }catch (e) {
        // 
    }

    // コミット
    // commit(connection);
}