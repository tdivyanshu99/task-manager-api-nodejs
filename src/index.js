const express = require('express');
const path=require('path');

const app = express();
const port = process.env.PORT;
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

app.listen(port,()=>{
    console.log('Server is up on running on port '+port);
})



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

const multer = require('multer');
const upload = multer({
    dest:'images',
    limits:{
        fileSize:1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(doc|docx)$/)){
            return cb(new Error('Please upload a Word document'))
        }
        cb(undefined,true)
    }
})

// const uploadImgs = multer({
//     dest:'uploadedImages',
//     limits:{
//         fileSize:1000000
//     },
//     fileFilter(req, file, cb){
//         if(!file.originalname.match(/\.(png|jpg|jpeg)$/)){
//             return cb(new Error('Please upload a png or jpg or jpeg image'))
//         }
//         cb(undefined,true)
//     }
// })

app.post('/upload',upload.single('upload'),(req,res)=>{
    res.send();
},(error,req,res,next)=>{
    res.status(400).send({error:error.message})
})


// app.post('/upload-multiple-docs', upload.array('uploadedDocs', 10), function(req, res) {
//     var file = req.files;
//     res.status(200).end();
//   });

// app.post('/upload-multiple-images', uploadImgs.array('uploadedImages', 2), function(req, res) {
// var file = req.files;
// res.status(200).json({msg: "Files uploaded"});
// });