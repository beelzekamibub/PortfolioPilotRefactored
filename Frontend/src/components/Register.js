import React from 'react';
import { useRef, useState, useEffect } from 'react';
import { faCheck, faTimes, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from '../api/axios';


const USER_REGEX = /^[A-z][A-z0-9-_]{3,23}$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;
const REGISTER_URL = '/register';

const Register = () => {
    const userRef = useRef();
    const errRef = useRef();

    const [user, setUser] = useState('');
    const [validName, setValidName] = useState(false);
    const [userFocus, setUserFocus] = useState(false);

    const [pwd, setPwd] = useState('');
    const [validPwd, setValidPwd] = useState(false);
    const [pwdFocus, setPwdFocus] = useState(false);

    const [matchPwd, setMatchPwd] = useState('');
    const [validMatch, setValidMatch] = useState(false);
    const [matchFocus, setMatchFocus] = useState(false);

    const [errMsg, setErrMsg] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        userRef.current.focus();
    }, []);

    useEffect(() => {
        const res = USER_REGEX.test(user);
        console.log(res);
        console.log(user);
        setValidName(res);
    }, [user]);

    useEffect(() => {
        const res = PWD_REGEX.test(pwd);
        console.log(res);
        console.log(pwd);
        setValidPwd(res);
        const match = pwd === matchPwd;
        setValidMatch(match);
    }, [pwd, matchPwd]);

    useEffect(() => {
        setErrMsg('');
    }, [user, pwd, matchPwd]);//when ever user retypes the  username or passwords user has clearly read the error message and made amends

    const handleSubmit = async (e) => {
        e.preventDefault();
        const v1 = USER_REGEX.test(user);
        const v2 = PWD_REGEX.test(pwd);
        if (!v1 || !v2) {
            setErrMsg("invalid Input");
            return;
        }
        try {
            const response = await axios.post(REGISTER_URL,
                JSON.stringify({ UserName: user, Password: pwd }),//UserName,Password is what the backend expects
                {
                    headers: { 'Content-Type': "application/json" },
                    withCredentials: true
                }
            );
            console.log(response.data);//we dont have to change response to json with axios but have to with fetch
            console.log(JSON.stringify(response));
            setSuccess(true);
            setUser('');
            setPwd('');
            setValidPwd('');
            //clear the input fields
        }
        catch (err) {
            if (!err?.response) {
                setErrMsg('No server response');
            } else if (err.response?.status === 409) {
                setErrMsg("Username Taken");
            } else {
                setErrMsg('Registeration Failed');
            }
            errRef.current.focus();
        }
    }

    return (
        <>
            {success ? (
                <section className='form success'>
                    <h1>Successfully Registered!</h1>
                    <p>
                        <a className="login" href="/login" ref={userRef} >
                            Login.
                        </a>
                    </p>
                </section>
            ) : (
                <section className='form'>
                    <p ref={errRef}
                        className={errMsg ? "errmsg" : 'offscreen'}
                        aria-live='assertive'
                        style={{ color: "red", backgroundColor: "papayawhip", borderRadius: "5px" }}
                    >
                        {errMsg}
                    </p>
                    <h1>
                        Register
                    </h1>
                    <form onSubmit={handleSubmit}>
                        {/* Username */}
                        <label className="label" htmlFor="username">
                            Username:
                            <span className={validName ? "valid" : "hide"}>
                                <FontAwesomeIcon icon={faCheck} style={{ color: "#25b601", }} />
                            </span>
                            <span className={validName || user.length > 3 ? "hide" : "invalid"}>
                                <FontAwesomeIcon icon={faTimes} style={{ color: "red", }} />
                            </span>
                        </label>
                        <br />
                        <input
                            type="text"
                            id='username'
                            placeholder='Create username'
                            ref={userRef}
                            autoComplete='off'
                            onChange={(e) => setUser(e.target.value)}
                            required
                            aria-invalid={validName ? 'false' : 'true'}
                            aria-describedby='uidnote'
                            onFocus={() => setUserFocus(true)}
                            onBlur={() => setUserFocus(false)}
                            value={user}
                        />
                        <p style={{ color: 'red', fontSize: '0.8rem' }} id='uidnote' className={userFocus && user && !validName ? "instructions" : "hide"}>
                            <FontAwesomeIcon icon={faInfoCircle} /> <br />
                            4 to 24 characters. <br />
                            Must begin with a letter. <br />
                            Letters, numbers, underscore, hyphens allowed.
                        </p>
                        <br />
                        {/* Password */}
                        <label className="label" htmlFor="password">
                            Password:
                            <span className={validPwd ? "valid" : "hide"}>
                                <FontAwesomeIcon icon={faCheck} style={{ color: "#25b601", }} />
                            </span>
                            <span className={validPwd ? "hide" : "invalid"}>
                                <FontAwesomeIcon icon={faTimes} style={{ color: "red", }} />
                            </span>
                        </label>
                        <br />
                        <input
                            type="password"
                            placeholder='Create password'
                            id='password'
                            onChange={(e) => setPwd(e.target.value)}
                            required
                            aria-invalid={validPwd ? 'false' : 'true'}
                            aria-describedby='pwdnote'
                            onFocus={() => setPwdFocus(true)}
                            onBlur={() => setPwdFocus(false)}
                            value={pwd}
                        />
                        <p style={{ color: 'red', fontSize: '0.8rem' }} id='pwdnote' className={pwdFocus && pwd && !validPwd ? "instructions" : "hide"}>
                            <FontAwesomeIcon icon={faInfoCircle} /> <br />
                            8 to 24 characters. <br />
                            Must inclue a lowercase letter, an uppercase letter, a number and a special character. <br />
                            Allowed special characters: <span aria-label="exclamation mark">!</span> <span aria-label="at symbol">@</span> <span aria-label="hashtag">#</span> <span aria-label="dollar sign">$</span> <span aria-label="percent">%</span>
                        </p>
                        <br />
                        {/* COnfirm Password */}
                        <label className="label" htmlFor="confirm_password">
                            Confirm Password:
                            <span className={validMatch && matchPwd ? "valid" : "hide"}>
                                <FontAwesomeIcon icon={faCheck} style={{ color: "#25b601", }} />
                            </span>
                            <span className={validMatch && matchPwd ? "hide" : "invalid"}>
                                <FontAwesomeIcon icon={faTimes} style={{ color: "red", }} />
                            </span>
                        </label>
                        <br />
                        <input
                            type="password"
                            id='confirm_password'
                            onChange={(e) => setMatchPwd(e.target.value)}
                            required
                            placeholder='Confirm Password'
                            aria-invalid={validMatch ? 'false' : 'true'}
                            aria-describedby='confirmnote'
                            onFocus={() => setMatchFocus(true)}
                            onBlur={() => setMatchFocus(false)}
                            value={matchPwd}
                        />
                        <p style={{ color: 'red', fontSize: '0.8rem' }} id='confirmnote' className={matchFocus && matchPwd && !validMatch ? "instructions" : "hide"}>
                            <FontAwesomeIcon icon={faInfoCircle} /> <br />
                            Passwords dont match.
                        </p>
                        <br />
                        <div className="links">
                            <button
                                disabled={!validName || !validMatch || !validPwd ? true : false}
                            >
                                Sign Up
                            </button>
                            <p>
                                Already have an account?
                                {/* need to make it a react router link */}
                                <a className="login" href="/login">
                                    Login.
                                </a>
                            </p>
                        </div>
                    </form>
                </section>
            )}
        </>
    )
}

export default Register