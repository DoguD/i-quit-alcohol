import styles from '../../app/page.module.css'
import {Button} from "@mui/joy";
import {useRouter, useSearchParams} from "next/navigation";

import {OURA_URL, OURA_CLIENT_ID, OURA_REDIRECT_URI} from "@/components/Constants";
import {useEffect, useState} from "react";
import {addData, getData} from "@/components/Firebase/FireStore";
import {calculateAverages} from "@/components/Oura/OuraUtility";

export default function Oura(props) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [ouraData, setOuraData] = useState(null);

    // Redirection after connection for url params
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const url = window.location.href;
            if (url.includes('/#')) {
                router.replace(url.replace('/#', '/?'));
            }
        }
    });

    // If first connection push Oura access key to Firebase
    useEffect(() => {
        async function addOuraKeyToFirebase() {
            if (props.uid !== "" && searchParams.has("access_token")) {
                // Push to firebase
                const access_key = searchParams.get("access_token");
                await addData("user_oura_key", props.uid, {
                    access_token: access_key,
                });

                // Remove from url
                if (typeof window !== "undefined") {
                    const url = window.location.href;
                    router.replace(url.split('/?')[0])
                }

                // Perform first data get
                await getOuraData(props.uid, access_key, props.cookies)
            }
        }

        addOuraKeyToFirebase();
    }, [searchParams, props.uid, props.cookies]);

    // If there is a user try to get data from Firebase
    useEffect(() => {
        if (props.uid !== "") {
            getOuraDataFromFirebase(props.uid);
        }
    }, [props.uid]);

    // Establishing first connection with Oura
    function connectToOura() {
        let url = OURA_URL + "authorize?response_type=token&client_id=" + OURA_CLIENT_ID + "&redirect_uri=" + OURA_REDIRECT_URI + "&state=" + props.uid;
        router.push(url)
    }

    // Calculate oura data and push to Firebase
    async function getOuraData(uid, access_token, cookies) {
        if (uid !== "" && access_token !== "" && typeof cookies.days !== "undefined") {
            const ouraData = await calculateAverages(access_token, cookies.days);
            if (!ouraData[0]) {
                setOuraData(ouraData[1]);
                await addData("user_oura_data", uid, ouraData[1]);
            }
        }
    }

    // Get Oura data from Firebase
    async function getOuraDataFromFirebase(uid) {
        if (uid !== "") {
            let {result, error} = await getData("user_oura_data", uid);
            if (typeof result !== "undefined" && result !== null && result._document !== null) {
                let data = result._document.data.value.mapValue.fields;

                const parsedData = {
                    before: {
                        sleep_total: data.before.mapValue.fields.sleep_total.doubleValue,
                        sleep_deep: data.before.mapValue.fields.sleep_deep.doubleValue,
                        sleep_rem: data.before.mapValue.fields.sleep_rem.doubleValue,
                        activity: data.before.mapValue.fields.activity.doubleValue,
                        calorie: data.before.mapValue.fields.calorie.doubleValue,
                        readiness: data.before.mapValue.fields.readiness.doubleValue
                    },
                    sober: {
                        sleep_total: data.sober.mapValue.fields.sleep_total.doubleValue,
                        sleep_deep: data.sober.mapValue.fields.sleep_deep.doubleValue,
                        sleep_rem: data.sober.mapValue.fields.sleep_rem.doubleValue,
                        activity: data.sober.mapValue.fields.activity.doubleValue,
                        calorie: data.sober.mapValue.fields.calorie.doubleValue,
                        readiness: data.sober.mapValue.fields.readiness.doubleValue
                    },
                    timestamp: data.timestamp.stringValue
                }

                setOuraData(parsedData);
            }
        }
    }

    // Refresh (recalculate) Oura data and push to Firebase
    async function refresh() {
        let {result, error} = await getData("user_oura_key", props.uid);

        if (typeof result !== "undefined" && result !== null && result._document !== null) {
            let data = result._document.data.value.mapValue.fields;
            const access_token = data.access_token.stringValue;

            await getOuraData(props.uid, access_token, props.cookies);
        }
    }

    return (
        <div className={styles.ouraContainer}>
            <div className={styles.titleRow}>
                {ouraData === null ?
                    <p className={styles.ouraTitle} style={{marginRight: 16}}>Connect with</p> : null}
                <img src={'/oura.jpg'} alt={'Oura'} className={styles.ouraImage}/>
            </div>
            {ouraData === null ?
                <>
                    <p className={styles.ouraDescription}>You can connect your Oura ring account and see how quiting
                        alcohol affects
                        your sleep, activity, and readiness.</p>

                    <div className={styles.centeredRow}>
                        <Button className={styles.buttonNormalText} color={"primary"}
                                onClick={() => connectToOura()}
                        >Connect</Button>
                    </div>
                </> : <>
                    <p className={styles.ouraDescription}>Averages below are calculated by comparing the data after you
                        stopped drinking and 6 months before then.</p>
                    <p className={styles.ouraScore}>
                        <b>💪 Readiness</b>
                        {ouraData.sober.readiness > ouraData.before.readiness ?
                            <span
                                style={{color: 'darkgreen'}}> improved by <b>{((ouraData.sober.readiness * 100 / ouraData.before.readiness) - 100).toFixed(2)}%</b></span>
                            : <span
                                style={{color: 'darkred'}}> deteriorated by <b>{Math.abs((ouraData.sober.readiness * 100 / ouraData.before.readiness) - 100).toFixed(2)}%</b></span>}
                    </p>

                    <p className={styles.ouraScore}><b>😴 Sleep</b>
                        {ouraData.sober.sleep_total > ouraData.before.sleep_total ?
                            <span
                                style={{color: 'darkgreen'}}> improved by <b>{((ouraData.sober.sleep_total * 100 / ouraData.before.sleep_total) - 100).toFixed(2)}%</b></span>
                            : <span
                                style={{color: 'darkred'}}> deteriorated by <b>{Math.abs((ouraData.sober.sleep_total * 100 / ouraData.before.sleep_total) - 100).toFixed(2)}%</b></span>}
                    </p>
                    <p className={styles.ouraScoreSub}>Your deep
                        sleep {ouraData.sober.sleep_deep > ouraData.before.sleep_deep ? "increased" : "decreased"} by <span
                            style={{
                                color: ouraData.sober.sleep_deep > ouraData.before.sleep_deep ? "darkgreen" : 'darkgreen',
                                fontWeight: 'bold'
                            }}>{((ouraData.sober.sleep_deep * 100 / ouraData.before.sleep_deep) - 100).toFixed(2)}%</span>
                    </p>
                    <p className={styles.ouraScoreSub}>Your REM
                        sleep {ouraData.sober.sleep_rem > ouraData.before.sleep_rem ? "increased" : "decreased"} by <span
                            style={{
                                color: ouraData.sober.sleep_rem > ouraData.before.sleep_rem ? "darkgreen" : 'darkgreen',
                                fontWeight: 'bold'
                            }}>{((ouraData.sober.sleep_rem * 100 / ouraData.before.sleep_rem) - 100).toFixed(2)}%</span>
                    </p>

                    <p className={styles.ouraScore}><b>🏃 Activity</b>
                        {ouraData.sober.activity > ouraData.before.activity ?
                            <span
                                style={{color: 'darkgreen'}}> improved by <b>{((ouraData.sober.activity * 100 / ouraData.before.activity) - 100).toFixed(2)}%</b></span>
                            : <span
                                style={{color: 'darkred'}}> deteriorated by <b>{Math.abs((ouraData.sober.activity * 100 / ouraData.before.activity) - 100).toFixed(2)}%</b></span>}
                    </p>
                    <p className={styles.ouraScoreSub}>You
                        burned {Math.abs(ouraData.sober.calorie - ouraData.before.calorie).toFixed(0)} calories {ouraData.sober.calorie > ouraData.before.calorie ? "more" : "less"} daily
                        on average.</p>

                    <p className={styles.signInExplanationText} style={{width: '100%', textAlign: 'right'}}>Last synced
                        on {ouraData.timestamp.slice(0, 21)} <span
                            onClick={async () => await refresh()}
                            style={{textDecoration: "underline", cursor: "pointer"}}>
                            Refresh
                        </span></p>
                </>
            }
        </div>
    );
}
