import {OURA_BEFORE_ALCOHOL_MONTHS} from "@/components/Constants";

function twoDecimal(number) {
    return Math.round(number * 100) / 100;
}

export async function calculateAverages(accessToken, startTimestamp, tokenExpiry) {
    const soberDate = new Date(parseInt(startTimestamp));
    const startDate = new Date(startTimestamp - (OURA_BEFORE_ALCOHOL_MONTHS * 30 * 24 * 60 * 60 * 1000)).toISOString().slice(0, 10);

    const sleepData = await calculateSleep(accessToken, startDate, soberDate, tokenExpiry);
    console.log("Sleep Data: ")
    console.log(sleepData)
    const activityData = await calculateActivity(accessToken, startDate, soberDate);
    console.log("Activity Data: ")
    console.log(activityData)
    const readinessData = await calculateReadiness(accessToken, startDate, soberDate);
    console.log("Readiness Data: ")
    console.log(readinessData)

    if (sleepData[0] || activityData[0] || readinessData[0]) {
        return [true, {}];
    } else {
        let curDate = new Date();
        const parsedData = {
            timestamp: curDate.toString(),
            before: {
                sleep_total: twoDecimal(sleepData[1][0]),
                sleep_deep: twoDecimal(sleepData[1][1]),
                sleep_rem: twoDecimal(sleepData[1][2]),
                activity: twoDecimal(activityData[1][0]),
                calorie: twoDecimal(activityData[1][1]),
                readiness: twoDecimal(readinessData[1])
            },
            sober: {
                sleep_total: twoDecimal(sleepData[2][0]),
                sleep_deep: twoDecimal(sleepData[2][1]),
                sleep_rem: twoDecimal(sleepData[2][2]),
                activity: twoDecimal(activityData[2][0]),
                calorie: twoDecimal(activityData[2][1]),
                readiness: twoDecimal(readinessData[2])
            }
        }

        return [false, parsedData];
    }
}

async function calculateSleep(accessToken, startDate, soberDate, tokenExpiry) {
    let url = `/api/usercollection/daily_sleep?start_date=${startDate}`;

    let sleepScore = 0;
    let deepSleep = 0;
    let remSleep = 0;
    let count = 1;
    let sleepScoreSober = 0;
    let deepSleepSober = 0;
    let remSleepSober = 0;
    let countSober = 1;

    let error = false;

    await fetch(url, {
        method: "GET", // *GET, POST, PUT, DELETE, etc.
        // mode: "no-cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        headers: new Headers({
            "Host": "api.ouraring.com",
            "Authorization": `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        }),
    }).then(response => {
        if (response.status === 401) {
            tokenExpiry();
            error = true;
        }
        return response.json();
    }).then(response => {
        if ('data' in response) {
            let sleepData = response.data;
            for (let i = 0; i < sleepData.length; i++) {
                let curDate = new Date(sleepData[i].day);

                if (curDate < soberDate) {
                    count++;
                    sleepScore += sleepData[i].score;
                    deepSleep += sleepData[i].contributors.deep_sleep;
                    remSleep += sleepData[i].contributors.rem_sleep;
                } else {
                    countSober++;
                    sleepScoreSober += sleepData[i].score;
                    deepSleepSober += sleepData[i].contributors.deep_sleep;
                    remSleepSober += sleepData[i].contributors.rem_sleep;
                }
            }
            count--;
            countSober--;
        } else {
            error = true;
        }
    });


    console.log("SLEEP: before count " + count + " sober count " + countSober)
    let sleepData = [sleepScore / count, deepSleep / count, remSleep / count];
    let sleepDataSober = [sleepScoreSober / countSober, deepSleepSober / countSober, remSleepSober / countSober]
    return [error, sleepData, sleepDataSober];
}

async function calculateActivity(accessToken, startDate, soberDate) {
    let url = `/api/usercollection/daily_activity?start_date=${startDate}`

    let activityScore = 0;
    let calorie = 0
    let activityScoreSober = 0;
    let calorieSober = 0;
    let count = 1;
    let countSober = 1;

    let error = false;

    await fetch(url, {
        method: "GET", // *GET, POST, PUT, DELETE, etc.
        // mode: "no-cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        headers: new Headers({
            "Host": "api.ouraring.com",
            "Authorization": `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        }),
    }).then(response => {
        if (response.status !== 200) {
            error = true;
        }
        return response.json();
    }).then(response => {
        if ('data' in response) {
            let activityData = response.data;
            for (let i = 0; i < activityData.length; i++) {
                let curDate = new Date(activityData[i].day);

                if (typeof activityData[i].score !== "undefined") {
                    if (curDate < soberDate) {
                        count++;
                        activityScore += activityData[i].score;
                        calorie += activityData[i].total_calories;
                    } else {
                        countSober++;
                        activityScoreSober += activityData[i].score;
                        calorieSober += activityData[i].total_calories;
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
    let url = `/api/usercollection/daily_readiness?start_date=${startDate}`

    let readinessScore = 0;
    let count = 1;
    let readinessScoreSober = 0;
    let countSober = 1;

    let error = false;

    await fetch(url, {
        method: "GET", // *GET, POST, PUT, DELETE, etc.
        // mode: "no-cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        headers: new Headers({
            "Host": "api.ouraring.com",
            "Authorization": `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        }),
    }).then(response => {
        if (response.status !== 200) {
            error = true;
        }
        return response.json();
    }).then(response => {
        if ('data' in response) {
            let readinessData = response.data;
            for (let i = 0; i < readinessData.length; i++) {
                let curDate = new Date(readinessData[i].day);
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
