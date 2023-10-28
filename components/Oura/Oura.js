import styles from '../../app/page.module.css'
import {Button} from "@mui/joy";
import {useRouter} from "next/navigation";

import {OURA_URL, OURA_CLIENT_ID, OURA_REDIRECT_URI} from "@/components/Constants";

export default function Oura(props) {
    const router = useRouter();

    function connectToOura() {
        let url = OURA_URL + "authorize?response_type=token&client_id=" + OURA_CLIENT_ID + "&redirect_uri=" + OURA_REDIRECT_URI + "&state=" + props.uid;
        router.push(url)
    }

    return (
        <div className={styles.ouraContainer}>
            <div className={styles.titleRow}>
                {props.ouraData === null ?
                    <p className={styles.ouraTitle} style={{marginRight: 16}}>Connect with</p> : null}
                <img src={'/oura.jpg'} alt={'Oura'} className={styles.ouraImage}/>
            </div>
            {props.ouraData === null ?
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
                    <p className={styles.ouraDescription}>Averages below are calculated by comparing the data after you stopped drinking and 6 months before then.</p>
                    <p className={styles.ouraScore}>
                        <b>💪 Readiness</b>
                        {props.ouraData.sober.readiness > props.ouraData.before.readiness ?
                            <span
                                style={{color: 'darkgreen'}}> improved by <b>{((props.ouraData.sober.readiness * 100 / props.ouraData.before.readiness) - 100).toFixed(2)}%</b></span>
                            : <span
                                style={{color: 'darkred'}}> deteriorated by <b>{Math.abs((props.ouraData.sober.readiness * 100 / props.ouraData.before.readiness) - 100).toFixed(2)}%</b></span>}
                    </p>

                    <p className={styles.ouraScore}><b>😴 Sleep</b>
                        {props.ouraData.sober.sleep_total > props.ouraData.before.sleep_total ?
                            <span
                                style={{color: 'darkgreen'}}> improved by <b>{((props.ouraData.sober.sleep_total * 100 / props.ouraData.before.sleep_total) - 100).toFixed(2)}%</b></span>
                            : <span
                                style={{color: 'darkred'}}> deteriorated by <b>{Math.abs((props.ouraData.sober.sleep_total * 100 / props.ouraData.before.sleep_total) - 100).toFixed(2)}%</b></span>}
                    </p>
                    <p className={styles.ouraScoreSub}>Your deep
                        sleep {props.ouraData.sober.sleep_deep > props.ouraData.before.sleep_deep ? "increased" : "decreased"} by <span
                            style={{
                                color: props.ouraData.sober.sleep_deep > props.ouraData.before.sleep_deep ? "darkgreen" : 'darkgreen',
                                fontWeight: 'bold'
                            }}>{((props.ouraData.sober.sleep_deep * 100 / props.ouraData.before.sleep_deep) - 100).toFixed(2)}%</span>
                    </p>
                    <p className={styles.ouraScoreSub}>Your REM
                        sleep {props.ouraData.sober.sleep_rem > props.ouraData.before.sleep_rem ? "increased" : "decreased"} by <span
                            style={{
                                color: props.ouraData.sober.sleep_rem > props.ouraData.before.sleep_rem ? "darkgreen" : 'darkgreen',
                                fontWeight: 'bold'
                            }}>{((props.ouraData.sober.sleep_rem * 100 / props.ouraData.before.sleep_rem) - 100).toFixed(2)}%</span>
                    </p>

                    <p className={styles.ouraScore}><b>🏃 Activity</b>
                        {props.ouraData.sober.activity > props.ouraData.before.activity ?
                            <span
                                style={{color: 'darkgreen'}}> improved by <b>{((props.ouraData.sober.activity * 100 / props.ouraData.before.activity) - 100).toFixed(2)}%</b></span>
                            : <span
                                style={{color: 'darkred'}}> deteriorated by <b>{Math.abs((props.ouraData.sober.activity * 100 / props.ouraData.before.activity) - 100).toFixed(2)}%</b></span>}
                    </p>
                    <p className={styles.ouraScoreSub}>You
                        burned {Math.abs(props.ouraData.sober.calorie - props.ouraData.before.calorie).toFixed(0)} calories {props.ouraData.sober.calorie > props.ouraData.before.calorie ? "more" : "less"} daily
                        on average.</p>

                    <p className={styles.signInExplanationText} style={{width: '100%', textAlign: 'right'}}>Last synced
                        on {props.ouraData.timestamp.slice(0, 21)} <span
                            onClick={() => props.refresh()} style={{textDecoration: "underline", cursor: "pointer"}}>
                            Refresh
                        </span></p>
                </>
            }
        </div>
    );
}
