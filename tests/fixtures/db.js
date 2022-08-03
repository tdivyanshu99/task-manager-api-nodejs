const jwt= require('jsonwebtoken');
const mongoose = require('mongoose');
const Task = require('../../src/models/task');
const User = require('../../src/models/user');


const userOneId = new mongoose.Types.ObjectId();
const userTwoId = new mongoose.Types.ObjectId();

const userOne = {
    _id: userOneId,
    name: "Mike",
    email: "mike@example.com",
    password: "12345678",
    tokens:[{
        token: jwt.sign({_id:userOneId},process.env.JWT_SECRET)
    }]
}

const userTwo = {
    _id: userTwoId,
    name: "Jess",
    email: "jess@example.com",
    password: "1234567",
    tokens:[{
        token: jwt.sign({_id:userTwoId},process.env.JWT_SECRET)
    }]
}

const task1 = {
    _id: new mongoose.Types.ObjectId(),
    description: "My First task",
    completed: false,
    owner: userOneId
}

const task2 = {
    _id: new mongoose.Types.ObjectId(),
    description: "My First task",
    completed: false,
    owner: userOneId
}
const task3 = {
    _id: new mongoose.Types.ObjectId(),
    description: "My First task",
    completed: false,
    owner: userTwoId
}

const setupDatabase = async ()=>{
    await User.deleteMany();
    await Task.deleteMany();
    await new User(userOne).save();
    await new User(userTwo).save();
    await new Task(task1).save();
    await new Task(task2).save();
    await new Task(task3).save();
}

module.exports = {
    userOneId,
    userOne,
    userTwoId,
    userTwo,
    task1,
    task2,
    task3,
    setupDatabase
}