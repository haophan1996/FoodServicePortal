import React, { Component } from 'react'
import { Button, TextField, FormControl } from "@mui/material/"
import Grid from '@mui/material/Grid';
import LoginIcon from '@mui/icons-material/Login';
import CSRFToken from './CSRFToken';
import { login } from '../Auth/auth';
import { connect } from 'react-redux';
import { Navigate } from 'react-router-dom';

export class Login extends Component {
    constructor(props) {
        super()
        this.state = {
            isLoading: true,
            username: '',
            password: '',
            baseURL: window.location.origin
        }
    }

    async componentDidMount() {
        document.addEventListener('keydown', this.handleKeyDown);
        this.setState({
            isLoading: false
        })
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleKeyDown);
    }

    handleKeyDown = async (event) => {
        if (event.key === 'Enter') {
            this.onHandleLogin()
        }
    }

    onChangeUsername = (event) => {
        const value = event.target.value;
        this.setState({ username: value });
    }

    onChangePassword = (event) => {
        const value = event.target.value;
        this.setState({ password: value });
    }


    onHandleLogin = () => {
        const { username, password } = this.state;
        this.props.login(username, password);
    }


    render() {
        const {
            isLoading,
            baseURL,
            username,
            password
        } = this.state

        if (this.props.isAuthenticated === true) {
            return <Navigate to='/' />
        }

        const logo = (<div className=' float-left mr-4'>
            <img src={baseURL + '/static/photos/logo_lg.png'} alt='logo' />
        </div>)

        const form = (<Grid item container direction="column" xs={11} sm={8} md={5} alignItems='center' justifyContent='center'>
            <FormControl fullWidth>
                <form><CSRFToken />
                    <TextField style={{ marginBottom: 20, }} fullWidth value={username} autoComplete='username' onChange={this.onChangeUsername} id="field_username" label="Username" variant="outlined" />
                    <TextField style={{ marginBottom: 20 }} fullWidth value={password} type='password' autoComplete="current-password" onChange={this.onChangePassword} id="field_password" label="Password" variant="outlined" />
                    <Button variant="contained" onClick={this.onHandleLogin} size='large' startIcon={<LoginIcon />}>Login</Button>
                </form>
            </FormControl>
        </Grid>)

        return (<>
            <h1>Login {isLoading}</h1>
            <Grid container spacing={3} alignItems='center' justifyContent='center'>
                {logo}
                {form}
            </Grid>
        </>)
    }

}

const mapStateToProps = state => ({
    isAuthenticated: state.auth.isAuthenticated
});

export default connect(mapStateToProps, { login })(Login);