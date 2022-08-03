const express = require('express');
const path=require('path');
const app = express();
const userRouter = require('./routers/user.js');
const taskRouter = require('./routers/task.js');
require('./db/mongoose.js');

// app.use((req,res,next)=>{
//     if(req.method==='GET'){
//         res.send('GET requests are disabled.')
//     }
//     else{
//         console.log(req.method,req.path);
//         next();
//     }
    
// })

// app.use((req,res,next)=>{
//     res.status(503).send('Site is currently down. Check back soon.')
//     //if(req.method==='GET' || req.method==='POST' || req.method==='Delete')
// })
app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

const Task = require('./models/task');
const User = require('./models/user.js');

// const main = async()=>{
//     // taken a task and find the user profile
    
//     // const task= await Task.findById('62e666b6a23fd63dffbaf8fc');
//     // await task.populate('owner').execPopulate();
//     // console.log(task.owner);

//     const user = await User.findById('62e66486d720453ab452c2e7');
//     await user.populate('myTasks').execPopulate(); // myTasks is a virtual field, not stored in db
//     console.log(user.myTasks);
// }
// main()

module.exports = app;