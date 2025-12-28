import {COLOR_GREEN, COLOR_GREY, COLOR_YELLOW} from "../constants/constants";
import axios from "axios";

export default class AttemptService {
    static host = process.env.REACT_APP_WORDLE_BACKEND_HOST
    // static host = 'http://localhost:8080'

    static prefixURL = this.host + '/wordle/attempts'

    static async getAttempts() {
        console.log('this.host')
        console.log(this.host)
        const currentURLString = window.location.href;
        const currentURL = new URL(currentURLString);
        const chatId = currentURL.searchParams.get('chat_id')
        const userId = currentURL.searchParams.get('user_id')

        const result = await axios.get(
            this.prefixURL,
            {
                params: {
                    chatId,
                    userId
                },
            })
        return result.data
    }

    static async postAttempt(word) {
        const currentURLString = window.location.href;
        const currentURL = new URL(currentURLString);
        const chatId = currentURL.searchParams.get('chat_id')
        const userId = currentURL.searchParams.get('user_id')

        const result = await axios.post(
            this.prefixURL,
            {currentWord: word},
            {
                params: {
                    chatId,
                    userId
                }
            }
        )
        return result.data
    }
}
