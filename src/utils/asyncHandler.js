// this is done so that we dont have to  
// write try catch blocks for every async function
// and we can just wrap our async functions with this asyncHandler function

import { request } from "express";

// 1st way to write the asyncHandler function:
// const asyncHandler = (fn) =>async(req, res, next) => {
//     try {
// await(req,res,next);

// }catch (error){
//     res.status(err.code || 500).json({
//         success:false,
//         message :error.message
//     })
// }
// }

//2nd way 1s to write the asyncHandler function:
const asyncHandler = (requestHandler) => {
  return  (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
    }
}

export {asyncHandler};