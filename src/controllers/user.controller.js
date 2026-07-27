import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.Model.js";
import { uploadOnCloudinary }from "../utils/claudinary.js"
import {apiResponse} from "../utils/apiResponse.js"




const registerUser = asyncHandler( async (req, res) => {
    //steps 
    //get user details from frontend  (req.body) (req.params)
    //validation - not empty
    //check if user already exists : username , email
    //check for images and avatar files exists or not
    //if yes Upload them to cloudinary, avatar
    //create user object - create entry in db
    //remove password and refresh token filed from response
    //check for user creation
    //return res
    //if not err

    const {fullName, email, userName, password } = req.body; // Fixed: Added password here
    console.log("email", email);
     
    if (
        [fullName, email, userName, password].some((field)=>
        !field || field?.trim() ==="") // Fixed: Added null check protection
    ) {
        throw new apiError(400, "all fields are required")
    }
     // if(fullName === "") {
    //     throw new apiError(400, "Full name is required")
    // }

    const existUser = await User.findOne({ // Fixed: Added missing await keyword
        $or: [{ userName },{ email }]          //$or parameter
    })

    if(existUser) {
        throw new apiError(409, "User with email or username already exists");

    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path; // Fixed: Added safe array indexing (?.[0])
    // const coverImageLocalPath = req.files?.coverImage?.[0]?.path; // Fixed: Added safe array indexing (?.[0])
    
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocalPath) {
        throw new apiError(400, "Avatar File is required ");

    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    
    let coverImage = null; // Fixed: Safe initialization block for cover image 
    if (coverImageLocalPath) {
        coverImage = await uploadOnCloudinary(coverImageLocalPath)
    }
    
    if (!avatar || !avatar.url) { 
        throw new apiError(400, "Avatar File failed to upload to Cloudinary");
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url, 
        coverImage: coverImage?.url || "",
        email,
        password,
        userName: userName.toLowerCase()
    })

    const createdUer = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUer) {
        throw new apiError(500, "something went wrong while registering user");
    }

    return res.status(201).json(
        new apiResponse(201, createdUer, "User registered successfully!") // Fixed: Normalized to matching standard 201 status code

    )

} ) 


export {
    registerUser,
}
