import React from 'react';
import Letter from '../letter/letter';
import styles from './wordline.module.css'


export default class Wordline extends React.Component {

    render() {
        var colors = this.props.wordColors;
        var chars = this.props.word;
        var wordline = [];
        for (let i = 0; i < 5; i++) {
            let char = '';
            if (i < chars.length) {
                char = chars[i]
            }
            wordline.push(
                <Letter
                    key={i}
                    color={colors[i]}
                    char={char}
                />
            )
        }
        return (
            <div className={styles.wordline}>
                {wordline}
            </div>
        );
    }
}