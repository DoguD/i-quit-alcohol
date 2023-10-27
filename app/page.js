'use client';
import styles from './page.module.css'
import '@fontsource/inter';
import DataInput from "@/components/DataInput";
import {useEffect, useState} from "react";
import DataShow from "@/components/DataShow";
import {useCookies} from "react-cookie";

import {auth, signInWithGoogle} from "@/components/Firebase/Firebase";
import {onAuthStateChanged, signOut} from "firebase/auth";

export default function Home() {
    const [cookies, setCookie, removeCookie, getCookie] = useCookies(['cookie-name']);
    const [showData, setShowData] = useState(-1);
    const [uid, setUid] = useState("");

    useEffect(() => {
        if (typeof cookies.days !== "undefined") {
            setShowData(1);
        } else {
            setShowData(0);
        }
    }, []);

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                // User is signed in, see docs for a list of available properties
                // https://firebase.google.com/docs/reference/js/firebase.User
                const uid = user.uid;
                // ...
                console.log("User Logged In: ", uid);
                setUid(uid);
            } else {
                // User is signed out
                // ...
                console.log("user is logged out")
            }
        });

    }, [])

    function signOutClient() {
        signOut(auth).then(() => {
            setUid("");
        }).catch((error) => {
            console.log("Error signing out: ", error);
        });
    }

    return (
        <main className={styles.main}>
            {showData === -1 ? <div/> :
                showData === 1 ? <DataShow reload={() => setShowData(0)}/> :
                    <DataInput reload={() => setShowData(1)}/>
            }
            <div className={styles.centeredRow} style={{marginTop: 16}}>
                <p className={styles.signInExplanationText}>
                    {uid === "" ? "You can save your data and sync across devices by signing in."
                        : "You are signed in."}</p>
                {uid === "" ?
                    <div style={{cursor: 'pointer'}} onClick={() => signInWithGoogle()}>
                        <img src={'/google/web_light_rd_SI@4x.png'} alt={"Google Sign-In Button"} width={160}/>
                    </div> :
                    <p className={styles.signInExplanationText} onClick={() => signOutClient()}
                       style={{textDecoration: "underline", cursor: 'pointer'}}>Logout</p>}
            </div>
            <p className={styles.footerText}>Made with ❤️ by <a href={"https://github.com/DoguD"}
                                                                target={"_blank"}
                                                                rel={"noopener"}>Dogu</a></p>
        </main>
    )
}
