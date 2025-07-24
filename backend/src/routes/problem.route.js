import express from "express";
import { createProblem, deleteProblem, getAllProblems, getProblem, getSolvedProblemsByUser, updateProblem } from "../controller/problem.controller.js";
import { authMiddleware, checkAdmin } from "../middlewares/auth.middleware.js";

const problemRoutes = express.Router();

problemRoutes.post("/create-problem", authMiddleware, checkAdmin, createProblem);

problemRoutes.get("/get-problem/:id", authMiddleware, getProblem);

problemRoutes.get("/get-all-problems", authMiddleware, getAllProblems);

problemRoutes.get("/get-solved-problems", authMiddleware, getSolvedProblemsByUser);

problemRoutes.put("/update-problem/:id", authMiddleware, checkAdmin, updateProblem);

problemRoutes.delete("/delete-problem/:id", authMiddleware, checkAdmin, deleteProblem);

export default problemRoutes;