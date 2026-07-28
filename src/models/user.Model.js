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
    coverImage: {      // 2. Fixed: Changed duplicate 'avatar' field to 'coverImage'
        type: String,  // Cloudinary URL
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId, // 3. Fixed: Changed Type to Types (with an 's')
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
}, { timestamps: true }); // 4. Fixed: Changed timeStamps to lowercase timestamps

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
userSchema.methods.generateAccessToken = function() { // 5. Fixed: Removed dot from user.Schema
    return jwt.sign( // 6. Added missing 'return'
        {
            _id: this._id, 
            email: this.email,
            username: this.userName,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY // 7. Fixed: Spelling of EXPIRARY to EXPIRY
        }
    );
};

// Generate Refresh Token
userSchema.methods.generateRefreshToken = function() { // 5. Fixed: Removed dot from user.Schema
    return jwt.sign( // 6. Added missing 'return'
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET, // 8. Normalized env variable name
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
};

export const User = mongoose.model("User", userSchema);
