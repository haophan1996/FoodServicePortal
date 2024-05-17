import React, { Component } from 'react';
import { NavLink, Navigate } from 'react-router-dom';
import { Button, InputAdornment, TextField, Grid } from "@mui/material/";
import {VisibilityOff, Visibility, Done as DoneIcon} from '@mui/icons-material/'; 
import { Button as IconButton } from '@mui/material'; 
import { register } from '../Auth/auth';
import { connect } from 'react-redux';  
import CSRFToken from './CSRFToken'; 

export class Register extends Component {
    constructor(props) {
        super()
        this.state = {
            isLoading: false,
            username: '',
            password: '',
            repassword: '',
            txt_show_password: '',
            isShowPassword: false,
            isAccountCreated: false,
            baseURL: window.location.origin
        }
    }

    componentDidMount() {
        this.setState({
            isLoading: false
        }) 
    }

    onTogglePasswordVisibility = () => {
        const { isShowPassword } = this.state;
        this.setState({ isShowPassword: !isShowPassword })
    }

    handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    onChangeUsername = (event) => {
        const value = event.target.value;
        this.setState({ username: value });
    }

    onChangePassword = (event) => {
        const value = event.target.value;
        this.setState({ password: value });
    }

    onChangeRepassword = (event) => {
        const value = event.target.value;
        this.setState({ repassword: value });
    } 

     

    onHandleSubmit_btn = () => {
        const {username, password, repassword} = this.state;  
        
        if (password !== repassword) {
            alert("Password not match, try AGAIN") 
        } 
        this.props.register(username, password, repassword).then((e) => {
            if (e.data.success){
                alert(e.data.success)
                this.setState({isAccountCreated: true})
            } else {
                alert(e.data.error)
            }
        })
       
    } 
     

    render() {
        const {
            isLoading,
            baseURL,
            username,
            password,
            repassword,
            isShowPassword,
            isAccountCreated
        } = this.state

        if (isAccountCreated){
            return <Navigate to='/login'/>
        }

        const logo = (<div className=' float-left mr-4 pl-11'>
            <img src={baseURL + '/static/photos/logo_lg.png'} alt='logo' />
        </div>)

        const form = (<Grid item container direction="column" xs={11} sm={8} md={5} alignItems='center' justifyContent='center'>
            {/* <FormControl fullWidth style={{ marginBottom: 20 }}>   */}
                <form> 
                    <CSRFToken />
                    <TextField
                        style={{ marginBottom: 20 }}
                        onChange={this.onChangeUsername}
                        value={username}
                        fullWidth
                        id="field_username"
                        label="Username"
                        variant="outlined"
                        autoComplete="username"
                    />
                    <TextField
                        style={{ marginBottom: 20 }}
                        onChange={this.onChangePassword}
                        value={password}
                        fullWidth
                        id="field_password"
                        label="Password"
                        variant="outlined"
                        type={isShowPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={this.onTogglePasswordVisibility}
                                        onMouseDown={this.handleMouseDownPassword}
                                        edge="end"
                                    >
                                        {isShowPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    /> <TextField
                        onChange={this.onChangeRepassword}
                        value={repassword}
                        fullWidth
                        id="field_repassword"
                        label="Re Password"
                        variant="outlined"
                        type={isShowPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={this.onTogglePasswordVisibility}
                                        onMouseDown={this.handleMouseDownPassword}
                                        edge="end"
                                    >
                                        {isShowPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />
                </form>
                <div className='flex justify-end mt-5 font-semibold text-1xl'>
                    <p className='mr-1'>Already have an account?</p><NavLink to='/login'> Login</NavLink>
                </div>
            {/* </FormControl> */}
             
            <Button variant="contained" size='large' startIcon={<DoneIcon />} onClick={this.onHandleSubmit_btn}>Submit</Button>
        </Grid>)

        return (<>
            <h1>Register {isLoading}</h1>

            <Grid container spacing={3} alignItems='center' justifyContent='center'>
                {logo}
                {form}
            </Grid>
        </>)
    }

} 

export default connect(null, {register})(Register);