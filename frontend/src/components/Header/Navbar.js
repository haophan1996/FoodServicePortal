import React, { Component } from 'react'
import Button from '@mui/material/Button';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CloseIcon from '@mui/icons-material/Close';
import { NavLink } from "react-router-dom";
import { connect } from 'react-redux';
import { logout } from '../Auth/auth';
import axios from 'axios';

export class Navbar extends Component {
    constructor(props) {
        super()
        this.state = {
            isOpen: false,
            activeLink: "",
            baseURL: window.location.origin
        }
        this.cancelTokenSource = axios.CancelToken.source();
    }

    componentDidMount() {
        this.setState({ activeLink: window.location.pathname }) 
    }

    onHandleLogout = async () => {
        try {
            await this.props.logout(); // Dispatch logout action 
            if (this.props.isAuthenticated === true) {
                console.log("fail to logout")
            }
        } catch (error) {
            console.error('Logout failed:', error); // Handle logout failure
        }
    }

    toggleMenu = () => {
        const { isOpen } = this.state;
        this.setState({ isOpen: !isOpen })
    }

    render() {
        const {
            isOpen,
            activeLink,
            baseURL
        } = this.state

        const Links = [
            { name: 'Home', link: '/', show: true }, //Default
            { name: 'DashBoard', link: '/dashboard' },
            { name: 'Order', link: '/order' },
            { name: 'More', link: '/more' },
        ]

        const LoginSignup_btn = (<>
            <NavLink to='/login' >
                <Button style={{ marginRight: 9 }} variant="contained"
                    onClick={() => { if (this.state.isOpen === true) { this.toggleMenu() } }} > Login
                </Button>
            </NavLink>

            <NavLink to='/register'>
                <Button style={{ marginRight: 9 }} variant="contained"
                    onClick={() => { if (this.state.isOpen === true) { this.toggleMenu() } }} > Register
                </Button>
            </NavLink></>)

        const Logout_btn = (<div className='flex items-center'>
            Hello, {this.props.name}
            <Button style={{ marginRight: 9, marginLeft: 9 }} variant="contained"
                onClick={() => { this.onHandleLogout() }} > Logout
            </Button>
        </div>)

        return (
            <nav className='block shadow-md w-full fixed top-0 left-0 z-10'>
                <div className='md:flex items-center justify-between bg-pink-300 py-4 md:px-10 px-7'>
                    {/* Logo */}
                    <div className='font-bold text-2xl cursor-pointer flex items-center gap-1'>
                        <a className='md:block' href="/"><img src={baseURL + '/static/photos/logo_lg_name.png'} alt='logo' width={100} height={150} /></a>
                        {/* <span>Order Portal</span> */}
                    </div>

                    <div onClick={() => this.toggleMenu()} className='absolute right-8 top-5 cursor-pointer md:hidden w-7 h-7'>
                        {isOpen ? <CloseIcon /> : <MoreHorizIcon />}
                    </div>

                    {/* Nav Link */}
                    <ul className={`md:flex md:items-center md:pb-0 pb-5 absolute md:static bg-pink-300 md:z-auto z-[-1] left-0 w-full md:w-auto md:pl-0 pl-9 transition-all md:duration-0 duration-200 ease-in ${isOpen ? 'top-12' : 'top-[-490px]'}`}>
                        {
                            Links.map((link, index) => (
                                (link.show === true || this.props.isAuthenticated === true) &&


                                <li key={index} className='md:ml-8 md:mr-0 mr-8 md:my-0 my-5 font-semibold block p-1'>
                                    <NavLink
                                        to={link.link}
                                        className={
                                            ({ isActive, isPending }) => {
                                                if (isActive) return "text-orange-500"
                                                else if (isPending) return "text-red-600"
                                                else return "text-white"
                                            }
                                        }
                                    >
                                        <Button style={{ color: link.link === activeLink ? '#B327E6' : 'grey', width: '100%', fontWeight: 'bold', outlineColor: 'white' }}
                                            onClick={() => {
                                                this.setState({ activeLink: link.link })
                                                if (this.state.isOpen === true) {
                                                    this.toggleMenu()
                                                }
                                            }} variant="outlined">
                                            {link.name}
                                        </Button>
                                    </NavLink>
                                </li>))
                        }
                        <li className='md:ml-9 flex md:flex items-end justify-end md:mr-0 mr-9'>
                            {this.props.isAuthenticated === true ? Logout_btn : LoginSignup_btn}
                        </li>

                    </ul>
                </div>
            </nav>
        );
    }
}

const mapStateToProps = state => ({
    isAuthenticated: state.auth.isAuthenticated,
    name: state.profile.username
});

export default connect(mapStateToProps, { logout })(Navbar);