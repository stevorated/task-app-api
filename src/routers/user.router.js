const express = require('express')
const multer  = require('multer')
const sharp = require('sharp')
const auth = require('../middleware/auth')
const { sendWelcomeEmail, sendGoodbyeEmail } = require('../emails/account')

const User = require('../models/user')

const router = new express.Router()

const avatar = multer({ 
    limits: {
        fileSize: 2000000
    },
    fileFilter(req,file,cb) {
        if(!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
            return cb(new Error('avatar pic must be of type png/jpg/jpeg & under 2MB.'))
        }

        cb(undefined, true)
    }
})


router.post('/users', async (req, res) => {
    try {
        const user = new User(req.body)
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    } catch (err) {
        res.status(400).send(err.message)
    }
})

router.post('/users/login', async (req,res)=>{
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)   
        const token = await user.generateAuthToken()
        res.send({user ,token})
    } catch (err) {
        res.status(400).send()
    }
})

router.post('/users/logout',auth, async (req,res)=>{
    try {
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    } catch (err) {
        res.status(500).send(err)
    }
})

router.post('/users/logoutAll',auth, async (req,res)=>{
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (err) {
        res.status(500).send(err)
    }
})

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

router.post('/users/me/avatar',auth, avatar.single('avatar'), async (req,res) =>{
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (err,req,res,next)=>{
    res.status(400).send({error: err.message})
})

router.delete('/users/me/avatar',auth, async (req,res) =>{
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.patch('/users/me',auth, async (req,res)=>{
    const updates = Object.keys(req.body)
    const allowedFields = ['name','email','password']
    const isValid = updates.every((update)=> allowedFields.includes(update))

    if(!isValid){
        return res.status(400).send({error: 'invalid action, unable to update'})
    }
    try {  
        updates.forEach((update)=>req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)

    } catch (err) {
        res.status(400).send({error:'invalid id.'})
    }
})

router.delete('/users/me',auth, async (req,res)=>{
    try {
        await req.user.remove()
        sendGoodbyeEmail(req.user.email, req.user.name)        
        return res.send({message: `user ${req.user.name} was deleted.`})
    } catch (err) {
        return res.status(500).send({error:'invalid Id.'})
    }
})

router.get('/users/:id/avatar', async (req, res)=>{
    try {
        const user = await User.findById(req.params.id)
        if ( !user || !user.avatar ) {
            throw new Error()
        }
        res.set('Content-Type','img/png')
        res.send(user.avatar)
    } catch (err) {
        res.status(400).send()
    }
})


module.exports = router