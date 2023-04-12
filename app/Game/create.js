const {
    getConnection,
    beginTransaction,
    rollback,
    query,
    commit,
} = require('../');

const createGame = async ({
    competitionName,    // 競技名
    participatingTeam,  // 参加チーム
    positionData, //    // 種目・役職情報
}) => {
    
    // DBコネクションの取得・トランザクションの開始
    try {
        var connection = await getConnection();
        if (!beginTransaction(connection)) {
            // トランザクションの取得に失敗
            console.log('トランザクションの取得に失敗');
            connection.release();
            return false;
        }
    }catch ( err ) {
        // コネクションの取得に失敗
        console.log('コネクションの取得に失敗');
        return false;
    }

    // 競技名の登録
    query(
        "INSERT INTO `TB_COMPETITION`(`comp_name`) VALUES (?);",
        [competitionName],
        connection
    );

    // コミット
    if (!commit(connection)) {
        // コミットに失敗
        console.log('コミットに失敗');
    }

    connection.release();

    return true;
}

createGame({
    competitionName: '1学年 学級対抗リレー',
    participatingTeam: ['00001', '00002', '00003'],
    positionData: [
        {
            PositionName: "種目名1",
            Number: 3
        }
    ]
});

// ( async () => {
//     // コネクションの取得
//     try {
//         let connection = await getConnection();

//         let results = await query(
//             "show variables like '%char%';",
//             [],
//             connection
//         );

//         console.log(results.results);
//     }catch (err) {
//         console.log(err);
//     }
// })();