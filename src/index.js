// require("dotenv").config({ path: './env'});

import dotenv from "dotenv";

import mongoose from "mongoose";
import {DB_NAME} from "./constants.js";
import connectDB from "./db/index.js";

dotenv.config({ path: "./.env" });

import express from "express";
const app = express();


connectDB() // as async function that returns a Promise, we can use .then() and .catch() to handle the success and error cases of the connection.
.then(() => {
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server is running on port ${process.env.PORT || 8000}`);
    });
})

.catch((error) => {
    console.log("MONGODB CONNECTION ERROR:", error);
});












/* 1 st approach to connect to MongoDB and start the server:

// (async () => {})() is an Async IIFE (Immediately Invoked Function Expression).
// 'async' makes the function return a Promise and allows the use of 'await' inside it.
// The first parentheses () wrap the function so JavaScript treats it as an expression.
// The last parentheses () immediately execute/call the function after it is created.
// Commonly used to run async code at the top level without creating a separate named function.
( async () => {
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        app.on("error", (error) => {
            console.log("Error starting the server:", error);
            throw error;
        });

        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
    }catch(error){
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
})();

*/
  