import {
    LOAD_USER_PROFILE_FAIL,
    LOAD_USER_PROFILE_SUCCESS,
} from '../Auth/type';

const initialState = {
    username: '',
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    note: '',
};

// eslint-disable-next-line import/no-anonymous-default-export
export default function (state = initialState, action) {
    const { type, payload } = action;
    switch (type) {
        case LOAD_USER_PROFILE_SUCCESS:
            return {
                ...state,
                username: payload.username,
                first_name: payload.profile.first_name,
                last_name: payload.profile.last_name,
                phone: payload.profile.phone,
                email: payload.profile.email,
                note: payload.profile.note
            }
        case LOAD_USER_PROFILE_FAIL:
            return {
                ...state,
                username: '',
                first_name: '',
                last_name: '',
                phone: '',
                email: '',
                note: ''
            }
        default:
            return state;
    }
}