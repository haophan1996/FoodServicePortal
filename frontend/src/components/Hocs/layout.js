import React, { Component, Fragment } from "react";
import Navbar from '../Header/Navbar';
import { connect } from "react-redux";
import { checkAuthenticated } from '../Auth/auth'
import { Routes } from "react-router-dom";
import { load_user } from "../Auth/profile"

export class Layout extends Component {

    constructor(props) {
        super()
        this.state = {
            isLoading: false,
        }
    }

    async componentDidMount() {
        await this.props.checkAuthenticated();
        await this.props.load_user();
        this.setState({ isLoading: true })
    }

    render() {
        const { children } = this.props;
        const { isLoading } = this.state;
        if (isLoading) {
            return (
                <Fragment>
                    <Navbar />
                    <div className='  ml-1 mr-1 mt-19 pt-20 pb-20 pl-1 pr-1' >
                    {/* <div className='flex-grow border border-black rounded-sm ml-2 mr-2 mt-19 pt-20 pl-2 pr-2' > */}
                        <Routes>
                            {children}
                        </Routes>
                    </div>
                </Fragment>
            )
        }

    }
} 

export default connect(null, { checkAuthenticated, load_user })(Layout);