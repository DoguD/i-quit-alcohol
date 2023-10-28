import {app} from "./Firebase";
import { getFirestore, doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";

const db = getFirestore(app)
export async function addData(colllection, id, data) {
    let result = null;
    let error = null;

    try {
        result = await setDoc(doc(db, colllection, id), data, {
            merge: true,
        });
    } catch (e) {
        error = e;
    }

    console.log(result, error);
    return { result, error };
}

export async function getData(collection, id) {
    let docRef = doc(db, collection, id);

    let result = null;
    let error = null;

    try {
        result = await getDoc(docRef);
    } catch (e) {
        error = e;
    }

    return { result, error };
}

export async function deleteData(collection, id) {
    let docRef = doc(db, collection, id);

    let result = null;
    let error = null;

    try {
        result = await deleteDoc(docRef);
    } catch (e) {
        error = e;
    }

    return {result, error};
}
