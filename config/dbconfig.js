const mongoose=require("mongoose");

const connectToMongoose= async () =>{
    await mongoose.connect(process.env.MONGO_URL)
    .then(()=> console.log("Connected to Database"))
    .catch((error)=> console.log("Error connecting to Database:",error));
}

module.exports=connectToMongoose;