/*
    ポイントタイプ
    0: 競技点
    1: クラス点
    2: 勝敗予想点
*/

-- 名簿として一覧を取得
SELECT
    `volunteerList`.`join_id`,
    `volunteerList`.`student_id`,
    `volunteerList`.`participation_date`,
    `userMaster`.`grade`,
    `userMaster`.`class_num`,
    `userMaster`.`attendance_num`,
    `userMaster`.`username`
FROM
    `volunteerList`
INNER JOIN
	`userMaster`
ON
	`volunteerList`.`student_id` = `userMaster`.`student_id`
WHERE
    1

-- 各クラスのボランティア参加人数を取得
SELECT
    `userMaster`.`grade`,
    `userMaster`.`class_num`,
    COUNT(`userMaster`.`class_num`),
    `volunteerList`.`participation_date`
FROM
	`volunteerList`
INNER JOIN
	`userMaster`
ON
	`volunteerList`.`student_id` = `userMaster`.`student_id`
WHERE
	1
GROUP BY
	`userMaster`.`grade`,
    `userMaster`.`class_num`

-- ポイント付与　ベース
INSERT INTO `userPoints`(
    `student_id`,
    `point_type`,
    `label_id`,
    `point`
)
VALUES(
    '211216',
    1,
    0,
    1
)

-- ポイント付与 ボランティア
INSERT INTO `userPoints`(
    `student_id`,
    `point_type`,
    `label_id`,
    `point`
)
SELECT
	`student_id`,
    1,
    3,
    1
FROM
	`volunteerList`
WHERE
	`volunteerList`.`participation_date` = '2023/4/18'

-- ポイント履歴 一覧
SELECT
	`userPoints`.`point_id`,
    `userPoints`.`student_id`,
    `userPoints`.`point_type`,
    `userMaster`.`grade`,
    `userMaster`.`class_num`,
    `userMaster`.`attendance_num`,
    `userMaster`.`username`,
    `userPoints`.`point`
FROM
	`userPoints`
INNER JOIN
	`userMaster`
ON
	`userPoints`.`student_id` = `userMaster`.`student_id`
WHERE
	`userPoints`.`deleted` = 0

-- 個人ごとの合計ポイント数 (INNER JOIN)
SELECT
    `userPoints`.`student_id`,
    `userMaster`.`grade`,
    `userMaster`.`class_num`,
    `userMaster`.`attendance_num`,
    `userMaster`.`username`,
    SUM(`userPoints`.`point`)
FROM
	`userPoints`
INNER JOIN
	`userMaster`
ON
	`userPoints`.`student_id` = `userMaster`.`student_id`
WHERE
	`userPoints`.`deleted` = 0
GROUP BY
	`userMaster`.`grade`,
    `userMaster`.`class_num`,
    `userMaster`.`attendance_num`


-- クラスごとのポイント数
SELECT
    `userMaster`.`grade`,
    `userMaster`.`class_num`,
    SUM(`userPoints`.`point`)
FROM
	`userPoints`
INNER JOIN
	`userMaster`
ON
	`userPoints`.`student_id` = `userMaster`.`student_id`
WHERE
	`userPoints`.`deleted` = 0
GROUP BY
	`userMaster`.`grade`,
   `userMaster`.`class_num`

-- クラスごとのポイント数 ソート
SELECT
    `userMaster`.`grade`,
    `userMaster`.`class_num`,
    SUM(`userPoints`.`point`) as `ポイント`
FROM
	`userPoints`
INNER JOIN
	`userMaster`
ON
	`userPoints`.`student_id` = `userMaster`.`student_id`
WHERE
	`userPoints`.`deleted` = 0
GROUP BY
	`userMaster`.`grade`,
   `userMaster`.`class_num`
ORDER BY `ポイント` DESC


-- ポイント取得 個人
SELECT
    `userPoints`.`point_id`,
    `userPointLabel`.`label_name`,
    `userPoints`.`grant_time`,
    `userPoints`.`point`
FROM
	`userPoints`
INNER JOIN
	`userPointLabel`
ON
	`userPoints`.`label_id` = `userPointLabel`.`label_id`
WHERE
	`userPoints`.`student_id` = '211216'
    AND
    `userPoints`.`deleted` = 0
    AND
    (
        `userPoints`.`point_type` = 0
        OR
        `userPoints`.`point_type` = 1
    )
ORDER BY
	`userPoints`.`grant_time`
LIMIT 100

-- オッズ一覧
SELECT
    `preductionGameOddz`.*
FROM
    `preductionGameOddz`
INNER JOIN(
    SELECT `game_id`,
        `rank`,
        `team_id`,
        `oddz`,
        MAX(`add_time`) as `add_time`
    FROM
        `preductionGameOddz`
    WHERE
        `game_id` = '001'
    GROUP BY
        `rank`,
        `team_id`
) AS `sub_t`
ON
	`preductionGameOddz`.`game_id` = `sub_t`.`game_id`
    AND
    `preductionGameOddz`.`rank` = `sub_t`.`rank`
    AND
    `preductionGameOddz`.`team_id` = `sub_t`.`team_id`
    AND
    `preductionGameOddz`.`add_time` = `sub_t`.`add_time`