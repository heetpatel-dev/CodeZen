import { pollBatchResult, submitBatch } from "../libs/judge0.lib.js";
import { db } from "../libs/db.js";
import { getLanguageName } from "../libs/judge0.lib.js";

export const executeCode = async (req, res) => {

    const { source_code, language_id, stdin, expected_outputs, problemId } = req.body;
    const userId = req.user.id;

    try {

        //Validate Testcases
        if (
            !Array.isArray(stdin) ||
            stdin.length === 0 ||
            !Array.isArray(expected_outputs) ||
            expected_outputs.length !== stdin.length
        ) {
            return res.status(400).json({
                error: "Invalid or Missing Testcases!",
            });
        }

        // Step-2: Prepare testcases for Judge0 submission
        const submissions = stdin.map((input) => ({
            source_code,
            language_id,
            stdin: input,
            base64_encoded: false,
            wait: false,
        }))

        //Step-3: Send batch of submission to Judge0
        const submitResponse = await submitBatch(submissions);

        const tokens = submitResponse.map((res) => res.token);

        //Step-4: Poll for results
        const results = await pollBatchResult(tokens);

        console.log("Results: ------------------------------------------ ");
        console.log(results);


        let allPassed = true;
        // Analyze testcase results
        const detailedResults = results.map((result, i) => {

            const stdout = result.stdout?.trim();
            const expected_output = expected_outputs[i]?.trim();
            const passed = stdout === expected_output;

            if (!passed) {
                allPassed = false;
            }

            return {
                testCase: i + 1,
                passed,
                stdout,
                expected: expected_output,
                stderr: result.stderr?.trim() || "",
                compile_output: result.compile_output?.trim() || "",
                status: result.status.description,
                memory: result.memory ? `${result.memory / 1024} KB` : undefined,
                time: result.time ? `${result.time} seconds` : undefined,
            }

        })


        // Step-5: Save results to database (if needed)
        const submission = await db.submission.create({
            data: {
                userId,
                problemId,
                sourceCode: source_code,
                language: getLanguageName(language_id),
                stdin: stdin.join("\n"),
                stdout: JSON.stringify(detailedResults.map((r) => r.stdout)),
                stderr: detailedResults.some((r) => r.stderr)
                    ? JSON.stringify(detailedResults.map((r) => r.stderr))
                    : null,
                compileOutput: detailedResults.some((r) => r.compile_output)
                    ? JSON.stringify(detailedResults.map((r) => r.compile_output))
                    : null,
                status: allPassed ? "Accepted" : "Wrong Answer",
                memory: detailedResults.some((r) => r.memory)
                    ? JSON.stringify(detailedResults.map((r) => r.memory))
                    : null,
                time: detailedResults.some((r) => r.time)
                    ? JSON.stringify(detailedResults.map((r) => r.time))
                    : null,
            },
        });


        // Add to SolvedByUser Schema if all test cases passed
        if (allPassed) {
            await db.problemSolved.upsert({
                where: {
                    userId_problemId: {
                        userId,
                        problemId,
                    }
                },
                update: {},
                create: {
                    userId, problemId
                }
            })
        }

        const testCaseResults = detailedResults.map((result) => ({
            submissionId: submission.id,
            testCase: result.testCase,
            passed: result.passed,
            stdout: result.stdout,
            expected: result.expected,
            stderr: result.stderr,
            compileOutput: result.compile_output,
            status: result.status,
            memory: result.memory,
            time: result.time,
        }));

        await db.testCaseResult.createMany({
            data: testCaseResults,
        });

        const submissionWithTestCase = await db.submission.findUnique({
            where: {
                id: submission.id,
            },
            include: {
                testCases: true,
            },
        });



        res.status(200).json({
            success: true,
            message: "Code executed successfully!",
            submission: submissionWithTestCase,
        })

    } catch (error) {
        console.log(error);
        res.status(400).json({
            success: false,
            message: "Something went wrong in executeCode controller!",
        })
    }

}