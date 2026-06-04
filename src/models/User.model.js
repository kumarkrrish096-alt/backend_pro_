import mongoose , {Schema} from "mongoose";
import bcrypt from "bcrypt";//bcrypt is a library for hashing passwords. It provides a secure way to store passwords by hashing them before saving to the database.
import jwt from "jsonwebtoken";//jsonwebtoken is a library for generating and verifying JSON Web Tokens (JWTs). It is commonly used for authentication and authorization in web applications.

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,//Create a database index on this field to make searches faster.
    },
    email: { type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullname:{
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar: {
        type: String,//cloudinary url
        required: true,
    },
    coverImage: {
        type: String,
    },
    watchHistory: [{
        type: Schema.Types.ObjectId,
        ref: "Video"
    }],
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    refreshToken: {
        type: String,
    },

},{
    timestamps: true,
});


UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }

    this.password = await bcrypt.hash(this.password, 10);
    next();
});//pre is a Mongoose middleware function that runs before saving a document in this case and we have other also  . In this case, it checks if the password field has been modified. If it has, it hashes the password using bcrypt before saving it to the database.


userSchema.methods.isPasswordCorrect = async function (Password) {
    return await bcrypt.compare(Password, this.password);
};//isPasswordCorrect is a method that compares the provided password with the hashed password stored in the database. It uses bcrypt's compare function to check if the passwords match.


userSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        _id: this._id,
        username: this.username,
        email: this.email,
        fullname: this.fullname,
    },
    process.env.ACCESS_TOKEN_SECRET,{
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    })
};//generateAccessToken is a method that generates a JSON Web Token (JWT) for the user. This token can be used for authentication and authorization in the application. The implementation of this method would typically involve using the jwt library to create a token that includes the user's information and an expiration time.
userSchema.methods.generateRefreshToken = function () {
 return jwt.sign({
        _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,{
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    })

};//generateRefreshToken is a method that generates a refresh token for the user. A refresh token is used to obtain a new access token when the current access token expires. The implementation of this method would also involve using the jwt library to create a token that includes the user's information and a longer expiration time compared to the access token.
export const User = mongoose.model("User", userSchema);