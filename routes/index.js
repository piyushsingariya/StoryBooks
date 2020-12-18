const express = require('express');
const {ensureAuth, ensureGuest} = require('../middleware/auth')
const router = express.Router();
const Story = require("../models/story")
// GET '/'
router.get('/', ensureGuest,  (req, res) => {
    res.render('login', {
        layout:'loginLayout'
    })
})

// GET '/dashboard'
router.get('/dashboard', ensureAuth, async (req, res) => {
    try {
        const stories = await Story.find({user: req.user.id}).lean()
        res.render('dashboard', {
            name: req.user.firstName,
            stories: stories
        })
    } catch (error) {
        console.log(error)
        res.render('error/500')
    }
    // console.log(req.user)
    
})



module.exports = router