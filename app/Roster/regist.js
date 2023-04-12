import { getConnection, query } from '../index.js';
import { searchUser } from '../User/search.js';
import { template } from '../User/search.js';


const userRegist = async (roster_id, student_id) => {
    try {
        var connection = await getConnection();

        if (!connection) throw 'DB Connection Error';
    }catch (e) {
        return template;
    }

    try {
        // ユーザーの検索
        var result = await searchUser(student_id, connection);

        if (!result.UserId) {
            throw 'User Not Found';
        }

        // 編集権の確認

        // ユーザーの登録
        let res = await query(
            'UPDATE `gameContestantRoster` SET `student_id` = ?, `changed` = CURRENT_TIME() WHERE `roster_id` = ?',
            [student_id, roster_id],
            connection
        );
    }catch (e) {
        //
    }finally {
        connection.release();
    }

    return result;
}

export {
    userRegist
}