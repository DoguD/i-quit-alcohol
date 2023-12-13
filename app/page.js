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

import Wakatime from "@/components/Wakatime/Wakatime";

export default function Home() {
    const [cookies, setCookie, removeCookie, getCookie] = useCookies(['cookie-name']);
    const [showData, setShowData] = useState(-1);
    const [uid, setUid] = useState("");

    useEffect(() => {
        // User
        if (typeof cookies.login !== "undefined") {
            setUid(cookies.login);
        }
        // Not drinking data
        if (typeof cookies.days !== "undefined") {
            setShowData(1);
        } else {
            setShowData(0);
        }
    }, []);

    // FIREBASE AUTH START
    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                const uid = user.uid;
                setUid(uid);
                setCookie('login', uid, {path: '/'});
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
            removeCookie('login');
        }).catch((error) => {
            console.log("Error signing out: ", error);
        });
    }

    // FIREBASE AUTH END

    return (
        <main className={styles.main}>
            {showData === -1 ? <div/> :
                <>
                    {showData === 1 ? <DataShow reload={() => setShowData(0)} uid={uid}/> :
                        <DataInput reload={() => setShowData(1)} uid={uid}/>}

                    <div className={styles.centeredRow + " " + styles.signInRow} style={{marginTop: 16}}>
                        <p className={styles.signInExplanationText}>
                            {uid === "" ? "You can save your data and sync across devices by signing in."
                                : ""}</p>

                        {uid === "" ?
                            <div style={{cursor: 'pointer'}} onClick={() => signInWithGoogle()}>
                                <img src={'/google/web_light_rd_SI@4x.png'} alt={"Google Sign-In Button"} width={160}/>
                            </div> :
                            <>
                                <p className={styles.signInExplanationText} onClick={() => signOutClient()}
                                   style={{textDecoration: "underline", cursor: 'pointer'}}>Logout</p>
                            </>
                        }
                    </div>

                    {showData === 1 ?
                        <Oura
                            uid={uid}
                            cookies={cookies}/>
                        : null}

                    {showData === 1 ?
                        <Wakatime uid={uid}/> : null}
                </>
            }

            {/*
            <p className={styles.footerText}>Made with ❤️ by <a href={"https://github.com/DoguD"}
                                                                target={"_blank"}
                                                                rel={"noopener"}>Dogu</a></p>
                                                                */}
        </main>
    )
}
