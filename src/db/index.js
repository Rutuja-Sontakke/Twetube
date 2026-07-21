import mongoose from 'mongoose'
import { DB_NAME } from '../constants.js'

const connect_DB = ( async () => {
        try {
           const connectionInsatant = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
            console.log(`\n Database connected successfully !! DB Host: ${connectionInsatant.connection.host}`);
        }
        catch (err) {
            console.error("ERROR", err);
            process.exit(1);
        }
}) 

export default connect_DB