import {OURA_BEFORE_ALCOHOL_MONTHS, OURA_DATA_URL} from "@/components/Constants";

export async function calculateAverages(accessToken, startTimestamp) {
    const soberDate = new Date(parseInt(startTimestamp));
    const startDate = new Date(startTimestamp - (OURA_BEFORE_ALCOHOL_MONTHS * 30 * 24 * 60 * 60 * 1000)).toISOString().slice(0, 10);

    const sleepData = await calculateSleep(accessToken, startDate, soberDate);
    const activityData = await calculateActivity(accessToken, startDate, soberDate);
    const readinessData = await calculateReadiness(accessToken, startDate, soberDate);

    if (sleepData[0] || activityData[0] || readinessData[0]) {
        return [true, {}];
    } else {
        const parsedData = {
            before: {
                sleep_total: sleepData[1][0],
                sleep_deep: sleepData[1][1],
                sleep_rem: sleepData[1][2],
                activity: activityData[1][0],
                calorie: activityData[1][1],
                readiness: readinessData[1]
            },
            sober: {
                sleep_total: sleepData[2][0],
                sleep_deep: sleepData[2][1],
                sleep_rem: sleepData[2][2],
                activity: activityData[2][0],
                calorie: activityData[2][1],
                readiness: readinessData[2]
            }
        }

        return [false, parsedData];
    }
}

async function calculateSleep(accessToken, startDate, soberDate) {
    let url = OURA_DATA_URL + 'sleep?' + 'start=' + startDate + '&access_token=' + accessToken;

    let sleepScore = 0;
    let deepSleep = 0;
    let remSleep = 0;
    let count = 1;
    let sleepScoreSober = 0;
    let deepSleepSober = 0;
    let remSleepSober = 0;
    let countSober = 1;

    let error = false;

    await fetch(url).then(response => response.json())
        .then(response => {
            if ('sleep' in response) {
                let sleepData = response.sleep;
                for (let i = 0; i < sleepData.length; i++) {
                    let curDate = new Date(sleepData[i].summary_date);

                    if (typeof sleepData[i].score_total !== "undefined") {
                        if (curDate < soberDate) {
                            count++;
                            sleepScore += sleepData[i].score_total;
                            deepSleep += sleepData[i].score_deep;
                            remSleep += sleepData[i].score_rem;
                        } else {
                            countSober++;
                            sleepScoreSober += sleepData[i].score_total;
                            deepSleepSober += sleepData[i].score_deep;
                            remSleepSober += sleepData[i].score_rem;
                        }
                    }
                }
                count--;
                countSober--;
            } else {
                error = true;
            }
        });


    let sleepData = [sleepScore / count, deepSleep / count, remSleep / count];
    let sleepDataSober = [sleepScoreSober / countSober, deepSleepSober / countSober, remSleepSober / countSober]
    return [error, sleepData, sleepDataSober];
}

async function calculateActivity(accessToken, startDate, soberDate) {
    let url = OURA_DATA_URL + 'activity?' + 'start=' + startDate + '&access_token=' + accessToken;

    let activityScore = 0;
    let calorie = 0
    let activityScoreSober = 0;
    let calorieSober = 0;
    let count = 1;
    let countSober = 1;

    let error = false;

    await fetch(url).then(response => response.json())
        .then(response => {
            if ('activity' in response) {
                let activityData = response.activity;
                for (let i = 0; i < activityData.length; i++) {
                    let curDate = new Date(activityData[i].summary_date);

                    if (typeof activityData[i].score !== "undefined") {
                        if (curDate < soberDate) {
                            count++;
                            activityScore += activityData[i].score;
                            calorie += activityData[i].cal_active;
                        } else {
                            countSober++;
                            activityScoreSober += activityData[i].score;
                            calorieSober += activityData[i].cal_active;
                        }
                    }
                }
                count--;
                countSober--;
            } else {
                error = true;
            }
        });

    let activityData = [activityScore / count, calorie / count];
    let activityDataSober = [activityScoreSober / countSober, calorieSober / countSober];
    return [error, activityData, activityDataSober];
}

async function calculateReadiness(accessToken, startDate, soberDate) {
    let url = OURA_DATA_URL + 'readiness?' + 'start=' + startDate + '&access_token=' + accessToken;

    let readinessScore = 0;
    let count = 1;
    let readinessScoreSober = 0;
    let countSober = 1;

    let error = false;

    await fetch(url).then(response => response.json())
        .then(response => {
            if ('readiness' in response) {
                let readinessData = response.readiness;
                for (let i = 0; i < readinessData.length; i++) {
                    let curDate = new Date(readinessData[i].summary_date);
                    if (typeof readinessData[i].score !== "undefined") {
                        if (curDate < soberDate) {
                            count++;
                            readinessScore += readinessData[i].score;
                        } else {
                            countSober++;
                            readinessScoreSober += readinessData[i].score;
                        }
                    }
                }
                count--;
                countSober--;
            } else {
                error = true;
            }
        });

    let readinessData = readinessScore / count;
    let readinessDataSober = readinessScoreSober / countSober;
    return [error, readinessData, readinessDataSober];
}
