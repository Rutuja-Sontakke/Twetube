import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.Model.js";
import { uploadOnCloudinary }from "../utils/claudinary.js"
import {apiResponse} from "../utils/apiResponse.js"
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = async(userId)=> {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}
    } 
    catch (err) {
    console.error("Generate Token Error:", err);
    throw err;
}
}

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

}) 

const loginUser = asyncHandler(async (req, res) => {
        //setup
        //req.body
        //check user with username\email  already signin or not
        //find the user findById 
        //password check bcrypt hashed password
        //access and refresh token generate
        //send cookie
        
        const {email, userName, password} = req.body

        if(!(userName || email) ) {
            throw new apiError(400, "username or password is required");

        }

        const user = await User.findOne({
            $or: [{userName}, {email}]
        })

        if(!user) {
            throw new apiError(404, "user does not exists");
        }

        const isPasswordValidate = await user.isPasswordCorrect(password) 

        if (!isPasswordValidate) {
            throw new apiError(404, "invalid user credentials");
        }

        const {accessToken, refreshToken} = 
        await generateAccessAndRefreshToken(user._id)

        const loggedIn = await User.findById(user._id).
        select("-password -refreshToken")

        const options = {
            httpOnly: true,
            secure: true
        }

        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new apiResponse(
                200, {
                    user: loggedIn, accessToken, refreshToken
                },
                "User Logged In Sccessfully!"
            )
        )
})

const logOutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )
    
        const options = {
            httpOnly: true,
            secure: true
        }

        return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new apiResponse(200, {}, "user logged out"))       

})

const refreshAccessToken = asyncHandler(async(req, res)=> {
    const incomingRefreshToken = req.cookies.refreshToken || req.refreshToken

    if(!incomingRefreshToken) {
        throw new apiError(401, "unauthorized request!");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.ACCESS_TOKEN_SECRET
        )
    
       const user = await User.findById(decodedToken._id)
    
        if(!user) {
            throw new apiError(401, "Invalid Refresh Token!");
        }
    
        if(incomingRefreshToken !== user?.refreshToken) {
            throw new apiError(401, "refresh token is expired to use");
        }
    
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken}= await generateAccessAndRefreshToken(user._id)
    
        return res 
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new apiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access Token refreshed"
            )
        )
    } catch (error) {
        throw new apiError(401, error?.message || 
            "INvalid refresh Token "
        )
    }
})

const changeCurrentUserPassword = asyncHandler(async(req, res) => {
    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user?.id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect) {
        throw new apiError(400, "Invalid Password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json( new apiResponse(200, {}, "Password Changed Successfully!"))
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
    .status(200)
    .json(200, req.user, "Current User Fetched Successfully!")
})

const updateAccountDetails = asyncHandler(async(req, res) => {
    const{fullName, email}  = req.body

    if(!fullName || !email) {
        throw new apiError(400, "All fields are required")
    }

    User.findByIdAndUpdate(
    req.user?.id,
    {},
    {}

    )
})

const updateUserAvatar = asyncHandler(async(req, res) => {
    const avatarLocalPath = req.file?.path;

    if(!avatarLocalPath) {
        throw new apiError(400, "Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar || !avatar.url) {
        throw new apiError(400, "Avatar file failed to upload to Cloudinary");
    
    }

    await User.findByIdAndUpdate(
        req.user?.id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")

    return res 
    .status(200)
    .json(new apiResponse(200, user, "Avatar Updated Successfullyy!"))
})

const updateUserCoverImage = asyncHandler(async(req, res) => {
    const coverImageLocalPath = req.file?.path;

    if(!coverImageLocalPath) {
        throw new apiError(400, "Cover Image file is required");
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage || !coverImage.url) {
        throw new apiError(400, "Cover Image file failed to upload to Cloudinary");
    
    }

    const user = await User.findByIdAndUpdate(
        req.user?.id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password")
    
    return res 
    .status(200)
    .json(new apiResponse(200, user, "Cover Image Updated Successfullyy!"))
})


export {
    registerUser,
    loginUser,
    logOutUser,
    refreshAccessToken,
    changeCurrentUserPassword,
    getCurrentUser,
    updateUserAvatar,
    updateUserCoverImage
}
