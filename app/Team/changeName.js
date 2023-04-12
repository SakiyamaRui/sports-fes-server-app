const {
    getConnection,
    beginTransaction,
    rollback,
    query,
    commit,
} = require('../');

const changeName = async (data) => {
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
}