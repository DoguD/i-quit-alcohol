import styles from '../../app/page.module.css'
import {Button} from "@mui/joy";
import {useRouter, useSearchParams} from "next/navigation";

import {OURA_URL, OURA_CLIENT_ID, OURA_REDIRECT_URI} from "@/components/Constants";
import {useEffect, useState} from "react";
import {addData, deleteData, getData} from "@/components/Firebase/FireStore";
import {calculateAverages} from "@/components/Oura/OuraUtility";
import {useCookies} from "react-cookie";
import {BiRefresh} from "react-icons/bi";

export default function Oura(props) {
    const [cookies, setCookie, removeCookie, getCookie] = useCookies(['cookie-name']);
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const searchParams = useSearchParams();

    const [ouraData, setOuraData] = useState(null);

    useEffect(() => {
        if (typeof cookies.oura !== "undefined") {
            setOuraData(cookies.oura);
        }
    }, []);

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

    // Oura Disconnect
    async function disconnectOura() {
        const access_token = await getOuraKeyFromFirebase(props.uid);
        if (access_token !== "error") {
            // UI Change
            setOuraData(null);

            // Firebase data delete
            await deleteData('user_oura_data', props.uid);
            await deleteData('user_oura_key', props.uid);

            // Cookie delete
            removeCookie('oura');

            // Oura Access Revoke
            let url = OURA_URL + "revoke?access_token=" + access_token;
            console.log(url);
            try {
                await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8"
                    }
                });
            } catch (e) {
                console.log("Oura disconnect error", e);
            }
        }
    }

    // Calculate oura data and push to Firebase
    async function getOuraData(uid, access_token, cookies) {
        if (uid !== "" && access_token !== "" && typeof cookies.days !== "undefined") {
            const ouraData = await calculateAverages(access_token, cookies.days, () => connectToOura());
            if (!ouraData[0]) {
                setOuraData(ouraData[1]);
                setCookie('oura', JSON.stringify(ouraData[1]), {path: '/'})
                await addData("user_oura_data", uid, ouraData[1]);
                setRefreshing(false);
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

    // Get Key from Firebase
    async function getOuraKeyFromFirebase(uid) {
        let {result, error} = await getData("user_oura_key", props.uid);

        if (typeof result !== "undefined" && result !== null && result._document !== null) {
            let data = result._document.data.value.mapValue.fields;
            return data.access_token.stringValue;
        }
        return "error";
    }

    // Refresh (recalculate) Oura data and push to Firebase
    async function refresh() {
        setRefreshing(true);
        let access_token = await getOuraKeyFromFirebase(props.uid);
        if (access_token !== "error") {
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
                                style={{color: 'darkgreen'}}> improved by <b>{((ouraData.sober.readiness - ouraData.before.readiness) / ouraData.before.readiness * 100).toFixed(2)}%</b></span>
                            : <span
                                style={{color: 'darkred'}}> deteriorated by <b>{Math.abs((ouraData.sober.readiness - ouraData.before.readiness) / ouraData.before.readiness * 100).toFixed(2)}%</b></span>}
                    </p>

                    <p className={styles.ouraScore}><b>😴 Sleep</b>
                        {ouraData.sober.sleep_total > ouraData.before.sleep_total ?
                            <span
                                style={{color: 'darkgreen'}}> improved by <b>{((ouraData.sober.sleep_total - ouraData.before.sleep_total) / ouraData.before.sleep_total * 100).toFixed(2)}%</b></span>
                            : <span
                                style={{color: 'darkred'}}> deteriorated by <b>{Math.abs((ouraData.sober.sleep_total - ouraData.before.sleep_total) / ouraData.before.sleep_total * 100).toFixed(2)}%</b></span>}
                    </p>
                    <p className={styles.ouraScoreSub}>Your deep
                        sleep {ouraData.sober.sleep_deep > ouraData.before.sleep_deep ? "increased" : "decreased"} by <span
                            style={{
                                color: ouraData.sober.sleep_deep > ouraData.before.sleep_deep ? "darkgreen" : 'darkred',
                                fontWeight: 'bold'
                            }}>{Math.abs((ouraData.sober.sleep_deep - ouraData.before.sleep_deep) / ouraData.before.sleep_deep * 100).toFixed(2)}%</span>
                    </p>
                    <p className={styles.ouraScoreSub}>Your REM
                        sleep {ouraData.sober.sleep_rem > ouraData.before.sleep_rem ? "increased" : "decreased"} by <span
                            style={{
                                color: ouraData.sober.sleep_rem > ouraData.before.sleep_rem ? "darkgreen" : 'darkred',
                                fontWeight: 'bold'
                            }}>{Math.abs((ouraData.sober.sleep_rem - ouraData.before.sleep_rem) / ouraData.before.sleep_rem * 100).toFixed(2)}%</span>
                    </p>

                    <p className={styles.ouraScore}><b>🏃 Activity</b>
                        {ouraData.sober.activity > ouraData.before.activity ?
                            <span
                                style={{color: 'darkgreen'}}> improved by <b>{((ouraData.sober.activity - ouraData.before.activity) / ouraData.before.activity * 100).toFixed(2)}%</b></span>
                            : <span
                                style={{color: 'darkred'}}> deteriorated by <b>{Math.abs((ouraData.sober.activity - ouraData.before.activity) / ouraData.before.activity * 100).toFixed(2)}%</b></span>}
                    </p>
                    <p className={styles.ouraScoreSub}>You
                        burned <b>{Math.abs(ouraData.sober.calorie - ouraData.before.calorie).toFixed(0)} calories {ouraData.sober.calorie > ouraData.before.calorie ? "more" : "less"}</b> daily
                        on average.</p>

                    <div style={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'row',
                        margin: 0,
                        padding: 0,
                        alignItems: 'center'
                    }}>
                        <p className={styles.signInExplanationText}
                           style={{color: "darkred", textDecoration: "underline", cursor: "pointer"}}
                           onClick={() => disconnectOura()}>Disconnect</p>
                        <p className={styles.signInExplanationText} style={{width: '100%', textAlign: 'right'}}>Last
                            synced
                            on {ouraData.timestamp.slice(0, 21)}
                        </p>
                        <div
                            className={refreshing ? styles.loaderIcon : styles.loaderIconNotSpinning}
                            onClick={async () => await refresh()}>
                            <BiRefresh size={24} color={"rgb(128, 128, 128)"}/>
                        </div>
                    </div>
                </>
            }
        </div>
    );
}
