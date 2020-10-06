
const Jwt = require('jsonwebtoken')
const config = require('config')

const auth = (req, res, next) => {
    const token = req.header('x-auth-token')
    if (!token) { return res.status(401).json({ msg: 'Token Missing' }) }

    try {
        const decode = Jwt.verify(token, config.get('jwtSecretKey'))
        req.user = decode.user
        next()
    } catch (error) {
        res.status(401).json({ msg: 'Invalid Token' })
    }
}


module.exports = auth