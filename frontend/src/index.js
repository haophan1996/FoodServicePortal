import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './components/App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import 'semantic-ui-css/semantic.min.css'
import axios from 'axios';

if (process.env.REACT_APP_DEV === 'true') {
  axios.defaults.baseURL = process.env.REACT_APP_API_URL
} else {
  axios.defaults.baseURL = process.env.REACT_APP_API_URL_PRODUCTION
}

axios.defaults.withXSRFToken = true
axios.defaults.withCredentials = true
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

reportWebVitals();
