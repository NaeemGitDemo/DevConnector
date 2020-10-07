const express = require('express')
const router = express.Router()
const Post = require('../models/Posts')
const User = require('../models/User')
const Profile = require('../models/Profile')
const auth = require('../middleware/auth')
const { check, validationResult } = require('express-validator')
const { findOne } = require('../models/Posts')


// @route   POST /api/posts
// @desc    Create & update Post
// @access  Private
router.post('/posts', [auth, [
    check('text', 'Text Is Required').not().isEmpty(),

]], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) { return res.status(400).json({ erros: errors.array() }) }
    try {
        const user = await User.findById(req.user.id).select('-password')

        const post = new Post({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        })

        await post.save()

        res.json(post)

    } catch (error) {
        console.log(error)
        res.status(500).send('Server Error')
    }
})

// @route   GET /api/posts
// @desc    Get all posts 
// @access  Private
router.get('/posts', [auth], async (req, res) => {

    try {
        const posts = await Post.find().sort({ date: -1 })
        if (!posts) { return res.status(404).json({ msg: 'Post Not Found' }) }

        res.status(200).send(posts)
    } catch (error) {
        console.log(error)
        res.status(500).send('Server Error')
    }
})

// @route   GET /api/posts/:post_id
// @desc    Get  posts by ID
// @access  Private
router.get('/posts/:post_id', [auth], async (req, res) => {
    try {
        const post = await Post.findById(req.params.post_id)
        if (!post) { return res.status(404).json({ msg: 'Post Not Found' }) }

        res.status(200).send(post)

    } catch (error) {
        console.log(error)
        if (error.kind === 'ObjectId') { return res.status(404).json({ msg: 'Post Not Found' }) }
        res.status(500).send('Server Error')
    }
})

// @route   DELETE /api/posts/:post_id
// @desc    Delete  posts by ID
// @access  Private
router.delete('/posts/:post_id', [auth], async (req, res) => {
    try {
        const post = await Post.findById(req.params.post_id)
        if (!post) { return res.status(404).json({ msg: 'Post Not Found' }) }

        //Check User Can delete own post
        if (post.user.toString() !== req.user.id) { return res.status(401).json({ msg: 'Not Authorized To Delete' }) }

        await post.remove()
        res.status(200).json({ msg: 'Post Deleted' })
    } catch (error) {
        console.log(error)
        if (error.kind === 'ObjectId') { return res.status(404).json({ msg: 'Post Not Found' }) }
        res.status(500).send('Server Error')
    } ÎÎ
})

// @route   PUT /api/posts/like/:like_id
// @desc    Like a post
// @access  Private
router.put('/posts/like/:id', [auth], async (req, res) => {
    try {

        const post = await Post.findById(req.params.id)
        if (!post) { return res.status(404).json({ msg: 'Post Not Found' }) }

        //Check if post Already like
        if (post.likes.filter(like => {
            return like.user.toString() === req.user.id
        }).length > 0) {
            return res.status(400).json({ msg: 'Post Already Liked' })
        }

        post.likes.unshift({ user: req.user.id })

        await post.save()
        res.send(post.likes)

    } catch (error) {
        console.log(error)
        if (error.kind === 'ObjectId') { return res.status(404).json({ msg: 'Like Not Found' }) }
        res.status(500).send('Server Error')
    }
})
///

// @route   PUT /api/posts/unlike/:id
// @desc    unlike a post
// @access  Private
router.put('/posts/unlike/:id', [auth], async (req, res) => {
    try {

        const post = await Post.findById(req.params.id)
        if (!post) { return res.status(404).json({ msg: 'Post Not Found' }) }

        //Check if post Already like
        if (post.likes.filter(like => {
            return like.user.toString() === req.user.id
        }).length = 0) {
            return res.status(400).json({ msg: 'Post Has Not Liked Yet' })
        }

        //Get Remove Index
        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id)

        post.likes.splice(removeIndex, 1)

        await post.save()
        res.send(post.likes)

    } catch (error) {
        console.log(error)
        if (error.kind === 'ObjectId') { return res.status(404).json({ msg: 'Like Not Found' }) }
        res.status(500).send('Server Error')
    }
})

// @route   POST /api/posts/comment/:id
// @desc    Comment on post
// @access  Private
router.post('/posts/comment/:id', [auth, [
    check('text', 'Text Is Required').not().isEmpty(),

]], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) { return res.status(400).json({ erros: errors.array() }) }
    try {

        const user = await User.findById(req.user.id).select('-password')

        const post = await Post.findById(req.params.id)

        const comment = {
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        }
        post.comments.unshift(comment)

        await post.save()

        res.json(post.comments)

    } catch (error) {
        console.log(error)
        res.status(500).send('Server Error')
    }
})

// @route   DELETE /api/posts/comment/:id/:comment_id
// @desc    Delete a comment 
// @access  Private
router.delete('/posts/comment/:id/:comment_id', [auth], async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)

        const comment = post.comment.find(comment => comment.id === req.params.comment_id)
        if (!comment) { return res.status(404).json({ msg: 'Comment Not Found' }) }

        if (comment.user.toString() !== req.user.id) { return res.status(401).json({ msg: 'Not Authorized To Delete Comment' }) }

        //Get Remove Index
        const removeIndex = post.comments.map(comment => comment.user.toString()).indexOf(req.user.id)

        post.comments.splice(removeIndex, 1)

        await post.save()
        res.json(post.comment)

    } catch (error) {
        console.log(error)
        res.status(500).send('Server Error')
    }
})

module.exports = router