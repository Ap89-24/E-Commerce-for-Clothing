import bcrypt from 'bcryptjs';
import { Schema, model, Document } from 'mongoose';
export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  contact: string;
  role: 'USER' | 'SELLER';
  comparePassword(candidatePassword: string): Promise<boolean>;
};




const userSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    contact: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ['USER', 'SELLER'],
      default: 'USER',
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre<IUser>("save" , async function() {
    if(!this.isModified("password")) return;

    const hash = await bcrypt.hash(this.password , 10);
    this.password = hash;
});


userSchema.methods.comparePassword = async function(password: string) {
    return await bcrypt.compare(password , this.password);
};


export const UserModel = model<IUser>("User" , userSchema);