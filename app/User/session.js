import getSessionDBConnection from "../DB/session.js";
import { query } from "../index.js";

const redirectTo = "https://auth.apori.jp/redirect/microsoft?return_to="

/**
 *  
 */
const getStudentIdFromSession = async (req, res, isAPI) => {
    //
    let return_url = encodeURIComponent(req.protocol + '://' + req.get( 'host' ) + req.originalUrl);

    if (!req.cookies.S_FES_SESS) {
        if (isAPI) res.redirect(redirectTo + return_url);
        return {result: false, redirect: edirectTo + return_url};
    }

    try {
        var connection = await getSessionDBConnection();

        if (!connection) {
            connection.release();
            return Error("DB Connection Error");
        }
    }catch (err) {
        connection.release();
        return err;
    }

    try {
        //
        let response = await query(
            'SELECT\
                *\
            FROM\
                `sports_fes_session`\
            WHERE\
                `session_id` = ? AND\
                `deleted` = FALSE AND\
                `exp` > CURRENT_TIMESTAMP',
            [req.cookies.S_FES_SESS],
            connection
        );


        if (response.results.length > 0) {
            let matches = response.results[0].email.match(/^(ms|ic|mi|br)([0-9]{6})@/);

            if (!matches) {
                connection.release();
                res.redirect(redirectTo + return_url);
                return false;
            }

            connection.release();
            return matches[2];
        }
    }catch (err) {
        connection.release();
        return Error("SQL Exec Error");
    }
}

export default getStudentIdFromSession;
export {
    redirectTo
}
