import React from 'react';
import Key from './key';
import {useDispatch, useSelector} from "react-redux";
import {addToBuffer, deleteFromBuffer,postWord} from "../../reducers/wordleSlice";
import {COLOR_WHITE} from "../../constants/constants";
import styles from './keyboard.module.css';


export default function KeyBoard({ onSubmitWord, disabled }) {
    // const [buffer, words] = useSelector((state) => [state.wordleGame.buffer, state.wordleGame.words]);
    const buffer = useSelector(state => state.wordleGame.buffer);
    const words = useSelector(state => state.wordleGame.words);
    const dispatch = useDispatch();

    const charColorMap = createCharColorMap(words);

    // const doRenderKey = renderKeyFactory(charColorMap);
    const doCollectArrayOfKey = collectArrayOfKeyFactory(charColorMap);


    const row1 = 'qwertyuiop';
    const row2 = 'asdfghjkl';
    const row3 = 'zxcvbnm';


    const rowArray1 = doCollectArrayOfKey(row1, buffer, dispatch, disabled);
    const rowArray2 = doCollectArrayOfKey(row2, buffer, dispatch, disabled);
    const rowArray3 = doCollectArrayOfKey(row3, buffer, dispatch, disabled);
    rowArray3.push(renderColorKey(rowArray3.length, 'Enter', 'specialKey', enterOnClickFunc(buffer, dispatch, onSubmitWord, disabled)));

    rowArray3.unshift(renderColorKey(-1, 'Delete', 'specialKey', deleteOnClickFunc(dispatch, disabled)))
    return (
        <div className={styles.keyboardContainer}>
            <div className={styles.keyboardRow}>
                {rowArray1}
            </div>
            <div className={styles.keyboardRow}>
                {rowArray2}
            </div>
            <div className={styles.keyboardRow}>
                {rowArray3}
            </div>
        </div>
    );

}


function renderKeyFactory(charColorMap) {
    return (key, char, onClickFunc) => {
        if (charColorMap.has(char)) {
            return renderColorKey(key, char, charColorMap.get(char), onClickFunc);
        }
        return renderColorKey(key, char, COLOR_WHITE, onClickFunc);
    }
}

function renderColorKey(key, char, color, onClickFunc) {
    return (
        <Key
            key={key}
            char={char}
            color={color}
            onClick={onClickFunc}
        />
    );
}

//----------------on click functions----------------on
function collectArrayOfKeyFactory(charColorMap) {
    const doRenderKey = renderKeyFactory(charColorMap);
    return (row, buffer, dispatch, disabled) => {
        const rowArray = [];
        for (let i in row) {
            const char = row[i];
            rowArray.push(doRenderKey(rowArray.length, char, printOnClickFunc(char, buffer, dispatch, disabled)));
        }
        return rowArray;
    }
}

function printOnClickFunc(a, buffer, dispatch, disabled) {
    return () => {
        if (disabled) return;
        if (buffer.length < 5) {
            dispatch(addToBuffer(a));
        } else {
            console.log('buffer is full')
        }
    };
}

function enterOnClickFunc(buffer, dispatch, onSubmitWord, disabled) {
    return () => {
        if (disabled) return;
        if (buffer.length !== 5) {
            console.log('Word must be 5 letters');
            return;
        }
        if (onSubmitWord) {
            // Передаем строку buffer в handleWordSubmit (в Redux buffer - это строка)
            onSubmitWord(buffer);
        } else {
            dispatch(postWord(buffer));
        }
    }
}

function deleteOnClickFunc(dispatch, disabled) {
    return () => {
        if (disabled) return;
        dispatch(deleteFromBuffer());
    }
}

//----------------buildMap func----------------on

function createCharColorMap(words) {
    const map = new Map();
    for (let i = 0; i < words.length; i++) {
        const currentWord = words[i].word;
        const currentColors = words[i].colors;
        for (let j = 0; j < currentWord.length; j++) {
            if (!map.has(currentWord[j])) {
                map.set(currentWord[j], currentColors[j]);
            }
        }
    }
    return map;
}