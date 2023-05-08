import React from 'react';
import { useRef, useState, useEffect } from 'react';
import axios from '../api/axios';
import useAuth from '../hooks/useAuth';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const LOGIN_URL = "/auth/login";

const Login = () => {

    const { setAuth } = useAuth();

    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/dashboard';

    const userRef = useRef();
    const errRef = useRef();

    const [user, setUser] = useState('');
    const [pwd, setPwd] = useState('');
    const [errMsg, setErrMsg] = useState('');

    useEffect(() => { userRef.current.focus(); }, []);

    useEffect(() => { setErrMsg(''); }, [user, pwd])

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(LOGIN_URL,
                JSON.stringify({ UserName: user, Password: pwd }),//UserName,Password is what the backend expects
                {
                    headers: { 'Content-Type': "application/json" },
                    withCredentials: true
                }
            );
            console.log(response?.data);//we dont have to change response to json with axios but have to with fetch
            console.log(JSON.stringify(response));
            const accessToken = response?.data?.accessToken;
            const roles = response?.data?.roles;
            // const accessToken = 'JWT';
            // const roles = ['Advisor'];

            setAuth({ user, pwd, roles, accessToken });
            setUser('');
            setPwd('');
            navigate(from, { replace: true });
        }
        catch (err) {
            if (!err?.response) {
                setErrMsg('No server response');
            } else if (err.response?.status === 400) {
                setErrMsg("Missing Username os Password");
            } else if (err.response?.status === 401) {
                setErrMsg("Unauthorized");
            } else {
                setErrMsg('Login Failed');
            }
            errRef.current.focus();
        }
    };

    return (
        <section className='signin_container'>
            <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live='assertive'>
                {errMsg}
            </p>
            <h1>Sign In</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor='username'>Username</label>
                <input
                    type='text'
                    id='username'
                    ref={userRef}
                    autoComplete='off'
                    placeholder='Enter your username'
                    value={user}
                    onChange={(e) => { setUser(e.target.value); }}
                    reqired
                ></input>
                <label htmlFor='password'>Password</label>
                <input
                    type='password'
                    id='password'
                    placeholder='Enter your password'
                    value={pwd}
                    onChange={(e) => { setPwd(e.target.value); }}
                    reqired
                ></input>
                <button>Sign In</button>
            </form>
            <p>Need an Account?<br />
                <span className='line'>
                    {/* router link */}
                    <a href="#">Sign Up</a>
                </span>
            </p>
        </section>
    )
}

export default Login