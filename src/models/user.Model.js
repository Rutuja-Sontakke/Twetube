import mongoose, { Schema } from 'mongoose'; // 1. Fixed: Removed lowercase schema from import
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema({
    userName: {
        type: String, 
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String, 
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullName: {
        type: String, 
        required: true,
        trim: true,
        index: true
    },
    avatar: {
        type: String,  // Cloudinary URL
        required: true,
    },
    coverImage: {     
        type: String,  // Cloudinary URL
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId, 
            ref: 'Video'
        }
    ],
    password: {
        type: String,
        required: [true, 'Password is required'],
    },
    refreshToken: {
        type: String
    }
}, { timestamps: true }); // 

// Hash password before saving
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10);
});

// Compare passwords
userSchema.methods.isPasswordCorrect = async function (password) {
   return await bcrypt.compare(password, this.password);
};

// Generate Access Token
userSchema.methods.generateAccessToken = function() { //
    return jwt.sign( // 
        {
            _id: this._id, 
            email: this.email,
            username: this.userName,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY // 
        }
    );
};

// Generate Refresh Token
userSchema.methods.generateRefreshToken = function() { // 
    return jwt.sign( // 
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET, 
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
};

export const User = mongoose.model("User", userSchema);
