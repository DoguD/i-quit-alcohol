import {useState} from "react";
import styles from "@/app/page.module.css";
import {Button, Input, Select} from "@mui/joy";
import Option from "@mui/joy/Option";
import {useCookies} from "react-cookie";
import {addData} from "@/components/Firebase/FireStore";

export default function DataInput(props) {
    const [cookies, setCookie, removeCookie] = useCookies(['cookie-name']);

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

    const saveData = async () => {
        let today = new Date();
        let timestamp = today.getTime() - days * 24 * 60 * 60 * 1000
        setCookie('days', timestamp, {path: '/'});
        setCookie('drink', drink, {path: '/'});
        setCookie('type', type, {path: '/'});
        setCookie('cost', cost, {path: '/'});

        if (props.uid !== "") {
            await addData("user_sober_data", props.uid, {
                days: timestamp,
                drinkCount: drink,
                cost: cost,
                type: type
            });
        }
        props.reload();
    }

    return (
        <div>
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

            <div className={styles.titleRow} style={{marginBottom: 64}}>
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

            <div className={styles.centeredRow}>
                <Button className={styles.button} color={"primary"} onClick={saveData}
                        disabled={isNaN(days) || isNaN(drink) || isNaN(cost)}><p className={styles.bigEmoji}>🤘</p></Button>
            </div>
        </div>
    )
}
