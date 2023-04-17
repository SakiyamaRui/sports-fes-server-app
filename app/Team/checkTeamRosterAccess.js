import { getConnection, query } from "../DB/database.js";
import getStudentIdFromSession, { redirectTo } from "../User/session.js";

const checkRosterAccessCheck = async (req, res, team_id, isAPI = false) => {
    //
    let student_id = await getStudentIdFromSession(req, res, isAPI);
    let return_to = encodeURIComponent(req.protocol + '://' + req.get( 'host' ) + req.originalUrl);
    if (req.query.return_to) return_to = req.query.return_to;

    if (student_id == false) {
        if (isAPI) {
            res.json(403, {
                redirect: redirectTo + return_to,
                type: 'not_login',
            });
            return false;
        }else {
            //
            res.redirect(redirectTo + return_to);
            return false;
        }
    }

    //
    if (typeof student_id == 'string') {
        //
        try {
            var connection = await getConnection();

            let result = await query(
                'SELECT * FROM `rosterChangeUser` WHERE `student_id` = ? AND `team_id` = ?',
                [student_id, team_id],
                connection
            );

            //
            if (result.results.length > 0) {
                connection.release();
                return true;
            }else{
                connection.release();
                return 'Access denied';
            }

        }catch (e) {
            console.log(e);
            connection.release();
        }

        return 'Access denied';

    }

    return 'Access denied';
}

export default checkRosterAccessCheck;