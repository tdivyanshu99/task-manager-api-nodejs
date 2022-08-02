const mongoose=require('mongoose');
const validator=require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');
const sharp = require('sharp');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
        validate:function(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid.')
            }
        }
    },
    age:{
        type:Number,
        default:0,
        validate:function(value){
            if(value<0){
                throw new Error('Age must be a positive number.')
            }
        }
    },
    password:{
        type:String,
        required:true,
        trim:true,
        minlength:7,
        validate:function(value){
            if(value.toLowerCase().includes("password")){
                throw new Error('password must not contain the word password.')
            }
        }
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }],
    avatar:{
        type:Buffer
    }
},{
    timestamps:true
});

userSchema.virtual('myTasks',{
    ref:'Task',
    localField:'_id',
    foreignField:'owner'
})

userSchema.methods.toJSON = function(){
    const user = this;
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;
    return userObject;
}

userSchema.methods.generateAuthToken = async function(){
    const user = this;
    const token = jwt.sign({_id:user._id.toString()},process.env.JWT_SECRET,{expiresIn: "30 days"});
    
    user.tokens = user.tokens.concat({token:token});

    await user.save();
    
    return token;
}

userSchema.statics.findByCredentials = async (email,password)=>{
    const user = await User.findOne({email:email});
    if(!user){
        throw new Error('Unable to login.')
    }
    const isMatch = await bcrypt.compare(password,user.password);
    if(!isMatch){
        throw new Error('Unable to login.')
    }
    return user;
}
// middleware -- hash the plain text password before saving,if modified.
userSchema.pre('save',async function(next){
    const user=this;
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password,8);
    }
    console.log('just before saving...')
    next();
})

// Delete user tasks when user is deleted.
userSchema.pre('remove',async function(next){
    const user = this;
    await Task.deleteMany({owner:user._id});
    next();
})

const User = mongoose.model('User',userSchema)

module.exports = User;