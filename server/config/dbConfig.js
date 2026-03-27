import mongoose from "mongoose";
const dbConnect = async () => {
  try {
    mongoose.set("strictQuery", false);
    const connected = await mongoose.connect(process.env.MONGO_URI, {
      dbName: "Real-State-MERN",
    });
    console.log(
      `Real state-MERN  DB connected successfully ............ ${(await connected).connection.host}`,
    );
  } catch (error) {
    console.log("DB Connection failed", error.message);
    process.exit(1);
  }
};

export default dbConnect;
