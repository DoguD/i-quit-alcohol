import {OURA_BEFORE_ALCOHOL_MONTHS} from "@/components/Constants";

export async function getWakatimeData(url, startTimestamp) {
    // Parse date parameters
    const soberDate = new Date(parseInt(startTimestamp));
    const startDate = new Date(startTimestamp - (OURA_BEFORE_ALCOHOL_MONTHS * 30 * 24 * 60 * 60 * 1000));

    // Get raw data
    const response = await fetch(url);
    if (response.status === 200) {
        const data = await response.json();

        if (data.status === "ok") {
            const daysData = data.days;
            // Parse raw data

            let totals = [0, 0];
            let count = [0, 0];

            for (let i = 0; i < daysData.length; i++) {
                let curData = daysData[i];
                let curDate = new Date(curData.date);

                if (curDate.getTime() > startDate.getTime()) { // Check for last 6 moths
                    if (curDate.getTime() < soberDate.getTime()) { // Check for before sober date
                        totals[0] += curData.total;
                        count[0]++;
                    } else {
                        totals[1] += curData.total;
                        count[1]++;
                    }
                }
            }
            totals[0] /= count[0];
            totals[1] /= count[1];
            return [false, totals, (new Date()).toString()];
        }
    }

    return [true, []];
}
