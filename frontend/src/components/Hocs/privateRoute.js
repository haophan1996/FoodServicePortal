import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Navigate } from 'react-router-dom';

class PrivateRoute extends Component {
    render() {
        const { isAuthenticated, children } = this.props;
        if (!isAuthenticated) {
            return <Navigate to='/login' />
        } else return children

    }
}

const mapStateToProps = state => ({
    isAuthenticated: state.auth.isAuthenticated
});

export default connect(mapStateToProps)(PrivateRoute);
