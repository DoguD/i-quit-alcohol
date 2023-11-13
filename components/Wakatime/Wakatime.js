import styles from '../../app/page.module.css'
import {Button, Input} from "@mui/joy";

import {useEffect, useState} from "react";
import {addData, getData} from "@/components/Firebase/FireStore";
import {useCookies} from "react-cookie";
import {BiRefresh} from "react-icons/bi";
import {getWakatimeData} from "@/components/Wakatime/WakatimeUtility";

export default function Wakatime(props) {
    const [cookies, setCookie, removeCookie, getCookie] = useCookies(['cookie-name']);
    const [refreshing, setRefreshing] = useState(false);

    const [connectionUrl, setConectionUrl] = useState("");
    const [showConnection, setShowConnection] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [wakaData, setWakaData] = useState(null);

    useEffect(() => {
        if (typeof cookies.waka !== "undefined") {
            setWakaData(cookies.waka);
        }
    }, []);

    // If there is a user try to get data from Firebase
    useEffect(() => {
        if (props.uid !== "") {
            getWakaDataFromFirebase(props.uid);
        }
    }, [props.uid]);


    // Get Waka data from Firebase
    async function getWakaDataFromFirebase(uid) {
        if (uid !== "") {
            let {result, error} = await getData("user_waka_data", uid);
            if (typeof result !== "undefined" && result !== null && result._document !== null) {
                let data = result._document.data.value.mapValue.fields;

                const parsedData = {
                    before: data.before.doubleValue,
                    after: data.after.doubleValue,
                    timestamp: data.timestamp.stringValue
                }

                setWakaData(parsedData);
            }
        }
    }

    // Main get data function
    async function getAndUpdateWakatimeData(url) {
        let wakatimeData = await getWakatimeData(url, cookies.days);
        if (!wakatimeData[0]) {
            let parsedData = {
                before: wakatimeData[1][0],
                after: wakatimeData[1][1],
                timestamp: wakatimeData[2]
            }
            console.log(parsedData)
            setWakaData(parsedData);
            setCookie('waka', JSON.stringify(parsedData), {path: '/'})
            await addData("user_waka_data", props.uid, parsedData);
        }
    }

    // Refresh (recalculate) Waka data and push to Firebase
    async function refresh() {
        setRefreshing(true);
        let {result, error} = await getData("user_waka_url", props.uid);

        if (typeof result !== "undefined" && result !== null && result._document !== null) {
            let data = result._document.data.value.mapValue.fields;
            const url = data.url.stringValue;

            await getAndUpdateWakatimeData(url)
        }
        setRefreshing(false);
    }

    async function connectWakaTime() {
        setIsConnecting(true);
        await addData("user_waka_url", props.uid, {
            url: connectionUrl
        });
        getAndUpdateWakatimeData(connectionUrl);
        setIsConnecting(false);
    }

    return (
        <div className={styles.ouraContainer}>
            <div className={styles.titleRow}>
                {wakaData === null ?
                    <p className={styles.ouraTitle} style={{marginRight: 16}}>Connect with</p> : null}
                <img src={'/wakatime/horizontal.svg'} alt={'Wakatime Logo'}
                     className={styles.wakatimeImage}/>
            </div>
            {wakaData === null ?
                <>
                    {showConnection ?
                        <p className={styles.ouraDescription}>Copy paste your <b>All Time, JSON, Coding Activity
                            (Table)</b> embeddable URL from <a href={"https://wakatime.com/share/embed"}
                                                               target={"_blank"} rel={"noreferrer"}
                                                               style={{
                                                                   textDecoration: "underline",
                                                                   color: "darkblue"
                                                               }}>here</a> as shown below.</p>
                        :
                        <p className={styles.ouraDescription}>If you are a developer, you can connect your WakaTime
                            account
                            and see how quiting
                            alcohol affects your coding activity.</p>}

                    {showConnection ?
                        <>
                            <img src={"/wakatime/connection_detail.png"} alt={"WakaTime Connection Detail"}
                                 className={styles.wakatimeConnectionDetailImage}/>
                            <div className={styles.wakaConnectionRow}>
                                <Input className={styles.wakaInput} color="primary" variant="soft" size={"sm"}
                                       style={{margin: 0, width: '100%'}}
                                       placeholder={"https://wakatime.com/share/@john/464defff-96af-4d42-ad55-6676.json"}
                                       onChange={(event) => {
                                           setConectionUrl(event.target.value);
                                       }}/>
                                <Button className={styles.buttonNormalText} color={"primary"}
                                        style={{marginLeft: 8}}
                                        onClick={async () => connectWakaTime()}
                                >{isConnecting ? "Connecting..." : "Connect"}</Button>
                            </div>
                        </>
                        :
                        <div className={styles.centeredRow}>
                            <Button className={styles.buttonNormalText} color={"primary"}
                                    onClick={() => setShowConnection(true)}
                            >Connect</Button>
                        </div>
                    }
                </> : <>
                    <p className={styles.ouraDescription}>Averages below are calculated by comparing the data after
                        you
                        stopped drinking and 6 months before then.</p>
                    <p className={styles.ouraScore}>
                        <b>💻 Daily Coding Activity</b>
                        {wakaData.after > wakaData.before ?
                            <span
                                style={{color: 'darkgreen'}}> improved by <b>{((wakaData.after * 100 / wakaData.before) - 100).toFixed(2)}%</b></span>
                            : <span
                                style={{color: 'darkred'}}> deteriorated by <b>{Math.abs((wakaData.after * 100 / wakaData.before) - 100).toFixed(2)}%</b></span>}
                    </p>

                    <p className={styles.ouraScoreSub}>Your daily average <span
                        style={{
                            color: wakaData.after > wakaData.before ? "darkgreen" : 'darkgreen',
                        }}>{wakaData.after > wakaData.before ? "increased" : "decreased"}</span> from
                        <b>{" "}{Math.floor(wakaData.before / 60 / 60)}h {Math.floor((wakaData.before / 60 / 60 - Math.floor(wakaData.before / 60 / 60)) * 60)}m</b> to
                        {" "}<b>{Math.floor(wakaData.after / 60 / 60)}h {Math.floor((wakaData.after / 60 / 60 - Math.floor(wakaData.after / 60 / 60)) * 60)}m</b>
                    </p>

                    <div style={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'row',
                        margin: 0,
                        padding: 0,
                        alignItems: 'center'
                    }}>
                        <p className={styles.signInExplanationText} style={{width: '100%', textAlign: 'right'}}>Last
                            synced
                            on {wakaData.timestamp.slice(0, 21)}
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
