import bcrypt from "bcryptjs";
import { Document, model, Schema } from "mongoose";
export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  contact?: string;
  role: "USER" | "SELLER";
  googleId?: string;
  profile: string;
  isProfileCompleted: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

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
      required: function (): boolean {
        return !this.googleId;
      },
    },

    contact: {
      type: String,
      required: false,
    },

    role: {
      type: String,
      enum: ["USER", "SELLER"],
      default: "USER",
    },
    googleId: {
      type: String,
      default: null,
    },
    profile: {
      type: String,
      default: null,
    },
    isProfileCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre<IUser>("save", async function () {
  if (!this.isModified("password")) return;

  const hash = await bcrypt.hash(this.password, 10);
  this.password = hash;
});

userSchema.methods.comparePassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

export const UserModel = model<IUser>("User", userSchema);
