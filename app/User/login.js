import { redirectTo } from "./session.js";
import { query } from "../DB/database.js";
import getSessionDBConnection from "../DB/session.js";

const defaultrReturnTo = 'https://sports-fes.apori.jp/game/';

const isLogin = async (req, res, isAPI = false) => {
    let redirectURL = redirectTo + encodeURIComponent(
        (req.query.return_to)
            ? req.query.return_to
            : defaultrReturnTo
    );

    // Cookieが入っているか確認
    if (!req.cookies.S_FES_SESS) {
        if (isAPI) {
            // リダイレクトリクエストを送信
            res.status(403).send({
                response: 'Not Login',
                redirectTo: redirectURL
            })
        }else{
            // Cookieがないためリダイレクト
            res.redirect(redirectURL);
        }
        return false;
    }

    // Cookieがある場合はセッションの検索

    // コネクションの取得
    try {
        //
        var connection = await getSessionDBConnection();

        if (!connection) {
            connection.release();
            return 'error';
        }
    }catch (e) {
        console.log(e);
        return 'error';
    }

    // セッションの検索
    try {
        let responce = await query(
            'SELECT * FROM `sports_fes_session` WHERE `session_id` = ? AND exp > CURRENT_TIMESTAMP AND `deleted` = 0;',
            [req.cookies.S_FES_SESS],
            connection
        );

        if (responce.results.length > 0) {
            // セッションあり
            let matches = responce.results[0].email.match(/(ms|ic|mi|br)([0-9]{6})@edu\./);

            if (!matches) {
                // 学生の確認ができない
                res.json({
                    responce: 'user not found',
                });
                connection.release();
                return false;
            }

            connection.release();
            return matches[2];
        }

        return 403;
    }catch (e) {
        //
        console.log(e);
        connection.release();
    }

    return 'error';
}

export {
    isLogin,
}