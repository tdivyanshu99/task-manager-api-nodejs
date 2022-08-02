const mongoose=require('mongoose');

mongoose.connect(process.env.MONGODB_URL,{useNewUrlParser: true,useCreateIndex:true,useFindAndModify:false});

// mongodb compass db - 'mongodb://localhost:27017/task-manager-api'