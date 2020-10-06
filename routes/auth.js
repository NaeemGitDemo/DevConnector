const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const { check, validationResult } = require('express-validator/check')
const bcrypt = require('bcryptjs')
const Jwt = require('jsonwebtoken')
const config=require('config')
const User = require('../models/User')



// @route   GET /api/auth
// @desc    Test Route
// @access  Public
router.get('/auth', [auth], async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password')
        if (!user) { return res.status(404).json({ msg: 'User Not Found' }) }
        res.status(200).json(user)
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: 'Server Error' })
    }
    res.send('Auth Route')
})

// @route   Post /api/auth
// @desc    Authenticate user & get token
// @access  Public
router.post('/auth', [
    check('email', 'Please Include  Valid Email').isEmail(),
    check('password', 'Password Is Required').exists()

], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) { return res.status(400).json({ errors: errors.array() }) }

    const { email, password } = req.body
    try {
        let user = await User.findOne({ email })
        if (!user) { return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] }) }

        const validPassword = await bcrypt.compare(password, user.password)
        if (!validPassword) { return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] }) }
       
        const payload = { user: { id: user._id } }
        const token = Jwt.sign(payload, config.get('jwtSecretKey'))
       
        res.send({ token })

    } catch (error) {
        console.log(error)
        res.status(500).send('Server Error')
    }

})



module.exports = router