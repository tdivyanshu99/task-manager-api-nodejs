const request = require('supertest');
const {userOneId,userOne,userTwo, setupDatabase, task1, task2, task3} =require('./fixtures/db')
const app = require('../src/app');
const Task = require('../src/models/task');

beforeEach(setupDatabase)

test("Should create a task for authenticated user", async () => {
    const response = await request(app)
    .post('/tasks')
    .set('Authorization','Bearer '+userOne.tokens[0].token)
    .send({description:'My first task'})
    .expect(201)

    const task = await Task.findById(response.body._id)
    expect(task).not.toBeNull();
    expect(task.description).toBe("My first task")
    expect(task).toHaveProperty('completed');
    expect(task.completed).toEqual(false);   
})

test("Should get all tasks for authenticated user", async () => {
    const response = await request(app)
    .get('/tasks')
    .set('Authorization','Bearer '+userOne.tokens[0].token)
    .expect(200)

    expect(response.body.length).toBe(2)

})

test("Should not delete task by not owner user", async () => {
    const response = await request(app)
    .delete('/tasks/'+task1._id)
    .set('Authorization','Bearer '+userTwo.tokens[0].token)
    .expect(400)

    const task = Task.findById(task1._id);
    expect(task).not.toBeNull();
})