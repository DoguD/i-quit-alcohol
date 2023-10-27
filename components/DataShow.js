import {useCookies} from "react-cookie";
import {useEffect, useState} from "react";
import styles from "@/app/page.module.css";
import {Button} from "@mui/joy";
import {deleteData} from "@/components/Firebase/FireStore";

const drinkToEmoji = {
    "beer": "🍺",
    "wine": "🍷",
    "liquor": "🥃",
    "cocktail": "🍸"
}

const drinkToCalorie = {
    "beer": 200,
    "wine": 200,
    "liquor": 100,
    "cocktail": 250
}

const hamburgerCalorie = 350;

export default function DataShow(props) {
    const [cookies, setCookie, removeCookie] = useCookies(['cookie-name']);

    const [days, setDays] = useState(0);
    const [drinkCount, setDrinkCount] = useState(0);
    const [type, setType] = useState("beer");
    const [cost, setCost] = useState(0);

    useEffect(() => {
        let today = new Date();
        let days = Math.round((today.getTime() - cookies.days) / (24 * 60 * 60 * 1000));
        let drinkCount = Math.round(days * cookies.drink / 7);
        let cost = Math.round(days * cookies.cost / 7);
        let type = cookies.type;

        setDays(days);
        setDrinkCount(drinkCount);
        setCost(cost);
        setType(type);
    }, [props.uid]);

    const deleteAllCookies = async () => {
        const cookies = document.cookie.split(";");

        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i];
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }

        if (props.uid !== "") {
            await deleteData('user_sober_data', props.uid);
        }

        props.reload();
    }

    return (
        <div>
            <div className={styles.titleRow}>
                <p className={styles.title}>Congrats! You quit drinking {days} days ago. 🤘</p>
            </div>
            <div className={styles.titleRow}>
                <p className={styles.title}>By not drinking {drinkCount} {drinkToEmoji[type]}, you saved
                    ${(cost).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}.</p>
            </div>
            <div className={styles.titleRow} style={{marginBottom: 64}}>
                <p className={styles.title}>You refrained
                    from {(drinkToCalorie[type] * drinkCount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} calories.
                    🔥 That is {Math.round(drinkToCalorie[type] * drinkCount / hamburgerCalorie)} 🍔.</p>
            </div>

            <div className={styles.centeredRow}>
                <Button className={styles.buttonNormalText} color={"primary"} onClick={deleteAllCookies}
                >Recalculate</Button>
            </div>
        </div>
    )
}
