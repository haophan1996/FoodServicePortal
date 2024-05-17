import axios from 'axios';
import { load_user } from "../Auth/profile"
import {
    REGISTER_SUCCESS, REGISTER_FAIL,
    LOGIN_SUCCESS, LOGIN_FAIL,
    LOGOUT_SUCCESS, LOGOUT_FAIL,
    AUTHENTICATED_SUCCESS, AUTHENTICATED_FAIL,
    // DELETE_USER_SUCCESS, DELETE_USER_FAIL
} from './type'

export const checkAuthenticated = () => async dispatch => {
    const config = {
        headers: {
            'Accept': 'application/json',
            'Content-Type': ' application/json'
        }
    };

    try {
        const res = await axios.get('/accounts/authenticated', config)
         
        // console.log(res)
         
        if (res.data.error || res.data.isAuthenticated === 'error') {
            dispatch({
                type: AUTHENTICATED_FAIL,
                payload: false
            })
        } else if (res.data.isAuthenticated === 'success') {
            dispatch({
                type: AUTHENTICATED_SUCCESS,
                payload: true
            })
        } else {
            dispatch({
                type: AUTHENTICATED_FAIL,
                payload: false
            })
        }
    } catch (err) {
        dispatch({
            type: AUTHENTICATED_FAIL,
            payload: false
        })
    }
}

export const logout = () => async dispatch => {
    const cancelTokenSource = axios.CancelToken.source();
    const csrft = await getExtractCookie(cancelTokenSource) 
    const config = {
        headers: {
            'Accept': 'application/json',
            'Content-Type': ' application/json',
            'X-CSRFToken': csrft
        }
    };

    const body = JSON.stringify({
        'withCredentials': true
    });

    try {
        const res = await axios.post('/accounts/logout', body, config);

        if (res.data.success) {
            dispatch({
                type: LOGOUT_SUCCESS,
            })
        } else {
            dispatch({
                type: LOGOUT_FAIL
            })
        }

    } catch (err) {
        dispatch({ type: LOGOUT_FAIL })
    }
}

export const login = (username, password) => async dispatch => {

    const config = {
        withCredentials: true,
        headers: {
            'Accept': 'application/json',
            'Content-Type': ' application/json',
            'X-CSRFToken': document.querySelector('input[name="csrfmiddlewaretoken"]').value,
        }
    };


    const body = JSON.stringify({ username, password });

    try {
        const res = await axios.post('/accounts/login', body, config);
        if (res.data.success) {
            dispatch({
                type: LOGIN_SUCCESS
            });

            dispatch(load_user())
        } else {
            dispatch({
                type: LOGIN_FAIL
            })
        }

    } catch (err) {
        dispatch({ type: LOGIN_FAIL })
    }
}

export const register = (username, password, re_password) => async (dispatch) => { 
    const config = {
        headers: {
            'Accept': 'application/json',
            'Content-Type': ' application/json',
            'X-CSRFToken': document.querySelector('input[name="csrfmiddlewaretoken"]').value,
        },
        withCredentials: true,
    };

    const body = JSON.stringify({ username, password, re_password });

    try { 
        const res = await axios.post('/accounts/register', body, config);

        if (res.data.error) {
            dispatch({
                type: REGISTER_FAIL
            })
            return res
        } else {
            dispatch({
                type: REGISTER_SUCCESS
            })
            return res
        }
    } catch (err) {
        dispatch({
            type: REGISTER_FAIL
        })
    }

}

export const getExtractCookie = async (cancelTokenSource) => { 
    try {
        const ck = await axios.get('/accounts/getcsrftokenfrontend', {
            cancelToken: cancelTokenSource.token,
            withCredentials: true,
        })
        if (ck.data.success != null) {
            return ck.data.success
        }

    } catch (err) {
        console.error('Error fetching CSRF token:', err);
    } 
}