import React, { Component } from "react";
import axios from "axios";
import Snackbar from '@mui/material/Snackbar';  

export class CSRFToken extends Component {
    constructor(props) {
        super(props);
        this.state = {
            csrftoken: '',
            open: false
        }

        this.cancelTokenSource = axios.CancelToken.source();
    }

    async componentDidMount() { 
        await this.fetchData();  
    }

    componentWillUnmount() { 
        this.cancelTokenSource.cancel('Component unmounted')
    }

    handleClose = () => {
        this.setState({ open: false })
    };


    getCookie = (name) => {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            let cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                let cookie = cookies[i].trim(); 
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    getExtractCookie = async () => { 
        try { 
            const ck = await axios.get('/accounts/getcsrftokenfrontend',{
                cancelToken: this.cancelTokenSource.token,
                withCredentials: true,
            })
            if (ck.data.success != null){
                return ck.data.success
            }
             
        } catch (err) { 
            this.setState({ open: true })
        }  
        this.getCookie('csrftoken')
    }


    fetchData = async () => { 
        try {
            const response = await axios.get('/accounts/csrf_cookie', {
                cancelToken: this.cancelTokenSource.token, 
                withCredentials: true,
                credentials: 'include'
            }) 
             
            if (response.status === 200){
                const ck = await axios.get('/accounts/getcsrftokenfrontend',{
                    cancelToken: this.cancelTokenSource.token,
                    withCredentials: true,
                })
                if (ck.data.success != null){
                    this.setState({csrftoken: ck.data.success}) 
                }
            }
        } catch (err) { 
            this.setState({ open: true })
        }  
        this.getCookie('csrftoken')
    }

    render() {
        const { csrftoken, open } = this.state
        if (csrftoken != null)
            return (<div>
                <input type="hidden" name="csrfmiddlewaretoken" value={csrftoken} />
                <Snackbar
                    open={open}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    autoHideDuration={6000}
                    onClose={this.handleClose}
                    message={`Could not fetch CSRFToken ${axios.defaults.baseURL}`}
                />
            </div>)
        
    }
}

export default CSRFToken;