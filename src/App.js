import styles from './App.css';
import KeyBoard from './components/keyboard';
import Wordboard from './components/game/wordboard/wordboard';
import {fetchWords} from "./reducers/wordleSlice";
import {useDispatch} from "react-redux";

function App() {
    const dispatch = useDispatch();

    dispatch(fetchWords())
    return (
        <div className="App">
            <Wordboard></Wordboard>
            <div className={styles.span}></div>
            <KeyBoard></KeyBoard>

        </div>
    );
}

export default App;
