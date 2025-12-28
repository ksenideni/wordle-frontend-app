import React from 'react';
import {useSelector} from 'react-redux'
import Wordline from '../wordline/wordline';
import {COLOR_WHITE, MAX_NUMBER_OF_ATTEMPTS} from "../../../constants/constants";
import styles from './wordboard.module.css';

export default function Wordboard() {

    let words = useSelector(state => state.wordleGame.words);
    let buffer = useSelector(state => state.wordleGame.buffer);

    const attempts = createEnteredAttemptList(words);

    let bufferColors = createBufferColors();

    //заполнение борды текущей попыткой
    if (words.length < 5) {
        attempts.push(renderWordline(attempts.length, bufferColors, buffer));
    }

    //заполнение не тронутых попыток
    for (let i = 0; i < MAX_NUMBER_OF_ATTEMPTS - words.length - 1; i++) {
        attempts.push(renderWordline(attempts.length, bufferColors, ''));
    }

    return (
        <div className={styles.gameBoardContainer}>
            {attempts}
        </div>
    );
}

function createEnteredAttemptList(words) {
    let attempts = [];
    for (let i = 0; i < words.length; i++) {
        attempts.push(renderWordline(i, words[i].colors, words[i].word));
    }
    return attempts;
}

function renderWordline(key, colors, word) {
    return (<Wordline
        key={key}
        wordColors={colors}
        word={word}
    />);
}

function createBufferColors() {
    const bufferColors = [];
    for (let i = 0; i < 5; i++) {
        bufferColors.push(COLOR_WHITE);
    }
    return bufferColors;
}