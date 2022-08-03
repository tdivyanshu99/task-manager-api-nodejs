const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');
const {userOneId,userOne,setupDatabase}=require('./fixtures/db')

beforeEach(setupDatabase)

test("Should sign up a new user", async () => {
    const response = await request(app).post('/users').send({
        "name": "Andrew Mead",
        "email": "andrew@example.com",
        "password": "12345678"
    }).expect(201)
    // Assert that the db has changed correctly
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    // Assert about the response
    expect(response.body).toMatchObject({
        user: {
            "name": "Andrew Mead",
            "email": "andrew@example.com",
        },
        token: user.tokens[0].token
    })

    expect(response.body.user.password).not.toBe("12345678");
})

test("Should login an existing user", async () => {
    const response = await request(app).post('/users/login').send({
        "email": userOne.email,
        "password": userOne.password
    }).expect(200)

    const user = await User.findById(userOneId);
    expect(response.body.token).toBe(user.tokens[user.tokens.length-1].token)
})

test("Should not login an non-existing user", async () => {
    await request(app).post('/users/login').send({
        "email": userOne.email,
        "password": "randompass"
    }).expect(400)
})

test('Should get profile for authenticated user', async ()=>{
    await request(app).get('/users/me')
    .set('Authorization','Bearer '+userOne.tokens[0].token)
    .send()
    .expect(200)
})

test('Should not get profile for unauthenticated user', async ()=>{
    await request(app).get('/users/me')
    .send()
    .expect(401)
})

test('Should delete account for authenticated user', async ()=>{
    await request(app).delete('/users/me')
    .set('Authorization','Bearer '+userOne.tokens[0].token)
    .expect(200)

    const user = await User.findById(userOneId);
    expect(user).toBeNull();
})

test('Should not delete account for unauthenticated user', async ()=>{
    await request(app).delete('/users/me')
    .expect(401)

    const user = await User.findById(userOneId);
    expect(user).not.toBeNull();
})

test('Should not delete account for unauthenticated token', async ()=>{
    await request(app).delete('/users/me')
    .set('Authorization','Bearer '+"somegarbagetoken")
    .expect(401) 

    const user = await User.findById(userOneId);
    expect(user).not.toBeNull();
})

test('Should upload avatar image', async ()=>{
    await request(app)
    .post('/users/me/avatar')
    .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
    .attach('avatar','tests/fixtures/profile-pic.jpg')
    .expect(200)

    const user = await User.findById(userOneId);
    // check the data type of avatar to be of Buffer type.
    expect(user.avatar).toEqual(expect.any(Buffer));
})

test('Should update valid user fields', async ()=>{
    await request(app)
    .patch('/users/me')
    .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
    .send({name:'Mannu'})
    .expect(200)

    const user = await User.findById(userOneId);
    expect(user.name).toBe('Mannu') 
})

test('Should not update invalid user fields', async ()=>{
    await request(app)
    .patch('/users/me')
    .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
    .send({height:172})
    .expect(400)
    
    const user = await User.findById(userOneId);
    expect(user).not.toHaveProperty('height')
})