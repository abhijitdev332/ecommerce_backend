import mongoose from "mongoose";

class Database {
  dbUrl = process.env.DATABASE_URL;
  connect = async () => {
    await mongoose.connect(this.dbUrl);
    console.log("db conected");
  };
}

export default Database;
