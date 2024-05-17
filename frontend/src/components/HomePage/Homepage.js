import React, { Component } from 'react'
// import { Button, InputAdornment, TextField } from "@mui/material/"
import Grid from '@mui/material/Grid';
// import DoneIcon from '@mui/icons-material/Done';
// import Visibility from '@mui/icons-material/Visibility';
// import VisibilityOff from '@mui/icons-material/VisibilityOff';
// import IconButton from '@mui/material/IconButton';

export class Homepage extends Component {
    constructor(props) {
        super()
        this.state = {
            isLoading: false,
            baseURL: window.location.origin
        }
    }

    componentDidMount() {
        this.setState({
            isLoading: false
        })
    }

    render() {
        const {
            isLoading,
            baseURL,
        } = this.state

        const logo = (<div className=''>
            <img src={baseURL + '/static/photos/logo_lg.png'} alt='logo' />
        </div>)

        const welcome_msg = (<Grid item container direction="column" xs={11} sm={8} md={5} alignItems='center' justifyContent='center'>
            <h1>Welcome to</h1>
        </Grid>)


        return (<>
            <h1>  {isLoading}</h1>

            <Grid container spacing={3} alignItems='center' justifyContent='center'>
                {welcome_msg}
                {logo}
            </Grid>
        </>)
    }

}

export default Homepage;