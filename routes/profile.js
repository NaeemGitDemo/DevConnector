const express = require('express')
const router = express.Router()
const Profile = require('../models/Profile')
const User = require('../models/User')
const auth = require('../middleware/auth')
const { check, validationResult } = require('express-validator')

// @route   GET /api/profile/me
// @desc    Get current user Profile
// @access  Private
router.get('/profile/me', [auth], async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar'])
        if (!profile) { return res.status(404).json({ msg: 'Profile Not Found' }) }

        res.status(200).send({ profile })
    } catch (error) {
        console.log(error)
        res.status(500).send('Server Error')
    }

})

// @route   POST /api/profile
// @desc    Create/Update user profile
// @access  Private
router.post('/profile', [auth, [
    check('status', 'Status Is Required').not().isEmpty(),
    check('skills', 'Skill Is Required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) { return res.status(400).json({ errors: errors.array() }) }

    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin
    } = req.body
    //Build proifle Object before Saving
    const profileObject = {}
    profileObject.user = req.user.id
    if (company) profileObject.company = company
    if (website) profileObject.website = website
    if (location) profileObject.location = location
    if (bio) profileObject.bio = bio
    if (status) profileObject.status = status
    if (githubusername) profileObject.githubusername = githubusername

    // Conver Skills to Array
    if (skills) {
        profileObject.skills = skills.split(',').map(skill => skill.trim())
        console.log(profileObject.skills)
    }
    //Build Social Object
    profileObject.social = {}
    if (youtube) profileObject.social.youtube = youtube
    if (facebook) profileObject.social.facebook = facebook
    if (twitter) profileObject.social.twitter = twitter
    if (instagram) profileObject.social.instagram = instagram
    if (linkedin) profileObject.social.linkedin = linkedin

    try {
        let profile = await Profile.findOne({ user: req.user.id })
        if (profile) {
            profile = await Profile.findOneAndUpdate(
                { user: req.user.id },
                { $set: profileObject },
                { new: true })
            return res.json(profile)
        }
        profile = new Profile(profileObject)
        await profile.save()
        res.json(profile)

    } catch (error) {
        console.log(error)
        res.status(500).json('Server Error')
    }

})

// @route   GET /api/profile
// @desc    Get all profiles
// @access  Public
router.get('/profile', async (req, res) => {
    try {
        const profile = await Profile.find().populate('user', ['name', 'avatar'])
        if (!profile) { return res.status(400).json({ msg: 'No Profiles Found' }) }

        res.status(200).send(profile)
    } catch (error) {
        console.log(error)
        res.status(500).send('Server Error')
    }
})

// @route   GET /api/profile/user/:user_id
// @desc    Get  profile by user ID
// @access  Public
router.get('/profile/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar'])
        if (!profile) { return res.status(400).json({ msg: 'No Profile Found' }) }

        res.status(200).send(profile)

    } catch (error) {
        console.log(error)
        if (error.kind == 'ObjectId') { return res.status(400).json({ msg: 'No Profile Found' }) }
        res.status(500).json('Server Error')
    }
})

// @route   DELETE /api/profile
// @desc    Delete  profile, user & post
// @access  Private
router.delete('/profile', [auth], async (req, res) => {
    try {
        await Profile.findOneAndRemove({ user: req.user.id })

        await User.findOneAndRemove({ _id: req.user.id })

        res.status(200).json({ msg: 'User Deleted' })
    } catch (error) {
        console.log(error)
        res.status(500).send('Server Error')
    }
})



module.exports = router