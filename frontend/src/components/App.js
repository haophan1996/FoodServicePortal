import '../App.css';
import DashBoard from './Dashboard/Dashboard';
import More from './More/more'
import Order from './Order/order'
import Login from './Auth/login'
import Register from './Auth/register'
import HomePage from './HomePage/Homepage'
import React from 'react'
import { Route } from "react-router-dom";
import store from './store'
import { Provider } from 'react-redux';
import Layout from './Hocs/layout';
import PrivateRoute from './Hocs/privateRoute';
import CreateOrder from './Order/createorder';
import CreateItem from './Order/createItem';

export default function App() {
  return (
    <Provider store={store}>
      <div className='flex flex-col h-screen'>
        <Layout>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<PrivateRoute><DashBoard /></PrivateRoute>} />
          <Route path="/more" element={<PrivateRoute><More /></PrivateRoute>} />
          <Route path="/order"  >
            <Route index element={<PrivateRoute><Order /></PrivateRoute>} />
            <Route path=":date" element={<PrivateRoute><Order /></PrivateRoute>} />
            {/* <Route path="createorder/:id" element={<PrivateRoute><CreateOrder /></PrivateRoute>} /> */}
            <Route path="createorder/" element={<PrivateRoute><CreateOrder /></PrivateRoute>} />
            <Route path=":date/createorder/" element={<PrivateRoute><CreateOrder /></PrivateRoute>} />
            <Route path="createitem/" element={<PrivateRoute><CreateItem /></PrivateRoute>} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Layout>
        <br />
      </div>
    </Provider>
  );
}
