import React, { Component } from "react";
import Grid from '@mui/material/Grid';
import { Button, Card, CardContent, Typography, Autocomplete, TextField, MenuItem, InputLabel, FormControl, Box, Select, Backdrop } from "@mui/material/"
import { East as EastIcon, AttachMoney as AttachMoneyIcon, AccessTime as AccessTimeIcon, West as WestIcon } from '@mui/icons-material';
import axios from "axios";
import { ThreeDots } from 'react-loader-spinner'
import {
    TableRow,
    TableHeaderCell,
    TableHeader,
    TableCell,
    TableBody,
    Table,
} from 'semantic-ui-react'
import CreateOrder from './createorder'
import 'fomantic-ui-css/semantic.min.css'; // Import Fomantic UI CSS
import 'fomantic-ui-css/semantic.min.js'; // Import Fomantic UI JavaScript
import 'fomantic-ui-css/semantic.css';
import { Link, useParams } from 'react-router-dom';

function withParams(Component) {
    return (props) => <Component {...props} params={useParams()} />;
}

export class order extends Component {

    constructor(props) {
        super()
        this.cancelTokenSource = axios.CancelToken.source();
        this.state = {
            list_all_order: [], //List Order 
            dateSelectList: [], //List Date
            isUpdateOrder: false,
            selectOreder: null,
            selectOrederIndex: 0,
            dateSelectedValue: '',
            scrollPosition: 0, // Initialize scroll position
            isLoadingBody: true,
            isLoadingDate: true,
            isEmptyDataBase: false,
            highlightedRowId: null,
        }
    }

    componentDidMount() {
        window.$('.ui.calendar').calendar({ type: 'date' });
        window.addEventListener('scroll', this.listenToScroll)
        this.setState({}, async () => {
            await this.get_List_Date();
            this.isLoad = true;
        })
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.listenToScroll)
    }

    handleOptionChange = async (value) => {
        if (this.state.isLoadingBody === true) {
            return
        }
        this.setState({
            isLoadingBody: true, // set loading body state to TRUE
            dateSelectedValue: value
        }, async () => {
            const date = this.state.dateSelectList[value].date
            await this.getListOrder(date)
            this.setState({ isLoadingBody: false })
        })
    }

    handleOnClickBackOption = () => {
        const { dateSelectedValue } = this.state
        this.handleOptionChange(dateSelectedValue > 0 ? (dateSelectedValue - 1) : 0)
    }

    handleOnClickForwardOption = () => {
        const { dateSelectedValue, dateSelectList } = this.state
        this.handleOptionChange(dateSelectedValue < (dateSelectList.length - 1) ? dateSelectedValue + 1 : (dateSelectList.length - 1))
    }



    closeModal = async (data, update) => {
        if (update === true) {
            const { dateSelectList, dateSelectedValue, selectOrederIndex, list_all_order } = this.state

            if (data.ordate !== dateSelectList[dateSelectedValue].date) {
                await this.get_List_Date()
                this.setState(preState => ({
                    list_all_order: preState.list_all_order.filter((order, index) => index !== selectOrederIndex)
                }))
            } else {
                const updateList = [...list_all_order]
                updateList[selectOrederIndex] = data
                this.setState({ list_all_order: updateList })
            }
        }
        this.setState({ isUpdateOrder: false });
        window.scrollTo(0, this.state.scrollPosition);
    };

    open_edit_order(modalValue) {
        const { list_all_order } = this.state;
        this.setState({
            selectOreder: list_all_order[modalValue],
            selectOrederIndex: modalValue,
            isUpdateOrder: true,
            scrollPosition: window.scrollY
        })
    }

    async getListOrder(date) {
        try {
            const res = await axios.get(`/api/v1/getallorderbydate/${date}/`)
            if (res.data.success) {
                this.setState({ list_all_order: res.data.success })
            }
        } catch (err) {
            if (err.response.data.detail) {
                console.log(err.response.data.detail, 'Could not confirm your account, please loggin')
            } else {
                console.log(err.response.data)
            }
        }
    }

    async get_List_Date() {
        try {
            const res = await axios.get('/api/v1/getlistdateorder')
            if (res.data.success) {
                this.setState({
                    dateSelectList: res.data.success,
                    isLoadingDate: false
                }, async () => {
                    const { dateSelectList } = this.state
                    const index = dateSelectList.findIndex(item => item.date === this.props.params.date);
                    const dateIndex = index !== -1 ? index : res.data.show_index
                    this.setState({ dateSelectedValue: dateIndex })
                    await this.getListOrder(dateSelectList[dateIndex].date)
                    this.setState({ isLoadingBody: false })
                })
            } else if (res.data.empty) {
                this.setState({ isEmptyDataBase: true, isLoadingDate: false, isLoadingBody: false })
            } else {
                console.log(res.data)
            }
        } catch (err) {
            if (err.response.data.detail) {
                console.log(err.response.data.detail, 'Could not confirm your account, please loggin')
            } else {
                console.log(err.response.data)
            }
        }
    }

    render() {
        const {
            list_all_order,
            isUpdateOrder,
            selectOreder,
            dateSelectedValue,
            dateSelectList,
            isLoadingBody,
            isLoadingDate,
            isEmptyDataBase,
            highlightedRowId
        } = this.state

        const loading_triangle = (
            <Grid container justifyContent="center" alignItems={'center'} direction='row'>
                <ThreeDots
                    visible={true}
                    height="80"
                    width="80"
                    color="#a759ab"
                    radius="9"
                    ariaLabel="three-dots-loading"
                    wrapperStyle={{}}
                    wrapperClass=""
                />
            </Grid>)

        const selectDate = (<>
            <Grid style={{ marginBottom: 12 }} container justifyContent="center" alignItems={'center'} direction='row'>
                <Box pr={1}>
                    <Button size="medium" disabled={isLoadingBody || dateSelectedValue === 0} onClick={this.handleOnClickBackOption} variant="outlined"><WestIcon fontSize='medium' /></Button>
                </Box>
                <Grid item xs={7} sm={6} md={5} lg={4}>
                    <FormControl sx={{ width: '100%' }}>
                        <InputLabel id="demo-simple-select-error-label">Date</InputLabel>
                        <Select
                            style={{ fontSize: '17px' }}
                            fullWidth
                            value={dateSelectedValue}
                            label="Date"
                            onChange={(e) => this.handleOptionChange(e.target.value)}>
                            {dateSelectList.map((ls, index) => (<MenuItem style={{ fontSize: '17px' }} key={index} value={index}>{ls.format_date}</MenuItem>))}
                        </Select>
                    </FormControl>
                </Grid>
                <Box pl={1}>
                    <Button size="medium" disabled={dateSelectedValue === dateSelectList.length - 1 ? true : isLoadingBody} onClick={this.handleOnClickForwardOption} variant="outlined"><EastIcon fontSize='medium' /></Button>
                </Box>
            </Grid>
        </>)

        const quick_detail = (<Card style={{ margin: 12 }}>
            <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                    Quick detail
                </Typography>
                <Typography variant="h6" component="div">
                    <span className=" text-1xl text-blue-900 font-semibold">Order:</span> {list_all_order.length}
                </Typography>
                <Typography variant="h6" component="div">
                    <span className=" text-1xl text-blue-900 font-semibold">Price:</span> {list_all_order.reduce((sum, item) => { return sum += item.total_price }, 0)}<AttachMoneyIcon className=' text-green-900 -mt-1' fontSize='Large' />
                </Typography>
            </CardContent>
        </Card>)

        const card_buttons = (<Card className="flex flex-col align-middle justify-center" sx={{ width: 157, height: 130 }} style={{ margin: 12 }}>
            <Link to="createorder"><Button fullWidth size="large">Create Orders</Button> </Link>
            <Link to="createitem"><Button fullWidth size="large">Create items</Button> </Link>
        </Card>)

        const search_input = (<Grid container item xs={12} style={{ maxWidth: 1000 }}>
            <Autocomplete autoFocus selectOnFocus clearOnBlur
                disablePortal
                fullWidth
                value={null}
                id="combo-box-demo"
                options={list_all_order}
                onChange={(e, b) => {
                    const element = document.getElementById(b.orid); 
                    document.activeElement.blur(); 
                    if (element) {
                        element.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
                         
                        setTimeout(() => {
                            this.setState({ highlightedRowId: b.orid }, () => {
                                setTimeout(() => {
                                    this.setState({ highlightedRowId: null });
                                }, 4000);
                            });
                        }, 800);  
                    } 
                }}
                getOptionLabel={(option) => option?.cus_name ?? ''}
                renderInput={(params) => <TextField {...params} label="Search name" />}
            />
        </Grid>)

        const order_item_table = (<Grid container item xs={12} style={{ marginTop: 10, maxWidth: 1000 }}>
            <Table unstackable sortable celled size="large">
                <TableHeader><TableRow>
                    <TableHeaderCell style={{ backgroundColor: '#f2f2f2' }}>Name </TableHeaderCell>
                    <TableHeaderCell style={{ backgroundColor: '#f2f2f2' }}>Item Order </TableHeaderCell>
                </TableRow></TableHeader>

                <TableBody>
                    {list_all_order.map((it, index) => (
                        <TableRow
                            id={it.orid}
                            key={it.orid} 
                            style={{
                                backgroundColor: highlightedRowId === it.orid ? '#D3D3D3' : '',
                                transition: 'background-color 0.5s, opacity 0.5s',
                                animation: `${highlightedRowId === it.orid ? 'scaleBackgroundColor 0.85s' : ''}` // Apply custom animation
                            }}
                            bgcolor={it.ispickup === true ? '#D3D3D3' : ''}>
                            <TableCell style={{ textAlign: 'left', width: 'auto' }}>
                                <p className="md:text-2xl text-1xl">
                                    {it.cus_name} <br />
                                    <AttachMoneyIcon className="-mt-1" /><b className=" text-blue-700">{it.total_price} </b><br />
                                    {it.orpickup.length > 0 ? <AccessTimeIcon className="-mt-1" fontSize='Large' /> : ""} {it.orpickup}
                                </p>

                            </TableCell>
                            <TableCell className=" md:w-4/5 text-[#4490cd] hover:text-[#cd44c8] cursor-pointer md:text-2xl text-1xl p-0" onClick={() => { this.open_edit_order(index) }}>
                                {it.details && it.details.map((detail, index, array) => (
                                    <div key={detail.detailid}>
                                        {/* Display Category */}
                                        {index === 0 || detail.cag_name !== array[index - 1].cag_name ? (
                                            <b className="flex justify-end text-red-500">{detail.cag_name}</b>
                                        ) : null}

                                        <div className=" border">
                                            <b className="text-black">{detail.detailquality} {detail.detailquality < 10 ? "\u00A0\u00A0" : ''} </b>
                                            {detail.item_name}
                                            <span className=" text-gray-500"> {detail.detailnote != null && detail.detailnote.trim().length > 0 ? `(${detail.detailnote})` : ''}</span>
                                            <br />
                                            {detail.toppings?.map((top, topIndex, array) => (
                                                <span key={index + '' + topIndex + '_topping'} className=" pl-10 text-gray-400">
                                                    {top.topquality > 1 ? top.topquality : ''} {top.top_name}
                                                </span>))}
                                        </div>

                                    </div>
                                ))}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Grid>)

        const body = (
            <Grid className="animate-fade-in" container direction="column" justifyContent="center" alignItems="center">
                <Grid container direction="row" justifyContent={"center"} alignItems={"center"} spacing={1} >
                    {quick_detail} {card_buttons}
                </Grid>
                {search_input}
                {order_item_table}
            </Grid>)

        return (
            <>
                {isUpdateOrder ? <CreateOrder isCreateOrder={false} data={selectOreder} onClose={this.closeModal} /> : ''}
                <h1>Order</h1>


                {isEmptyDataBase === true ? <div className='flex align-middle justify-center'>{card_buttons}</div> :
                    <div className='mt-10 animate-scale'>
                        {isLoadingDate ? loading_triangle : selectDate}
                        {isLoadingBody ? loading_triangle : body}

                    </div>
                }
            </>
        )
    }
}
export default withParams(order);