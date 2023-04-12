import { createPool } from 'mysql';

let publicDatabaseTemp = {
    connectionLimit: 3,
    host: 'public.humfg.tyo2.database-hosting.conoha.io',
    user: 'humfg_sports_fes_app',
    password: 'Ub|9ZLG(6',
    database: 'humfg_sports_fes',
    charset: 'utf8'
}

let localDatabase = {
    connectionLimit: 4,         // 最大コネクション数
    host: 'localhost',          // DBホスト
    user: 'root',               // ログインユーザー
    password: '',               // ログインパスワード
    database: 'SPORTS_FES_DB',   // DB名
    charset: 'utf8mb4',         // サーバーの文字セット
};

const dbPool = createPool(localDatabase);

const getConnection = () => {
    return new Promise((resolve, reject) => {
        dbPool.getConnection((err, connection) => {
            if (err) throw err;

            resolve(connection);
        });
    });
}

/**
 * beginTransaction
 * 
 * トランザクションの作成
 * 
 * @param {connection} connection DBのコネクション
 * @returns trueの場合は作成成功、falseの場合は作成に失敗
 */
const beginTransaction = (connection) => {
    return new Promise((resolve, reject) => {
        connection.beginTransaction((err) => {
            if (err) throw err;

            resolve(true);
        });
    });
}

/**
 * rollback
 * 
 * トランザクションのキャンセル
 * 
 * @param {connection} connection DBのコネクション
 * @returns trueの場合は成功、falseの場合は失敗
 */
const rollback = (connection) => {
    return new Promise((resolve, reject) => {
        connection.rollback((err) => {
            if (err) throw err;

            resolve(true);
        });
    });
}


/**
 * query
 * 
 * SQLクエリの実行
 * 
 * @param {String} sql 実行するSQL文
 * @param {Array} placeholder プレースホルダーの置き換え文字
 * @param {connection} connection DBへのコネクション
 * @returns  Object {results, fields}
 */
const query = (sql, placeholder, connection) => {
    return new Promise((resolve, reject) => {
        connection.query(
            sql,
            placeholder,
            (err, results, fields) => {
                if (err) throw err;

                resolve({results, fields});
            }
        );
    });
}


/**
 * commit
 * 
 * トランザクションのコミット
 * 
 * @param {connection} connection DBへのコネクション
 * @returns trueならば成功
 */
const commit = (connection) => {
    return new Promise((resolve, reject) => {
        connection.commit((err) => {
            if (err) throw err;

            resolve(true);
        });
    });
}

export {
    dbPool,
    getConnection,
    beginTransaction,
    rollback,
    query,
    commit
}