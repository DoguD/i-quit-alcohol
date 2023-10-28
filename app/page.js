'use client';
import styles from './page.module.css'
import '@fontsource/inter';
import DataInput from "@/components/DataInput";
import {useEffect, useState} from "react";
import DataShow from "@/components/DataShow";
import {useCookies} from "react-cookie";

import {auth, signInWithGoogle} from "@/components/Firebase/Firebase";
import {onAuthStateChanged, signOut} from "firebase/auth";
import {addData, getData} from "@/components/Firebase/FireStore";
import Oura from "@/components/Oura/Oura";

import {useSearchParams, useRouter} from "next/navigation";
import {calculateAverages} from "@/components/Oura/OuraUtility";

export default function Home() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [cookies, setCookie, removeCookie, getCookie] = useCookies(['cookie-name']);
    const [showData, setShowData] = useState(-1);
    const [uid, setUid] = useState("");
    const [ouraData, setOuraData] = useState(null);

    // OURA FIRST CONNECTION START
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const url = window.location.href;
            if (url.includes('/#')) {
                router.replace(url.replace('/#', '/?'));
            }
        }
    }, []);

    useEffect(() => {
        getOuraData(uid, searchParams, cookies);
    }, [searchParams, uid, cookies]);

    async function getOuraData(uid, searchParams, cookies) {
        if (uid !== "" && searchParams.has("access_token") && typeof cookies.days !== "undefined") {
            await addData("user_oura_key", uid, {
                access_token: searchParams.get("access_token")
            });

            const ouraData = await calculateAverages(searchParams.get("access_token"), cookies.days);
            if (!ouraData[0]) {
                await addData("user_oura_data", uid, ouraData[1]);
                setOuraData(ouraData[1]);
            }
        }
    }
    // OURA FIRST CONNECTION END

    // OURA ALREADY CONNECTED START
    useEffect(() => {
       getOuraDataFromFirebase(uid);
    }, [uid]);

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
    // OURA ALREADY CONNECTED END

    // LOCAL DATA START
    useEffect(() => {
        if (typeof cookies.days !== "undefined") {
            setShowData(1);
        } else {
            setShowData(0);
        }
    }, []);
    // LOCAL DATA END

    // FIREBASE AUTH START
    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                const uid = user.uid;
                setUid(uid);
            }
        });
    }, [])

    useEffect(() => {
        // If there is a logged user try to get data from server
        if (uid !== "") {
            getDataOfUser(uid);
        }
    }, [uid])

    async function getDataOfUser(uid) {
        let {result, error} = await getData("user_sober_data", uid);

        // If there is data in the server, put it to cookie
        if (result._document != null) {
            let data = result._document.data.value.mapValue.fields;
            let days = data.days.stringValue;
            let drink = data.drinkCount.stringValue;
            let cost = data.cost.stringValue;
            let type = data.type.stringValue;

            setCookie('days', days, {path: '/'});
            setCookie('drink', drink, {path: '/'});
            setCookie('type', type, {path: '/'});
            setCookie('cost', cost, {path: '/'});

            setShowData(1);
        }
        // If no data in the server but in cookies put cookie data to server
        else if (typeof cookies.days !== "undefined") {
            await addData("user_sober_data", uid, {
                days: cookies.days,
                drinkCount: cookies.drink,
                cost: cookies.cost,
                type: cookies.type
            });
        }
    }

    function signOutClient() {
        signOut(auth).then(() => {
            setUid("");
        }).catch((error) => {
            console.log("Error signing out: ", error);
        });
    }
    // FIREBASE AUTH END

    return (
        <main className={styles.main}>
            {showData === -1 ? <div/> :
                showData === 1 ? <DataShow reload={() => setShowData(0)} uid={uid}/> :
                    <DataInput reload={() => setShowData(1)} uid={uid}/>
            }

            <div className={styles.centeredRow + " " + styles.signInRow} style={{marginTop: 16}}>
                <p className={styles.signInExplanationText}>
                    {uid === "" ? "You can save your data and sync across devices by signing in."
                        : ""}</p>

                {uid === "" ?
                    <div style={{cursor: 'pointer'}} onClick={() => signInWithGoogle()}>
                        <img src={'/google/web_light_rd_SI@4x.png'} alt={"Google Sign-In Button"} width={160}/>
                    </div> :
                    <p className={styles.signInExplanationText} onClick={() => signOutClient()}
                       style={{textDecoration: "underline", cursor: 'pointer'}}>Logout</p>}
            </div>

            {uid !== "" && showData === 1 ? <Oura uid={uid} ouraData={ouraData}/>
                : null}
            <p className={styles.footerText}>Made with ❤️ by <a href={"https://github.com/DoguD"}
                                                                target={"_blank"}
                                                                rel={"noopener"}>Dogu</a></p>
        </main>
    )
}
