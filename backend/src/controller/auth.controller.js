import bcrypt, { hash } from "bcryptjs";
import jwt from "jsonwebtoken";
import {db} from "../libs/db.js";
import { UserRole } from "../generated/prisma/index.js";

export const register = async ( req, res ) => {

    //get data from user
    const { name, email, password } = req.body;

    try {

        // check all fields are filled
        if( !name || !email || !password ){
            return res.status(400).json({
                message: "All Fields are required!",
                success: false,
            });
        }

        //check if user already exist
        const existingUser = await db.user.findUnique({
            where: {
                email,
            }
        })

        if( existingUser ){
            return res.status(400).json({
                message: "User Already Exist!",
                success: false,
            });
        }

        // hash password
        const hashedPassword = await bcrypt.hash( password, 10);

        //create user in db
        const user = await db.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: UserRole.USER
            }
        })
        
        //create a token
        const token = jwt.sign(
            {id: user.id},
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        )

        res.cookie("jwt", token, {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV !== "development",
            maxAge: 7*24*60*60*1000,
        })

        res.status(200).json({
            Message: "User created sucessfully!",
            success: true,
            user: {
                name: user.name,
                email: user.email,
                role: user.role,
                image: user.image,
            }
        })
        
    } catch (error) {
        return res.status(400).json({
            Message: "Error in Register Controller!",
            success: false,
        })
    }

}
export const login = async ( req, res ) => {

    //get data from user
    const { name, email, password } = req.body;

    try {

        // check all fields are filled
        if( !email || !password ){
            return res.status(400).json({
                message: "All Fields are required!",
                success: false,
            });
        } 

        // find unique 
        const user = await db.user.findUnique({
            where: {
                email,
            }
        })

        if( !user ){
            return res.status(400).json({
                message: "User Not Found!",
                success: false,
            });
        }

        const isMatch = await bcrypt.compare( password, user.password )

        if( !isMatch ){
            return res.status(400).json({
                message: "Password OR Email is Incorrect!",
                success: false,
            });
        }

        //create a token
        const token = jwt.sign(
            {id: user.id},
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        )

        res.cookie("jwt", token, {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV !== "development",
            maxAge: 7*24*60*60*1000,
        })

        res.status(200).json({
            Message: "User Logged-In sucessfully!",
            success: true,
            user: {
                name: user.name,
                email: user.email,
                role: user.role,
                image: user.image,
            }
        })
        
    } catch (error) {
        return res.status(400).json({
            Message: "Error in login Controller!",
            success: false,
        })
    }

}
export const logout = async ( req, res ) => {

    try {

        res.clearCookie("jwt", {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV !== "development",
        })

        res.status(200).json({
            Message: "User Logged-Out sucessfully!",
            success: true,
        })
        
    } catch (error) {
        return res.status(400).json({
            Message: "Error in logout Controller!",
            success: false,
        })
    }

}
export const checkAuth = async ( req, res ) => {

    try {

        res.status(200).json({
            Message: "User Authenticated sucessfully!",
            success: true,
            user: req.user,
        })
        
    } catch (error) {
        return res.status(400).json({
            Message: "Error in checkAuth Controller!",
            success: false,
        })
    }

}