import {configureStore} from '@reduxjs/toolkit'
import {wordleSlice} from "../reducers/wordleSlice";

export default configureStore({
    reducer: {
        wordleGame: wordleSlice.reducer,
    }
})