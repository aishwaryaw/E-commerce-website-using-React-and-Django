import axios from 'axios';
import * as actionTypes from './actionTypes';

// actions
export const authStart = () => {
    return {
        type : actionTypes.AUTH_START
    }
}
export const authSuccess = (token) => {
    return {
        type : actionTypes.AUTH_SUCCESS,
        token : token,
       
    }
}

export const authFail = (error) => {
    return {
        error : error,
        type : actionTypes.AUTH_FAIL
    }
}


export const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("expirationDate");
    return {
        type : actionTypes.AUTH_LOGOUT
}
}


// action creators
export const checkAuthTimeout = (expirationTime) => {
    return dispatch => {
        setTimeout(()=>{
            dispatch(logout());
        }, expirationTime * 1000);
    }
}


export const authLogin = (username , password) =>{
    return dispatch =>{
        dispatch(authStart());
        axios.post("http://127.0.0.1:8000/rest-auth/login/", {
            username : username,
            password : password
        }).then(res =>{
            const token = res.data.key;
            const expirationDate = new Date(new Date().getTime() + 3600*1000)
            localStorage.setItem("token", token);
            localStorage.setItem("expirationDate", expirationDate);
            dispatch(authSuccess(token))
            dispatch(checkAuthTimeout(3600))
        }).catch(error =>{
            dispatch(authFail(error));
        })
    }
}

export const authSignup = (username, email, password1, password2) => {
    return dispatch => {
        dispatch(authStart());
        axios.post("http://127.0.0.1:8000/rest-auth/registration/", {
            username : username,
            email :email,
            password1 : password1,
            password2: password2
        }).then(res => {
            console.log(res.data.key);
            const token = res.data.key;
            const expirationDate = new Date(new Date().getTime() + 3600*1000);
            localStorage.setItem("token", token);
            localStorage.setItem("expirationDate", expirationDate);
            dispatch(authSuccess(token));
            dispatch(checkAuthTimeout(3600));
        }).catch(error =>{
            dispatch(authFail(error));
        })
    }
}


export const checkAuthState = () => {

    return dispatch => {
    const token = localStorage.getItem('token');
    if(token == undefined){
        dispatch(logout());
    }
    else{
        const expirationDate = new Date(localStorage.getItem("expirationDate"));
        if(expirationDate < new Date()){
            dispatch(logout());
        }
        else{
            dispatch(authSuccess(token));
            dispatch(
                checkAuthTimeout(
                    (expirationDate.getTime() - new Date().getTime()) / 1000
                )
            )
        }
    }
}
}
