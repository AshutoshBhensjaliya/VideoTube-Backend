import {asyncHandler} from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import {User} from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";

export const verifyJWT = asyncHandler( async (req , _ , next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
    
        if(!token){
            throw new ApiError(401 , "Unauthorized request.")
        }

        const decodedToken = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user){
            throw new ApiError(401 , "Invalid Access Token.")
        }
    
        req.user = user;
        next();
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            throw new ApiError(401, "Malformed JWT Token.");
          }
          if (error.name === "TokenExpiredError") {
            throw new ApiError(401, "JWT Token has expired.");
          }
        throw new ApiError(401 , error?.message || "Invalid Access Token.")
    }

})