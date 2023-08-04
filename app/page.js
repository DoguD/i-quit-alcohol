'use client';
import styles from './page.module.css'
import '@fontsource/inter';
import {Button, Input, Select} from "@mui/joy";
import Option from '@mui/joy/Option';
import {useState} from "react";

export default function Home() {
    const [days, setDays] = useState();
    const [drink, setDrink] = useState();
    const [type, setType] = useState("beer");
    const [cost, setCost] = useState();

    const handleChangeType = (event, newValue) => {
        setType(newValue);
    };

    const handleChangeDays = (event) => {
        setDays(event.target.value);
    }

    const handleChangeDrink = (event) => {
        setDrink(event.target.value);
    }

    const handleChangeCost = (event) => {
        setCost(event.target.value);
    }

    const saveData = () => {
        alert(days + " " + drink + " " + type + " " + cost);
    }

    return (
        <main className={styles.main}>
            <div className={styles.titleRow}>
                <p className={styles.title}>I quit alcohol</p>
                <Input className={styles.input} color="primary" variant="soft" size={"sm"}
                       style={{marginLeft: 8, marginRight: 8, width: 60}}
                       onChange={handleChangeDays}/>
                <p className={styles.title}>days ago.</p>
            </div>

            <div className={styles.titleRow}>
                <p className={styles.title}>I was mostly drinking</p>
                <Select defaultValue="beer" style={{marginRight: 8, marginLeft: 8}} onChange={handleChangeType}>
                    <Option value="beer">🍺 Beer</Option>
                    <Option value="wine">🍷 Wine</Option>
                    <Option value="liquor">🥃 Liquor</Option>
                    <Option value="cocktail">🍸 Cocktails</Option>
                </Select>
                <p className={styles.title}>.</p>
            </div>

            <div className={styles.titleRow} style={{marginBottom: 32}}>
                <p className={styles.title}>On average consuming</p>
                <Input className={styles.input} color="primary" variant="soft" size={"sm"}
                       style={{marginLeft: 8, marginRight: 8, width: 60}}
                       onChange={handleChangeDrink}/>
                <p className={styles.title}> drinks and spending $</p>
                <Input className={styles.input} color="primary" variant="soft" size={"sm"}
                       style={{marginLeft: 0, marginRight: 8, width: 120}}
                       onChange={handleChangeCost}/>
                <p className={styles.title}>per week.</p>
            </div>

            <Button className={styles.button} color={"primary"} onClick={saveData} disabled={isNaN(days) || isNaN(drink) || isNaN(cost)}>🤘</Button>


            <p className={styles.footerText}>Made with ❤️ by <a href={"https://github.com/DoguD"}
                                                                target={"_blank"}
                                                                rel={"noopener"}>Dogu</a></p>
        </main>
    )
}
