'use client';
import styles from './page.module.css'
import '@fontsource/inter';
import DataInput from "@/components/DataInput";
import {useEffect, useState} from "react";
import DataShow from "@/components/DataShow";
import {useCookies, getAll} from "react-cookie";

export default function Home() {
    const [cookies, setCookie, removeCookie, getCookie] = useCookies(['cookie-name']);
    const [showData, setShowData] = useState(-1);

    useEffect(() => {
        if (typeof cookies.days !== "undefined") {
            setShowData(1);
        } else {
            setShowData(0);
        }
    }, []);

    return (
        <main className={styles.main}>
            {showData === -1 ? <div/> :
                showData === 1 ? <DataShow reload={() => setShowData(0)}/> :
                    <DataInput reload={() => setShowData(1)}/>
            }
            <p className={styles.footerText}>Made with ❤️ by <a href={"https://github.com/DoguD"}
                                                                target={"_blank"}
                                                                rel={"noopener"}>Dogu</a></p>
        </main>
    )
}
