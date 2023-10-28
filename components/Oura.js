import styles from '../app/page.module.css'
import {Button} from "@mui/joy";
import {useRouter} from "next/navigation";

const CLIENT_ID = process.env.NEXT_PUBLIC_OURA_CLIENT_ID;
const OURA_URL = "https://cloud.ouraring.com/oauth/";
// const REDIRECT_URI = "https://i-quit-alcohol.vercel.app
const REDIRECT_URI = "http://localhost:3000";

export default function Oura(props) {
    const router = useRouter();

    function connectToOura() {
        let url = OURA_URL + "authorize?response_type=token&client_id=" + CLIENT_ID + "&redirect_uri=" + REDIRECT_URI + "&state=" + props.uid;
        router.push(url)
    }

    return (
        <div className={styles.ouraContainer}>
            <div className={styles.titleRow} style={{margin: 0}}>
                <p className={styles.ouraTitle}>Connect with</p>
                <img src={'/oura.webp'} alt={'Oura'} className={styles.ouraImage}/>
            </div>
            <p className={styles.ouraDescription}>You can connect your Oura account and see how quiting alcohol affects
                your sleep, activity, and readiness.</p>

            <div className={styles.centeredRow}>
                <Button className={styles.buttonNormalText} color={"primary"}
                        onClick={() => connectToOura()}
                >Connect</Button>
            </div>
        </div>
    );
}
