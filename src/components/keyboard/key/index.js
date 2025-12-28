import React from 'react';
import styles from './key.module.css';
export default function Key(props) {

    return (
        <button className={styles[props.color]} onClick={()=>props.onClick()}>
            {props.char}
        </button>
    );
}