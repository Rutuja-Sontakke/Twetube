const asyncHandler = (requestHandler) => {
     (req, res, next) => {
            Promise.resolve(requestHandler(req, res, next))
            .catch((err) => next(err))
    }
}  //promise return   utility function



export {asyncHandler}






// const asyncHandler = (fun) => async (req, res, next) => {
//     try {
//             await fun(req, res, next)
//     }
//     catch(err) {
//         console.status(err.code || 500).json({
//                 success: false,
//                 message: err.message
//         })

//     }

// }   //try catch 