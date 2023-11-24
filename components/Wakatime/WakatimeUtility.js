import {OURA_BEFORE_ALCOHOL_MONTHS} from "@/components/Constants";

export async function getWakatimeData(url, startTimestamp) {
    // Parse date parameters
    const soberDate = new Date(parseInt(startTimestamp));
    const startDate = new Date(startTimestamp - (OURA_BEFORE_ALCOHOL_MONTHS * 30 * 24 * 60 * 60 * 1000));

    // Get raw data
    const response = await fetch(url);
    console.log(response)
    if (response.status === 200) {
        const data = await response.json();
        console.log(data)
        if (data.status === "ok" || data.status === "pending_update") {
            const daysData = data.days;
            console.log(daysData)
            // Parse raw data

            let totals = [0, 0];
            let count = [0, 0];

            let workingTotals = [0, 0];
            let workingCount = [0, 0];

            for (let i = 0; i < daysData.length; i++) {
                let curData = daysData[i];
                let curDate = new Date(curData.date);

                if (curDate.getTime() > startDate.getTime()) { // Check for last 6 moths
                    if (curDate.getTime() < soberDate.getTime()) { // Check for before sober date
                        totals[0] += curData.total;
                        count[0]++;
                        if (curData.total > 0) {
                            workingTotals[0] += curData.total;
                            workingCount[0]++;
                        }
                    } else {
                        totals[1] += curData.total;
                        count[1]++;

                        if (curData.total > 0) {
                            workingTotals[1] += curData.total;
                            workingCount[1]++;
                        }
                    }
                }
            }
            totals[0] /= count[0];
            totals[1] /= count[1];

            workingTotals[0] /= workingCount[0];
            workingTotals[1] /= workingCount[1];
            return [false, totals, workingTotals, workingCount, count, (new Date(Date.parse(daysData[daysData.length - 1].date))).toString()];
        }
    }

    return [true, []];
}
