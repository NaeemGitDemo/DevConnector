const express = require('express')
const router = express.Router()
const Profile = require('../models/Profile')
const User = require('../models/User')
const auth = require('../middleware/auth')
const { check, validationResult } = require('express-validator')
const request = require('request')
const config = require('config')

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

// @route   PUT /api/profile/experience
// @desc    Add profile experience
// @access  Private
router.put('/profile/experience', [auth, [
    check('title', 'Title Is Required').not().isEmpty(),
    check('company', 'Company Is Required').not().isEmpty(),
    check('from', 'From Date Is Required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) { return res.status(400).json({ errors: errors.array() }) }

    const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    } = req.body

    const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }

    try {
        const profile = await Profile.findOne({ user: req.user.id })

        profile.experience.unshift(newExp)
        res.send(profile)

    } catch (error) {
        console.log(error)
        res.status(500).send('Server Error')
    }

})

// @route   DELETE /api/profile/experience/:exp_id
// @desc    Delete profile experience
// @access  Private
router.delete('/profile/experience/:exp_id', [auth], async (req, res) => {
    try {
        let profile = await Profile.findOne({ user: req.user.id })
        if (!profile) { return res.status(400).json({ msg: 'Profile Not Found' }) }

        const removeIndex = profile.experience.map(exp => exp.id).indexOf(req.params.exp_id)
        profile.experience.splice(removeIndex, 1)

        await profile.save()
        res.status(200).send(profile)

    } catch (error) {
        console.log(error)
        res.status(500).send('Server Error')
    }
})

////Education

// @route   PUT /api/profile/education
// @desc    Add profile education
// @access  Private
router.put('/profile/education', [auth, [
    check('school', 'School Is Required').not().isEmpty(),
    check('degree', 'Degree Is Required').not().isEmpty(),
    check('fieldofstudy', 'Field of study Is Required').not().isEmpty(),
    check('from', 'From Date Is Required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) { return res.status(400).json({ errors: errors.array() }) }

    const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    } = req.body

    const newEdu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    }

    try {
        const profile = await Profile.findOne({ user: req.user.id })

        profile.education.unshift(newEdu)
        res.send(profile)

    } catch (error) {
        console.log(error)
        res.status(500).send('Server Error')
    }

})

// @route   DELETE /api/profile/education/:edu_id
// @desc    Delete profile education
// @access  Private
router.delete('/profile/education/:edu_id', [auth], async (req, res) => {
    try {
        let profile = await Profile.findOne({ user: req.user.id })
        if (!profile) { return res.status(400).json({ msg: 'Profile Not Found' }) }

        const removeIndex = profile.education.map(edu => edu.id).indexOf(req.params.edu_id)
        profile.education.splice(removeIndex, 1)

        await profile.save()
        res.status(200).send(profile)

    } catch (error) {
        console.log(error)
        res.status(500).send('Server Error')
    }
})

// @route   GET /api/profile/github/:username
// @desc    Get user repos from Github
// @access  Private
router.get('/profile/github/:username', async (req, res) => {
    try {
        const options = {
            uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecret')}`,
            method: 'GET',
            headers: { 'user-agent': 'node.js' }
        }
        request(options, (error, response, body) => {
            if (error)
                console.log(error)
            if (response.statusCode !== 200) {
                return res.status(404).json({ msg: "Not Github Profile" })
            }
            res.json(JSON.parse(body))
        })
    } catch (error) {
        console.log(error)
        res.status(500).send('Server Error')
    }
})

module.exports = router