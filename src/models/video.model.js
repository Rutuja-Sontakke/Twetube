import mongoose, {Schema} from 'mongoose'
import  mongoosePggregatePaginate from "mongoose-aggregate-paginate-v2"
const videoSchema = new Schema(
{
        videoFile: {
            type: String,   //claudanary URL
            required: true,
        },
        thabnail: {
            type: String,   //claudanary URL
            required: true,
        },
        title: {
            type: String,   
            required: true,
        },
        description: {
            type: String,   
            required: true,
        },
        duration: {
            type: Number,   
            required: true,
        },
        views: {
            type: Number,
            default: 0
        },
        isPublish: {
            type: Boolean,
            default: true
        },
        Owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }


    }, {timestamps: true}
)

videoSchema.plugin(mongoosePggregatePaginate)    //mongoose pipeline

export const Video = mongoose.model("Video", videoSchema)