
import React, { Component, useState } from 'react';
import axios from 'axios'
import { Link } from 'react-router-dom'
const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })

    const { email, password } = formData

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }
    const handleSubmit = async (e) => {
        e.preventDefault()

        console.log('SUCCESS')

    }
    return (
        <React.Fragment>
            <h1 className="large text-primary">Sign In</h1>
            <p className="lead"><i className="fas fa-user"></i> Sign Into Your Account</p>
            <form className="form" action="create-profile.html"
                onSubmit={handleSubmit}
            >

                <div className="form-group">
                    <input
                        type="email"
                        value={email}
                        onChange={e => handleChange(e)}
                        placeholder="Email Address"
                        name="email"
                    />

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

                <input type="submit" className="btn btn-primary" value="Login" />
            </form>
            <p className="my-1">
                Don't have an account? <Link to="/register">Sign Up</Link>
            </p>
        </React.Fragment>
    )

}

export default Login;