import axios from "axios"

export const getJudge0LanguageId = (language) => {

    const languageMap = {
        "JAVASCRIPT": 63,
        "PYTHON": 71,
        "JAVA": 62,
    }

    return languageMap[language.toUpperCase()];
}

export const getLanguageName = (languageId) => {
    const languageMap = {
        63: "JAVASCRIPT",
        74: "TYPESCRIPT",
        71: "PYTHON",
        62: "JAVA",
    }

    return languageMap[ languageId ] || "UNKNOWN";
}


export const submitBatch = async (submission) => {

    const options = {
        method: 'POST',
        url: `${process.env.SUBMISSION_POST_URL}`,
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${process.env.SULU_AUTH_TOKEN}`
        },
        data: {
            submissions: submission
        }
    };

    const { data } = await axios.request(options);

    console.log("Submission Result: ", data);

    return data; // Array of tokens => [ {token1}, {token2}, {token3}, ... ]
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const pollBatchResult = async (tokens) => {

    const options = {
        method: 'GET',
        url: `${process.env.SUBMISSION_GET_URL}`,
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${process.env.SULU_AUTH_TOKEN}`
        },
        params: {
            tokens: tokens.join(","),
            base64_encoded: false,
        }
    };

    while (true) {

        const { data } = await axios.request(options);

        const result = data.submissions;

        const isAllDone = result.every(
            (r) => r.status.id !== 1 && r.status.id !== 2
        )

        if (isAllDone) return result;

        await sleep(1000);

    }

}