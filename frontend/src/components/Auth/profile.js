import axios from "axios";
import {
    LOAD_USER_PROFILE_SUCCESS,
    LOAD_USER_PROFILE_FAIL
} from './type'

export const load_user = () => async dispatch => {
    const config = {
        withCredentials: true,
        headers: {
            'Accept': 'application/json',
            'Content-Type': ' application/json'
        }
    };

    try {
        const res = await axios.get('/profile/user', config); 
        if (process.env.REACT_APP_DEV === true){
            console.log(res)
        }
         
        if (res.data.error) {
            dispatch({
                type: LOAD_USER_PROFILE_FAIL
            })
        } else { 
            dispatch({
                type: LOAD_USER_PROFILE_SUCCESS,
                payload: res.data
            })
        }
    } catch (err) {
        dispatch({
            type: LOAD_USER_PROFILE_FAIL
        })
    }

}