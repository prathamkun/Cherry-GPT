import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
    try {
        if (
            !req.headers.authorization ||
            !req.headers.authorization.startsWith("Bearer ")
        ) {
            return res.status(401).json({
                success: false,
                message: "No token provided"
            });
        }

        const token = req.headers.authorization.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.log("AUTH ERROR:", error.message);
        res.status(401).json({
            success: false,
            message: "Token failed"
        });
    }
};
