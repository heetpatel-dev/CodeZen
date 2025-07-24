import { getJudge0LanguageId, pollBatchResult, submitBatch } from "../libs/judge0.lib.js";
import { db } from "../libs/db.js";

export const createProblem = async (req, res) => {

    const { title, description, difficulty, tags, examples, constraints, testcases, codeSnippets, referenceSolutions } = req.body;

    if (!req.user || req.user.role !== "ADMIN") {
        return res.status(403).json({
            message: "Access Denied - You are not Admin!"
        })
    }

    try {

        console.log("Ref. Solution: ", referenceSolutions)

        for (const [language, solutionCode] of Object.entries(referenceSolutions)) {

            console.log("language: ", language)
            console.log("solution code: ", solutionCode)


            // Step-1: Get language ID and check if it is supported
            const languageId = getJudge0LanguageId(language);
            console.log("Language ID", languageId)

            if (!languageId) {
                return res.status(400).json({
                    message: `Language ${language} Not Supported!`
                })
            }

            // Step-2: Prepare submission of all testcases
            const submission = testcases.map(({ input, output }) => ({
                source_code: solutionCode,
                language_id: languageId,
                stdin: input,
                expected_output: output,
            }))

            console.log("Submissions: ", submission)

            const submissionResult = await submitBatch(submission);

            console.log("Submissions Result: ", submissionResult)

            const tokens = submissionResult.map((res) => res.token);

            console.log("Tokens Array: ", tokens)

            const results = await pollBatchResult(tokens);

            for (let i = 0; i < results.length; i++) {

                const result = results[i];

                if (result.status.id !== 3) {
                    return res.status(400).json({
                        error: `Testcase ${i + 1} failed for language ${language}`
                    })
                }
            }
        }

        console.log("All testcases passed for all languages! Now we will create the problem in DB...")

        const newProblem = await db.problem.create({
            data: {
                title, description, difficulty, tags, examples, constraints, testcases, codeSnippets, referenceSolutions, userId: req.user.id
            }
        })


        res.status(200).json(newProblem)

    } catch (error) {
        console.log(error)
        return res.status(400).json({
            error: `Something wrong in createProblem Controller!`
        })
    }

}


export const getProblem = async (req, res) => {

    const { id } = req.params;

    try {
        const problem = await db.problem.findUnique({
            where: {
                id,
            }
        })

        if (!problem) {
            return res.status(400).json({
                message: "Problem not Found - Error!"
            })
        }

        res.status(200).json({
            success: true,
            message: "Problem Fetched Based on ID!",
            problem
        })

    } catch (error) {
        console.log(error);
        res.status(400).json({
            success: false,
            message: "Something went wrong in getProblem controller!",
        })
    }

}


export const getAllProblems = async (req, res) => {

    try {
        const problems = await db.problem.findMany();

        if (!problems) {
            return res.status(400).json({
                message: "Problems not Fetched - Error!"
            })
        }

        res.status(200).json({
            success: true,
            message: "All Problems Fetched!",
            problems
        })

    } catch (error) {
        console.log(error);
        res.status(400).json({
            success: false,
            message: "Something went wrong in getAllProblems controller!",
        })
    }
}


export const getSolvedProblemsByUser = async (req, res) => {
    try {
        const problems = await db.problem.findMany({
            where: {
                solvedBy: {
                    some: {
                        userId: req.user.id
                    }
                }
            },
            include: {
                solvedBy: {
                    where: {
                        userId: req.user.id
                    }
                }
            }
        })

        res.status(200).json({
            success: true,
            message: "Problems fetched successfully",
            problems
        })
    } catch (error) {
        console.error("Error fetching problems :", error);
        res.status(500).json({ error: "Failed to fetch problems" })
    }
}


export const updateProblem = async (req, res) => {

    const { id } = req.params;

    if (!id) {
        return res.status(400).json({
            message: "ID is either null/undefined or doesn't exist!"
        })
    }

    const { title, description, difficulty, tags, examples, constraints, testcases, codeSnippets, referenceSolutions } = req.body;

    if (!req.user || req.user.role !== "ADMIN") {
        return res.status(403).json({
            message: "Access Denied - You are not Admin!"
        })
    }

    try {

        console.log("Ref. Solution: ", referenceSolutions)

        for (const [language, solutionCode] of Object.entries(referenceSolutions)) {

            console.log("language: ", language)
            console.log("solution code: ", solutionCode)


            // Step-1: Get language ID and check if it is supported
            const languageId = getJudge0LanguageId(language);
            console.log("Language ID", languageId)

            if (!languageId) {
                return res.status(400).json({
                    message: `Language ${language} Not Supported!`
                })
            }

            // Step-2: Prepare submission of all testcases
            const submission = testcases.map(({ input, output }) => ({
                source_code: solutionCode,
                language_id: languageId,
                stdin: input,
                expected_output: output,
            }))

            console.log("Submissions: ", submission)

            const submissionResult = await submitBatch(submission);

            console.log("Submissions Result: ", submissionResult)

            const tokens = submissionResult.map((res) => res.token);

            console.log("Tokens Array: ", tokens)

            const results = await pollBatchResult(tokens);

            for (let i = 0; i < results.length; i++) {

                const result = results[i];

                if (result.status.id !== 3) {
                    return res.status(400).json({
                        error: `Testcase ${i + 1} failed for language ${language}`
                    })
                }
            }
        }

        console.log("All testcases passed for all languages! Now we will create the problem in DB...")

        const newProblem = await db.problem.update({
            where: {
                id
            },
            data: {
                title, description, difficulty, tags, examples, constraints, testcases, codeSnippets, referenceSolutions, userId: req.user.id
            }
        })


        res.status(200).json(newProblem)

    } catch (error) {
        console.log(error)
        return res.status(400).json({
            error: `Something wrong in updateProblem Controller!`
        })
    }


}


export const deleteProblem = async (req, res) => {

    const { id } = req.params;

    try {

        const problem = await db.problem.findUnique({
            where: {
                id,
            }
        })

        if (!problem) {
            return res.status(400).json({
                success: false,
                message: "Problem Doesn't Exist in DB!"
            })
        }

        await db.problem.delete({
            where: {
                id
            }
        })

        res.status(200).json({
            success: true,
            message: "Problem Delted Sucessfully!",
        })

    } catch (error) {
        console.log(error);
        res.status(200).json({
            success: false,
            message: "Something went wrong in deleteProblem controller!",
        })
    }
}