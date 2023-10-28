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
            <div className={styles.titleRow} style={{margin: 0}}>
                <p className={styles.ouraTitle}>Connect with</p>
                <img src={'/oura.webp'} alt={'Oura'} className={styles.ouraImage}/>
            </div>
            <p className={styles.ouraDescription}>You can connect your Oura ring account and see how quiting alcohol affects
                your sleep, activity, and readiness.</p>

            <div className={styles.centeredRow}>
                <Button className={styles.buttonNormalText} color={"primary"}
                        onClick={() => connectToOura()}
                >Connect</Button>
            </div>
        </div>
    );
}
