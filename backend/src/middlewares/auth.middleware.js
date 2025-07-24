import jwt from "jsonwebtoken";
import { db } from "../libs/db.js";

export const authMiddleware = async ( req, res, next ) => {

    try {
        const token = req.cookies.jwt;

        if( !token ){
            return res.status(400).json({
                message: "Unauthorized - Token Not Found!",
                success: false,
            })
        }

        let decoded;

        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(401).json({
                message: "Unauthorized - Invalid Token!",
                success: false,
            })
        }

        const user = await db.user.findUnique({
            where: {
                id: decoded.id,
            },
            select: {
                id: true,
                image: true,
                name: true,
                email: true,
                role: true,
            }
        })

        if(!user){
            return res.status(404).json({
                message: "User Not Found!",
                success: false,
            })
        }

        req.user = user;

        next();

    } catch (error) {
        return res.status(400).json({
            Message: "Error in Auth Middleware!",
            success: false,
        })
    }

}

export const checkAdmin = async ( req, res, next ) => {

    const userId = req.user.id;

    try {
        
        const user = await db.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                role: true,
            }
        })

        if( !user || user.role !== "ADMIN" ){
            return res.status(403).json({
                message: "Access Denied - Admin Only!"
            })
        }

        next();

    } catch (error) {
        console.log(error);
        return res.status(403).json({
            message: "Something Wrong in checkAdmin Middleware!"
        })
    }

}