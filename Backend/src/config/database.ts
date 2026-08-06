import mongoose from "mongoose";
import { config } from "../types/config.js";


const connectToDatabase = async () => {
   try {
    await mongoose.connect(config.MONGO_URI);
    console.log("Connected to MongoDB");
   } catch (error) {
    console.error("Error connecting to MongoDB" , error);
   }
}



export default connectToDatabase;

