import mongoose, { Schema } from "mongoose";

const carSchema = mongoose.Schema({

    car_id: {
        type: String,
        required: true,
        unique: true,
    },
    title: {
        type: String,
        required: true,
    },
    banner: {
        type: String,
        // required: true,
    },
    des: {
        type: String,
        maxlength: 200,
        // required: true
    },
    content: {
        type: [],
        // required: true
    },
    extraPhoto: {
        type: []
    },
    tags: {
        type: [String],
        // required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'users'
    }

}, 
{ 
    timestamps: {
        createdAt: 'publishedAt'
    } 

})

export default mongoose.model("cars", carSchema);