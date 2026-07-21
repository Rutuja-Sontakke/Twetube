import dotenv from 'dotenv'
import connect_DB from './db/index.js'


dotenv.config({
    path: './.env'
})



connect_DB ()

























// import express from 'express'

// const app = express()

// ;( async () => {
//     try {
//         const connectionInsatant = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
//         app.on('error', (err) => {
//             console.error("ERROR", err);
//             throw err
//         })

//         app.listen(process.env.PORT, () => {
//             console.log('Server is running on port', process.env.PORT);
//         })
//     } 
//     catch (err) {
//         console.error("ERROR", err);
//         throw err;
//     }

// }) //IIFE