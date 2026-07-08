import mongoose, { Schema, Model } from "mongoose";
import { IUser } from "../types/user.type";
import { Role } from "../constants/role.enum";
import bcrypt from "bcrypt";


const userSchema = new Schema<IUser>(
    {
        username: { type: String, required: true, trim: true, unique: true, lowercase: true },
        password: { type: String, required: true },
        role: { type: String, enum: Object.values(Role), default: Role.USER },
        active: { type: Boolean, default: false }
    },
    {
        timestamps: true
    }
);

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});


export const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);