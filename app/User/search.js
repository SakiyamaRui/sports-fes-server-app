import { getConnection, query } from '../index.js';

const template = {
    UserId: null,
    UserName: null,
    grade: null,
    classNum: null,
    attendanceNum: null
};

const searchUser = async (student_id, connection = null) => {
    
    let newConnection = null;
    if (!connection) {
        newConnection = true;
        try {
            var connection = await getConnection();
    
            if (!connection) throw 'DB Connection Error';
        }catch (e) {
            if (newConnection) {
                connection.release();
            }
            return false;
        }
    }

    try {
        let res = await query(
            'SELECT * FROM `userMaster` WHERE `student_id` = ?;',
            [student_id],
            connection
        );

        if (res.results.length == 0) {
            if (newConnection) {
                connection.release();
            }
            return false;
        }
        
        let userData = res.results[0];

        if (newConnection) {
            connection.release();
        }
        
        return {
            UserId: userData.student_id,
            UserName: userData.username,
            grade: userData.grade,
            classNum: userData.class_num,
            attendanceNum: userData.attendance_num
        };
    }catch (e) {
        if (newConnection) {
            connection.release();
        }
        return false;
    }
}

export {
    searchUser,
    template
}