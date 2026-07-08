import { config, MONGO_URI } from '../config';
import mongoose, { mongo } from "mongoose";
import { ErrorCode, MyError } from '../types/error.type';



export const connectDB = async () => {

    try {
        await mongoose.connect(MONGO_URI);
        console.log("[DB] Connected Successfuly!")
    } catch (error) {
        throw new MyError({ code: ErrorCode.INTERNAL_ERROR, message: "Can't Connect to db" });
    }


}