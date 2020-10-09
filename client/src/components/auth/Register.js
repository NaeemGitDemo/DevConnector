
import React, { Component, useState } from 'react';
import axios from 'axios'
import { Link} from 'react-router-dom'
const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password2: ''
    })

    const { name, email, password, password2 } = formData

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }
    const handleSubmit = async (e) => {
        e.preventDefault()
        if (password !== password2) { return console.log('Password Doesnt Match') }
        console.log('SUCCESS')

    }
    return (
        <React.Fragment>
            <h1 className="large text-primary">Sign Up</h1>
            <p className="lead"><i className="fas fa-user"></i> Create Your Account</p>
            <form className="form" action="create-profile.html"
                onSubmit={handleSubmit}
            >
                <div className="form-group">
                    <input
                        type="text"
                        placeholder="Name"
                        name="name"
                        value={name}
                        onChange={e => handleChange(e)}
                        required
                    />
                </div>
                <div className="form-group">
                    <input
                        type="email"
                        value={email}
                        onChange={e => handleChange(e)}
                        placeholder="Email Address"
                        name="email"
                    />
                    <small className="form-text"
                    >This site uses Gravatar so if you want a profile image, use a
                        ravatar email</small
                    >
                </div>
                <div className="form-group">
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => handleChange(e)}
                        name="password"
                        minLength="6"
                    />
                </div>
                <div className="form-group">
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        name="password2"
                        value={password2}
                        onChange={e => handleChange(e)}
                        minLength="6"
                    />
                </div>
                <input type="submit" className="btn btn-primary" value="Register" />
            </form>
            <p className="my-1">
                Already have an account? <Link to="/login">Sign In</Link>
            </p>
        </React.Fragment>
    )

}

export default Register;