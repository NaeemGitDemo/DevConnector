const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator/check')
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs')
const Jwt = require('jsonwebtoken')
const config = require('config')
const User = require('../models/User')

// @route   Post /api/users
// @desc    Register user
// @access  Public
router.post('/users', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a valid password').isLength({ min: 6 })

], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) { return res.status(400).json({ errors: errors.array() }) }

    const { name, email, password } = req.body
    try {
        let user = await User.findOne({ email })
        if (user) { return res.status(400).json({ errors: [{ msg: 'User Already Exists' }] }) }

        const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
        })

        user = new User({
            name,
            email,
            avatar,
            password
        })
        const salt = await bcrypt.genSaltSync(10)
        user.password = await bcrypt.hash(password, salt)

        await user.save()

        const payload = {
            user: { id: user._id }
        }
        const token = Jwt.sign(payload, config.get('jwtSecretKey'))
        res.send({token})

    } catch (error) {
        console.log(error)
        res.status(500).send('Server Error')
    }

})











module.exports = router