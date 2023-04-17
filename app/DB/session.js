import { createPool } from 'mysql';

let publicDatabaseTemp = {
    connectionLimit: 3,
    host: 'public.humfg.tyo2.database-hosting.conoha.io',
    user: 'humfg_sports_fes_app',
    password: 'Ub|9ZLG(6',
    database: 'humfg_long_session',
    charset: 'utf8'
}

let serverDatabase = {
    connectionLimit: 3,
    host: 'private.humfg.tyo2.database-hosting.conoha.io',
    user: 'humfg_sports_fes_app',
    password: 'Ub|9ZLG(6',
    database: 'humfg_long_session',
    charset: 'utf8'
}

const dbPool = createPool(publicDatabaseTemp);

const getSessionDBConnection = () => {
    return new Promise((resolve, reject) => {
        dbPool.getConnection((err, connection) => {
            if (err) throw err;

            resolve(connection);
        });
    });
}

export default getSessionDBConnection;