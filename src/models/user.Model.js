import mongoose, {Schema, schema} from 'mongoose'
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"


const userSchema = new Schema( {
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
        type: String,  //Cluaodnary URL
        required: true,
    },
    avatar: {
        type: String,  //Cluaodnary URL
    },
    watchHistory: [
        {
        type: Schema.Type.ObjectId,
        ref: 'video'
        }
    ],
    password: {
        type: String,
        required: [true, 'password is required'],

    },

    refreshToken: {
        type: String
    }

}, { timeStamps: true} 
)

userSchema.pre("save", async function (next) {

    if(!this.isModified("password")) return next();     
    this.password = brcrypt.hash(this.password, 10)
    next()
}) 


userSchema.methods.isPasswordCorrect = async function (password) {
   return await bcrypt.compare(password, this.password)
}

user.Schema.methods.generateAccessToken = function() {
    jwt.sign({
        _id: this._id, 
        email: this.email,
        username: this.userName,
        fullName: this.fullName
        
    },
    process.env.ACCESS_TOKEN_SECRET,{
        expiresIn: process.env.ACCESS_TOKEN_EXPIRARY
    }
)
}

user.Schema.methods.generateRefreshToken = function() {
    jwt.sign(
    {
        _id: this._id
        
    },
    process.env.JWT_REFRESH_SECRET,
    {
        expiresIn: process.env.JWT_REFRESH_EXPIRY
    }
)
}

user.Schema.methods.generateRefreshToken = function () {
    
}


export const User = mongoose.model(("User"), userSchema)