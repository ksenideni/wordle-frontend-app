import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import AttemptService from "../service/AttemptService";
import {COLOR_GREEN, COLOR_GREY, COLOR_YELLOW} from "../constants/constants";

export const fetchWords = createAsyncThunk(
    'fetch',
    async () => {
        return AttemptService.getAttempts()
    }
)

export const postWord = createAsyncThunk(
    'post',
    async (word) => {
        return AttemptService.postAttempt(word)
    }
)

export const wordleSlice = createSlice({
    name: "wordleReducer",
    initialState: {
        words: [],
        buffer: ''
    },
    reducers: {
        deleteFromBuffer: state => {
            state.buffer = state.buffer.slice(0, -1);
        },
        addToBuffer: (state, action) => {
            state.buffer += action.payload;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchWords.fulfilled, (state, action) => {
            state.words = adapterResponse(action.payload)
        });
        builder.addCase(postWord.fulfilled, (state, action) => {
            let newTry = adapterWord(action.payload.tries[action.payload.tries.length-1].letters);
            let newWords = [...state.words];
            newWords.push(newTry)
            state.words = newWords;
            state.buffer = '';
        });

    }
});

export const {
    deleteFromBuffer,
    addToBuffer,
    get,
    post
} = wordleSlice.actions

export default wordleSlice.reducer

function adapterResponse(response) {
    let words = []
    let tries = response.tries
    for (let i in tries) {
        words.push(adapterWord(tries[i].letters))
    }
    return words;
}

function adapterWord(colorLettersInWord) {
    let word = ''
    let colors = []
    for (let i in colorLettersInWord) {
        word += colorLettersInWord[i].character
        colors.push(getColor(colorLettersInWord[i].color))
    }
    return {word, colors}
}

function getColor(colorName) {
    switch (colorName) {
        case "GREY":
            return COLOR_GREY
        case "YELLOW":
            return COLOR_YELLOW
        case "GREEN":
            return COLOR_GREEN
        default:
            console.log('COLOR_NOT_FOUND')
    }
}