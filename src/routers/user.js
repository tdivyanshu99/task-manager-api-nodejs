const express = require('express');
const User = require('../models/user')
const router = new express.Router();
const auth = require('../middleware/auth');
const multer = require('multer')
const sharp = require('sharp');
const cloudinary = require("cloudinary");

// cloundinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

const upload = multer({
    dest: 'images',
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
            return cb(new Error('Please upload a Image'))
        }
        cb(undefined, true)
    }
})

router.post('/users', async (req, res) => {
    const user = new User(req.body);

    // user.save().then(()=>{
    //     res.status(201).send(user);
    // }).catch((e)=>{
    //     res.status(400).send(e);
    // })

    try {
        await user.save();
        const token = await user.generateAuthToken();
        res.status(201).send({ user: user, token: token });
    } catch (e) {
        res.status(400).send(e);
    }

})

router.post('/users/login', async (req, res) => {
    try {
        //console.log(req.body.email,req.body.password);
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken()
        res.send({ user: user, token: token });

    } catch (e) {
        res.status(400).send();
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        })
        await req.user.save();

        res.send();
    } catch (e) {
        res.status(500).send();
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send();
    } catch (e) {
        res.status(500).send();
    }
})
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user);
})

router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["name", "email", "password", "age"];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send('Invalid updates!')
    }

    try {
        //const user = await User.findById(req.params.id);
        updates.forEach((update) => req.user[update] = req.body[update])

        //const user = await User.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});
        await req.user.save();

        res.status(200).send(req.user);
    } catch (e) {
        res.status(400).send(e);
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        // const user = await User.findByIdAndDelete(req.params.id);
        // if(!user){
        //     return res.status(404).send();
        // }

        await req.user.remove();
        res.send(req.user);
    } catch (e) {
        res.status(500).send();
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    //console.log(req.file.path);
    //const buffer = await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()
    //req.user.avatar = buffer;
    const prevAvatarUrl = req.user.avatarUrl
    await cloudinary.uploader.upload(req.file.path, async (result) => {
        //console.log(result);
        //console.log(result.secure_url)
        req.user.avatarUrl = result.secure_url;
    });
    if (prevAvatarUrl && prevAvatarUrl.length>0) {
        let prevAvatarName = prevAvatarUrl.substring(
            prevAvatarUrl.lastIndexOf("/") + 1
        );
        let publicId = prevAvatarName.substring(
            0,
            prevAvatarName.indexOf(".")
        );
        await cloudinary.v2.uploader.destroy(publicId, (error, result2) => {
                if (error) {
                    res.status(500).end()
                }
                console.log('image deleted')
            }
        );
    }

    await req.user.save();
    res.send();
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

// http://localhost:3500/users/62e6c9e86caff38cecfbb4c9/avatar
router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || !user.avatarUrl) {
            throw new Error();
        }
        // we are always sending .png images
        res.set('Content-type', 'image/png');
        res.send(user.avatarUrl)
    } catch (e) {
        console.log(e);
        res.status(400).send();
    }
})

module.exports = router;

// router.get('/users/:id',async(req,res)=>{
//     const _id = req.params.id;
//     try{
//         const user = await User.findById(_id);
//         if(!user){
//             return res.status(404).send();
//         }
//         res.status(200).send(user);
//     }catch(e){
//         res.status(400).send();
//     }
//     // User.findById(_id).then((user)=>{
//     //     if(!user){
//     //         return res.status(404).send();
//     //     }
//     //     res.send(user);
//     // }).catch((e)=>{
//     //     res.status(500).send();
//     // })
// })
