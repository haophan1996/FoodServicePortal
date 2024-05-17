import { configureStore} from '@reduxjs/toolkit'
import {thunk} from 'redux-thunk';
import rootReducer from './reducers' //index.js that is createreducer 

const middleware = [thunk]

const initialState = {};


const store = configureStore({
    reducer: rootReducer,
    initialState,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(middleware),
})

export default store; 