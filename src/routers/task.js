const express = require('express');
const Task = require('../models/task');
const router = new express.Router();
const auth = require('../middleware/auth');

router.post('/tasks',auth , async(req,res)=>{
    const task = new Task({
        ...req.body,
        owner:req.user._id
    });
    try{
        await task.save();
        res.status(201).send(task); 
    }catch(e){
        res.status(401).send(e);
    }
})

// GET /tasks?completed=true   - for filtering
// GET /tasks?limit=10&skip=20 - for pagination
// GET /tasks?sortBy=createdAt:desc - for sorting
router.get('/tasks', auth, async(req,res)=>{
    const match = {};
    const sort = {};
    // req.query.completed is a string whose value is either 'false', 'true' or undefined(if competed value is not provided) 
    if(req.query.completed){
        match.completed = req.query.completed === 'true'
    }
    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc'?-1:1;
    }
    try{
        //const tasks = await Task.find({owner:req.user._id})
        await req.user.populate({
            path:'myTasks',
            match:match,
            options:{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort:sort
            }
        }).execPopulate();
        res.status(200).send(req.user.myTasks);
    }catch(e){
        res.status(400).send(e);
    }
})

router.get('/tasks/:id', auth, async(req,res)=>{
    // route for reading task with given id.
    const _id = req.params.id;
    // user can only read the task, which he has created
    try{
        //const task = await Task.findById(_id);
        const task = await Task.findOne({_id:_id,owner:req.user._id})
        if(!task){
            return res.status(404).send();
        }
        res.send(task);
    }catch(e){
        res.status(404).send();
    }
})

router.patch('/tasks/:id', auth, async(req,res)=>{
    const updates = Object.keys(req.body);
    const allowedUpdates = ["description","completed"];
    const isValidOperation = updates.every((update)=> allowedUpdates.includes(update));

    if(!isValidOperation){
        return res.status(400).send('Invalid updates!')
    }

    try{
        const task = await Task.findOne({_id:req.params.id,owner:req.user._id});
        if(!task){
            return res.status(404).send();
        }
        updates.forEach((update)=>{
            task[update] = req.body[update];
        })
        await task.save();
        res.send(task);
    }catch(e){
        res.status(400).send(e);
    }
})

router.delete('/tasks/:id', auth, async(req,res)=>{
    try{
        const task = await Task.findOneAndDelete({_id:req.params.id,owner:req.user._id});
        if(!task){
            return res.status(400).send();
        }
        res.send(task);
    }catch(e){
        res.status(500).send();
    }
})

module.exports = router;