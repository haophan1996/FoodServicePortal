import React, { Component } from "react";
import { ThreeDots } from 'react-loader-spinner'
import 'fomantic-ui-css/semantic.min.css';
import 'fomantic-ui-css/semantic.min.js';
import 'fomantic-ui-css/semantic.css';
import axios from "axios";
import { Link, useParams } from 'react-router-dom';
import { TextField, Grid, Button, Autocomplete, Chip, Menu, MenuItem, InputAdornment, Backdrop } from "@mui/material/"
import { getExtractCookie } from '../Auth/auth';

function withParams(Component) {
    return (props) => <Component {...props} params={useParams()} />;
}

export class CreateOrder extends Component {
    constructor(props) {
        super(props)
        this.ref_input_name = React.createRef();
        this.cancelTokenSource = axios.CancelToken.source();
        this.state = {
            isCreateOrder: this.props?.isCreateOrder ?? true,
            isLoadingBody: true, isLoadingInit: true,
            isBackDropOpen: false,
            anchorEl: { target: null, index: null, indexParent: null },
            list_items: [],
            list_customer: [],
            list_topping: [],
            initDetailFields: { detailnote: "", detailquality: '', item_id: null, cag_id: null, toppings: [] },
            detailFields: [], //List add more item
            orderField: [],
            initOrderField: { cus_name: '', cus_id: -1, ordate: '', orpickup: '', details: [] },
            list_itemid_selected: [], //Keep tracking if item select, so item in list will disblaed
            calendar: null,
            time: null,
            selectedOptions: []
        }
    }

    async componentDidMount() {
        document.addEventListener("keydown", this.handleKeyPress);
        this.setState({
            calendar: window.$('.ui.calendar').calendar({
                type: 'date',
                onChange: (date, text) => {
                    if (date === null) return
                    const format_date = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
                    this.onOrderInfoChange(format_date, "ordate")
                }
            }),
            time: window.$('.ui.time').calendar({
                type: 'time',
                formatter: {
                    cellTime: 'h:mm A',
                },
                onChange: (date, text) => {
                    if (text === null) return
                    this.onOrderInfoChange(text, "orpickup")
                }
            })
        })

        const { isCreateOrder } = this.state
        await this.getListItem()
        await this.getListCustomer()
        await this.getListTopping()
        this.setState({ isLoadingBody: false, isLoadingInit: false })
        if (isCreateOrder) {
            this.initListOrder()
            this.addFields()
            this.addFields()
            this.addFields()
        } else {
            this.setState({
                orderField: this.props.data,
                detailFields: this.props.data.details,
            }, () => {
                document.body.style.overflow = 'hidden';
                this.ref_input_name.current.focus();
                this.state.calendar.calendar('set date', this.state.orderField.ordate)

                const ampm = this.state.orderField.orpickup.split(' ')[1] ?? ''
                const date = new Date()
                let hours = parseInt(this.state.orderField.orpickup.split(':')[0] ?? 0)
                if (ampm === 'PM') {
                    hours += 12
                }
                date.setHours(hours)
                date.setMinutes(this.state.orderField.orpickup.split(':')[1]?.split(' ')[0] ?? 0)
                this.state.time.calendar('set date', date)
            })
        }
    }

    componentWillUnmount() {
        document.body.style.overflow = 'auto';
        document.removeEventListener("keydown", this.handleKeyPress);
    }

    closeModal = (data, update) => { this.props.onClose(data, update) };


    addFields = async () => {
        const { initDetailFields, list_items } = this.state
        if (list_items.length === 0) { await this.getListItem() }

        this.setState(prevState => ({
            detailFields: [...prevState.detailFields, initDetailFields]
        }));
    };

    resetFields = (excepDate) => {
        const date = this.state.orderField.ordate
        this.setState({
            orderField: this.state.initOrderField,
            detailFields: [],
            list_itemid_selected: []
        }, () => {
            this.addFields()
            this.addFields()
            this.addFields()
            this.state.calendar.calendar('set date', excepDate === true ? date : null)
            this.state.time.calendar('set date', null)
            this.ref_input_name.current.focus();
        })
    }

    initListOrder = () => {
        this.setState({
            orderField: this.state.initOrderField
        })
    }

    setDisabledItemSelected = (oldItemid, newItemid) => {
        const { list_itemid_selected } = this.state
        if (oldItemid !== null) {
            const updateList = list_itemid_selected.filter(item => item !== oldItemid)
            this.setState({ list_itemid_selected: updateList })
        }

        if (newItemid !== null) {
            this.setState(prevState => ({
                list_itemid_selected: [...prevState.list_itemid_selected, newItemid]
            }));
        }
    }

    onDetailAddChange = (value, index, keyUpdate, value2, keyUpdate2) => {
        const updatedDetails = [...this.state.detailFields]
        updatedDetails[index] = { ...updatedDetails[index], [keyUpdate]: value }

        if (keyUpdate2 !== null && keyUpdate2 !== undefined) {
            updatedDetails[index] = { ...updatedDetails[index], [keyUpdate2]: value2, [keyUpdate]: value }
        }
        if (keyUpdate === 'item_id') {
            const item = this.state.list_items.find(item => item.itemid === value)
            const cagname = item?.cag_name ?? 'Could not find Cagtegory Name'
            const itemname = item?.itemname ?? 'Could not find Item Name'
            updatedDetails[index] = { ...updatedDetails[index], item_name: itemname, cag_name: cagname, toppings: [] }
        }

        this.setState({ detailFields: updatedDetails })
    }

    onOrderInfoChange = (value, keyupdate) => {
        this.setState(preState => ({
            orderField: {
                ...preState.orderField,
                [keyupdate]: value
            }
        }))
    }

    validateForm = async () => {
        const { orderField, detailFields } = this.state
        if (!orderField.ordate.trim() || !orderField.cus_name.trim()) {
            alert("Customer Name / Date cannot be blank.");
            document.getElementById("CustomerName").style.borderColor = "red";
            return false
        }

        for (let i = 0; i < detailFields.length; i++) {
            const key = detailFields[i];
            if (key.item_id !== null && (key.detailquality === null || isNaN(key.detailquality) || key.detailquality <= 0)) {
                alert("Quantity cannot be blank/Zero if an item is selected");
                return false;
            }
        }
        const addDetail = {
            ...orderField,
            details: [...detailFields]
        }
        this.setState({ orderField: addDetail }, async () => {
            return true;
        })
    }

    postOrder = async () => {
        if (await this.validateForm() === false) return
        const { orderField } = this.state
        try {
            const csrft = await getExtractCookie(this.cancelTokenSource)
            const postOrder = JSON.stringify(orderField);
            const config = {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': ' application/json',
                    'X-CSRFToken': csrft
                }
            };
            const res = await axios.post("api/v1/postorder", postOrder, config)
            if (res.data.success) {
                this.resetFields(true)
            } else {
                alert(res.data.error);
                console.log(res.data)
            }
        } catch (error) {
            console.log("Cannot fetch Get list customer", error)
        }
    }

    updateOrder = async () => {
        if (await this.validateForm() === false) return
        const { orderField } = this.state
        try {
            const updateOrder = JSON.stringify(orderField);
            const csrft = await getExtractCookie(this.cancelTokenSource)
            const config = {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': ' application/json',
                    'X-CSRFToken': csrft
                }
            };

            const res = await axios.post('/api/v1/updateorder', updateOrder, config)
            if (res.data.success_delete) {
                this.closeModal([], true)
            } else if (res.data.success) {
                const updated_order = res.data.success[0]
                this.closeModal(updated_order, true)
            } else {
                console.log(res.data.error)
            }
        } catch (error) {
            console.log("Cannot fetch Get list customer", error)
        }
    }

    isTopping = (index) => {
        const { detailFields, list_topping } = this.state
        return list_topping[detailFields[index]?.cag_id] ?? []
    }

    handleAddTopping = (newValue, index, reason, detail) => {
        const updatedDetailFields = [...this.state.detailFields];
        if (reason === 'removeOption') {
            if (detail?.detail_id !== undefined) {
                // //This data already in Database, change detail_id to -1 , so we can query delete 
                const updateToppings = updatedDetailFields[index].toppings
                const remove_detailtopid = updateToppings.findIndex(item => item.detailtopid === detail.detailtopid)
                updateToppings[remove_detailtopid].detail_id = -1
                updatedDetailFields[index] = { ...updatedDetailFields[index], toppings: updateToppings }

            } else {
                updatedDetailFields[index] = { ...updatedDetailFields[index], toppings: newValue };
            }
        } else if (reason === 'selectOption') {
            const findIndex = updatedDetailFields[index].toppings.findIndex(item => item.detail_id === -1 || item.top_id === detail.top_id)
            const detailquality = updatedDetailFields[index].detailquality
            if (findIndex !== -1) {
                //This data already in Database, change detail_id to -2 , so we can query update
                updatedDetailFields[index].toppings[findIndex] = {
                    ...updatedDetailFields[index].toppings[findIndex],
                    detail_id: -2,
                    topquality: (typeof detailquality === 'number' && detailquality > 1) ? detailquality : detail.topquality,
                    topprice: detail.topprice,
                    top_name: detail.top_name
                }
            } else {
                const newDetail = { ...detail }
                if (typeof detailquality === 'number' && detailquality > 1) {
                    newDetail.topquality = detailquality
                }
                const updateToppings = updatedDetailFields[index].toppings
                updateToppings.push(newDetail);
                updatedDetailFields[index] = { ...updatedDetailFields[index], toppings: updateToppings };
            }
        }

        this.setState({ detailFields: updatedDetailFields });
    };

    handleToppingChangeQuanlity = (value, index, indexParent) => {
        this.setState(prevState => {
            const updatedDetailFields = [...prevState.detailFields];

            if (indexParent >= 0 && indexParent < updatedDetailFields.length) {
                const updatedTopping = [...updatedDetailFields[indexParent].toppings];
                if (index >= 0 && index < updatedTopping.length) {
                    const updatedToppingItem = { ...updatedTopping[index] };
                    updatedToppingItem.topquality = value;
                    if (updatedToppingItem.detail_id !== undefined) {
                        updatedToppingItem.detail_id = -2;
                    }
                    updatedTopping[index] = updatedToppingItem;
                    updatedDetailFields[indexParent].toppings = updatedTopping;
                }
            }
            return { detailFields: updatedDetailFields };
        });
    };

    handleShowMenuChip = (index, indexParent, toggle, event) => {
        if (toggle) {
            this.setState({ anchorEl: { target: event.target, index, indexParent }, isBackDropOpen: true });
        }
    };

    nextFocus = (value) => {
        const nextInput = document.getElementById(value);
        if (nextInput) {
            nextInput.focus();
        }
    }

    isOptionEqualToValue = (option, value) => {
        if (!option || !value) return false; // Handle edge cases 
        // console.log(option, value)
        return (
            option.top_id === value.top_id
        );
    };


    async getListCustomer() {
        try {
            const res = await axios.get("api/v1/getallcustomer")
            if (res.data.success) {
                this.setState({
                    list_customer: res.data.success,
                })
            } else {
                console.log(res.data.error)
            }
        } catch (error) {
            console.log("Cannot fetch Get list customer", error)
        }
        // this.setState({
        //     list_customer: [
        //         {
        //             "cusid": 30,
        //             "cusname": "Cthu",
        //             "cusphone": null,
        //             "cusnote": null
        //         },
        //         {
        //             "cusid": 31,
        //             "cusname": "Lynn Elsa",
        //             "cusphone": null,
        //             "cusnote": null
        //         }
        //     ]
        // })
    }

    async getListItem() {
        try {
            const res = await axios.get("api/v1/getallitem")
            if (res.data.success) {
                this.setState({
                    list_items: res.data.success,
                })
            } else {
                console.log(res.data.error)
            }
        } catch (error) {
            console.log("Cannot fetch Get list customer", error)
        }
        // this.setState({
        //     list_items: [
        //         {
        //             "itemid": 47,
        //             "cag_name": "Bông Lan Trứng Múi",
        //             "cag_id": 19,
        //             "itemname": "10 in",
        //             "itemprice": "42.00",
        //             "itemnote": ""
        //         },
        //         {
        //             "itemid": 48,
        //             "cag_name": "Bông Lan Trứng Múi",
        //             "cag_id": 19,
        //             "itemname": "10 in KSA",
        //             "itemprice": "45.00",
        //             "itemnote": ""
        //         },
        //         {
        //             "itemid": 43,
        //             "cag_name": "Bông Lan Trứng Múi",
        //             "cag_id": 19,
        //             "itemname": "12 cupcake",
        //             "itemprice": "28.00",
        //             "itemnote": ""
        //         },
        //         {
        //             "itemid": 44,
        //             "cag_name": "Bông Lan Trứng Múi",
        //             "cag_id": 19,
        //             "itemname": "12 cupcake KSA",
        //             "itemprice": "30.00",
        //             "itemnote": ""
        //         },
        //         {
        //             "itemid": 49,
        //             "cag_name": "Bông Lan Trứng Múi",
        //             "cag_id": 19,
        //             "itemname": "12 in",
        //             "itemprice": "65.00",
        //             "itemnote": ""
        //         },
        //         {
        //             "itemid": 50,
        //             "cag_name": "Bông Lan Trứng Múi",
        //             "cag_id": 19,
        //             "itemname": "12 in KSA",
        //             "itemprice": "70.00",
        //             "itemnote": ""
        //         },
        //         {
        //             "itemid": 64,
        //             "cag_name": "Bông Lan Trứng Múi",
        //             "cag_id": 19,
        //             "itemname": "6 cupcake",
        //             "itemprice": "14.00",
        //             "itemnote": ""
        //         },
        //         {
        //             "itemid": 65,
        //             "cag_name": "Bông Lan Trứng Múi",
        //             "cag_id": 19,
        //             "itemname": "6 cupcake KSA",
        //             "itemprice": "15.00",
        //             "itemnote": ""
        //         },
        //         {
        //             "itemid": 45,
        //             "cag_name": "Bông Lan Trứng Múi",
        //             "cag_id": 19,
        //             "itemname": "8 in",
        //             "itemprice": "32.00",
        //             "itemnote": ""
        //         },
        //         {
        //             "itemid": 46,
        //             "cag_name": "Bông Lan Trứng Múi",
        //             "cag_id": 19,
        //             "itemname": "8 in KSA",
        //             "itemprice": "35.00",
        //             "itemnote": ""
        //         },
        //         {
        //             "itemid": 51,
        //             "cag_name": "Bông Lan Trứng Múi",
        //             "cag_id": 19,
        //             "itemname": "Togo",
        //             "itemprice": "16.00",
        //             "itemnote": ""
        //         },
        //         {
        //             "itemid": 52,
        //             "cag_name": "Bông Lan Trứng Múi",
        //             "cag_id": 19,
        //             "itemname": "Togo KSA",
        //             "itemprice": "18.00",
        //             "itemnote": ""
        //         },
        //         {
        //             "itemid": 54,
        //             "cag_name": "Cafe",
        //             "cag_id": 24,
        //             "itemname": "Cf Sữa cheese foam",
        //             "itemprice": "5.00",
        //             "itemnote": ""
        //         },
        //         {
        //             "itemid": 53,
        //             "cag_name": "Cafe",
        //             "cag_id": 24,
        //             "itemname": "Cf Sữa Đá",
        //             "itemprice": "5.00",
        //             "itemnote": ""
        //         },
        //         {
        //             "itemid": 59,
        //             "cag_name": "Sửa Chua",
        //             "cag_id": 23,
        //             "itemname": "Nếp Cẩm",
        //             "itemprice": "6.00",
        //             "itemnote": ""
        //         },
        //         {
        //             "itemid": 72,
        //             "cag_name": "Sửa Chua",
        //             "cag_id": 23,
        //             "itemname": "blueberry",
        //             "itemprice": "6.00",
        //             "itemnote": ""
        //         },
        //         {
        //             "itemid": 71,
        //             "cag_name": "Sửa Chua",
        //             "cag_id": 23,
        //             "itemname": "cam",
        //             "itemprice": "6.00",
        //             "itemnote": ""
        //         },
        //         {
        //             "itemid": 69,
        //             "cag_name": "Sửa Chua",
        //             "cag_id": 23,
        //             "itemname": "chanh dây",
        //             "itemprice": "6.00",
        //             "itemnote": ""
        //         },
        //         {
        //             "itemid": 70,
        //             "cag_name": "Sửa Chua",
        //             "cag_id": 23,
        //             "itemname": "dâu",
        //             "itemprice": "6.00",
        //             "itemnote": ""
        //         },
        //         {
        //             "itemid": 74,
        //             "cag_name": "Sửa Chua",
        //             "cag_id": 23,
        //             "itemname": "original",
        //             "itemprice": "6.00",
        //             "itemnote": ""
        //         },
        //         {
        //             "itemid": 73,
        //             "cag_name": "Sửa Chua",
        //             "cag_id": 23,
        //             "itemname": "thơm",
        //             "itemprice": "6.00",
        //             "itemnote": ""
        //         },
        //         {
        //             "itemid": 66,
        //             "cag_name": "Trà",
        //             "cag_id": 21,
        //             "itemname": "Cam xí muội - TC trắng",
        //             "itemprice": "6.00",
        //             "itemnote": ""
        //         },
        //         {
        //             "itemid": 68,
        //             "cag_name": "Trà",
        //             "cag_id": 21,
        //             "itemname": "Chanh thái xanh + TC trắng",
        //             "itemprice": "6.00",
        //             "itemnote": ""
        //         },
        //         {
        //             "itemid": 62,
        //             "cag_name": "Trà",
        //             "cag_id": 21,
        //             "itemname": "Dâu - TC trắng",
        //             "itemprice": "6.00",
        //             "itemnote": ""
        //         },
        //         {
        //             "itemid": 61,
        //             "cag_name": "Trà",
        //             "cag_id": 21,
        //             "itemname": "Nhãn - Khúc Bạch",
        //             "itemprice": "7.00",
        //             "itemnote": ""
        //         },
        //         {
        //             "itemid": 67,
        //             "cag_name": "Trà Sửa",
        //             "cag_id": 25,
        //             "itemname": "Bơ",
        //             "itemprice": "7.00",
        //             "itemnote": ""
        //         },
        //         {
        //             "itemid": 75,
        //             "cag_name": "Trà Sửa",
        //             "cag_id": 25,
        //             "itemname": "Hồng (chai)",
        //             "itemprice": "6.00",
        //             "itemnote": ""
        //         },
        //         {
        //             "itemid": 57,
        //             "cag_name": "Trà Sửa",
        //             "cag_id": 25,
        //             "itemname": "Hồng (ly)",
        //             "itemprice": "6.00",
        //             "itemnote": ""
        //         },
        //         {
        //             "itemid": 58,
        //             "cag_name": "Trà Sửa",
        //             "cag_id": 25,
        //             "itemname": "Olong Lài (ly)",
        //             "itemprice": "6.00",
        //             "itemnote": ""
        //         },
        //         {
        //             "itemid": 78,
        //             "cag_name": "Trà Sửa",
        //             "cag_id": 25,
        //             "itemname": "Olong lài (chai)",
        //             "itemprice": "6.00",
        //             "itemnote": ""
        //         },
        //         {
        //             "itemid": 55,
        //             "cag_name": "Trà Sửa",
        //             "cag_id": 25,
        //             "itemname": "Thái Xanh (ly)",
        //             "itemprice": "6.00",
        //             "itemnote": ""
        //         },
        //         {
        //             "itemid": 56,
        //             "cag_name": "Trà Sửa",
        //             "cag_id": 25,
        //             "itemname": "Thái Đỏ (ly)",
        //             "itemprice": "6.00",
        //             "itemnote": ""
        //         },
        //         {
        //             "itemid": 76,
        //             "cag_name": "Trà Sửa",
        //             "cag_id": 25,
        //             "itemname": "thái xanh (chai)",
        //             "itemprice": "6.00",
        //             "itemnote": ""
        //         },
        //         {
        //             "itemid": 77,
        //             "cag_name": "Trà Sửa",
        //             "cag_id": 25,
        //             "itemname": "thái đỏ (chai)",
        //             "itemprice": "6.00",
        //             "itemnote": ""
        //         }
        //     ]
        // })
    }

    async getListTopping() {
        try {
            const res = await axios.get("api/v1/getalltopping")
            if (res.data.success) {
                this.setState({
                    list_topping: res.data.success,
                })
            } else {
                console.log(res.data.error)
            }
        } catch (error) {
            console.log("Cannot fetch Get list customer", error)
        }
        // this.setState({
        //     list_topping: {
        //         "21": [
        //             {
        //                 "top_id": 7,
        //                 "cag_name": "Trà",
        //                 "cag_id": 21,
        //                 "top_name": "Flan",
        //                 "topprice": "1.00",
        //                 "topquality": 1
        //             },
        //             {
        //                 "top_id": 9,
        //                 "cag_name": "Trà",
        //                 "cag_id": 21,
        //                 "top_name": "Phô mai Jerry",
        //                 "topprice": "1.00",
        //                 "topquality": 1
        //             },
        //             {
        //                 "top_id": 12,
        //                 "cag_name": "Trà",
        //                 "cag_id": 21,
        //                 "top_name": "Phô mai viên (4 viên)",
        //                 "topprice": "1.00",
        //                 "topquality": 1
        //             },
        //             {
        //                 "top_id": 13,
        //                 "cag_name": "Trà",
        //                 "cag_id": 21,
        //                 "top_name": "Rau câu phô mai (6 viên)",
        //                 "topprice": "1.00",
        //                 "topquality": 1
        //             },
        //             {
        //                 "top_id": 14,
        //                 "cag_name": "Trà",
        //                 "cag_id": 21,
        //                 "top_name": "Lava trứng múi (3 viên)",
        //                 "topprice": "1.00",
        //                 "topquality": 1
        //             },
        //             {
        //                 "top_id": 10,
        //                 "cag_name": "Trà",
        //                 "cag_id": 21,
        //                 "top_name": "Cheese ball (4 viên)",
        //                 "topprice": "1.00",
        //                 "topquality": 1
        //             },
        //             {
        //                 "top_id": 11,
        //                 "cag_name": "Trà",
        //                 "cag_id": 21,
        //                 "top_name": "Khúc bạch (4viên)",
        //                 "topprice": "1.00",
        //                 "topquality": 1
        //             }
        //         ],
        //         "25": [
        //             {
        //                 "top_id": 15,
        //                 "cag_name": "Trà Sửa",
        //                 "cag_id": 25,
        //                 "top_name": "Flan",
        //                 "topprice": "1.00",
        //                 "topquality": 1
        //             },
        //             {
        //                 "top_id": 16,
        //                 "cag_name": "Trà Sửa",
        //                 "cag_id": 25,
        //                 "top_name": "Phô mai Jerry",
        //                 "topprice": "1.00",
        //                 "topquality": 1
        //             },
        //             {
        //                 "top_id": 18,
        //                 "cag_name": "Trà Sửa",
        //                 "cag_id": 25,
        //                 "top_name": "Phô mai viên (4 viên)",
        //                 "topprice": "1.00",
        //                 "topquality": 1
        //             },
        //             {
        //                 "top_id": 19,
        //                 "cag_name": "Trà Sửa",
        //                 "cag_id": 25,
        //                 "top_name": "Rau câu phô mai (6 viên)",
        //                 "topprice": "1.00",
        //                 "topquality": 1
        //             },
        //             {
        //                 "top_id": 21,
        //                 "cag_name": "Trà Sửa",
        //                 "cag_id": 25,
        //                 "top_name": "Lava trứng múi (3 viên)",
        //                 "topprice": "1.00",
        //                 "topquality": 1
        //             },
        //             {
        //                 "top_id": 20,
        //                 "cag_name": "Trà Sửa",
        //                 "cag_id": 25,
        //                 "top_name": "Cheese ball (4 viên)",
        //                 "topprice": "1.00",
        //                 "topquality": 1
        //             },
        //             {
        //                 "top_id": 17,
        //                 "cag_name": "Trà Sửa",
        //                 "cag_id": 25,
        //                 "top_name": "Khúc bach (4 viên)",
        //                 "topprice": "1.00",
        //                 "topquality": 1
        //             }
        //         ]
        //     }
        // })
    }


    render() {
        const {
            isLoadingBody,
            isLoadingInit,
            list_customer,
            detailFields,
            orderField,
            list_items,
            list_itemid_selected,
            isBackDropOpen,
            anchorEl,
            isCreateOrder,
        } = this.state;

        const loading_triangle = (
            <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center">
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
            </div>)

        const calendar_ui = (<div className="ui calendar" id="multimonth_calendar" ref={this.calendarRef} >
            <div className="ui input left icon">
                <i className="calendar icon"></i>
                <input type="text" placeholder="Date" id="calendar_date" name="calendar_date" />
            </div>
        </div>)

        const time_ui = (<div className="ui time" id="no_ampm">
            <div className="ui input left icon">
                <i className="time icon"></i>
                <input type="text" placeholder="Time" id="time_input" name="time_input" />
            </div>
        </div>)

        const CustomTextField = ({ id, fullWidth, disabled, className, label, style, value, onChange, type, onKeyDown }) => (
            <TextField fullWidth={fullWidth}
                disabled={disabled}
                style={style}
                type={type === null ? 'text' : type}
                className={className}
                InputProps={{ style: { fontSize: 14, fontWeight: "bold" } }}
                id={id}
                label={label}
                variant="outlined"
                value={value}
                onKeyDown={onKeyDown}
                onChange={onChange} />
        );

        const CustomAutoselect = ({ id, style, label, freeSolo, options, disabled, getOptionDisabled, getOptionLabel, groupBy, onChange, onInputChange, inputValue, inputref, fullWidth, inputProps }) => (
            <Autocomplete freeSolo={freeSolo} fullWidth={fullWidth} selectOnFocus disabled={disabled}
                style={style}
                id={id}
                onChange={onChange}
                onInputChange={onInputChange}
                getOptionDisabled={getOptionDisabled}
                options={options}
                groupBy={groupBy}
                inputValue={inputValue}
                getOptionLabel={getOptionLabel}
                renderInput={(params) => {
                    const id = params.id.split('_')[0]
                    const categoryname = detailFields[id]?.cag_name ?? 'Item'
                    return <TextField {...params}
                        label={label}
                        inputRef={inputref}
                        placeholder="type a few words"
                        InputProps={{
                            ...params.InputProps,
                            type: 'search',
                            startAdornment: inputProps !== null && inputProps !== undefined ? <InputAdornment position="start">{categoryname}</InputAdornment> : null,
                        }}
                    />
                }} />
        )

        const input_name = (CustomAutoselect({
            id: "CustomerName",
            disabled: !isCreateOrder,
            style: { marginBottom: 10 },
            freeSolo: true,
            inputValue: orderField.cus_name,
            label: "Customer Name",
            options: list_customer,
            inputref: this.ref_input_name,
            onChange: (e, value) => {
                if (value !== null && typeof (value) === "object") {
                    this.onOrderInfoChange(value.cusname, "cus_name");
                    this.onOrderInfoChange(value.cusid, "cus_id")
                } else if (value !== null) {
                    this.onOrderInfoChange(value, "cus_name");
                    this.onOrderInfoChange(-1, "cus_id")
                }
            },
            onInputChange: (e, value) => {
                if (e === null || e.key === 'Enter') {
                    this.nextFocus("0_select")
                    return
                }
                if (value !== null && typeof (value) === "object") {
                    this.onOrderInfoChange(value.cusname, "cus_name");
                    this.onOrderInfoChange(value.cusid, "cus_id")
                } else if (value !== null) {
                    this.onOrderInfoChange(value, "cus_name");
                    this.onOrderInfoChange(-1, "cus_id")
                }
            },
            getOptionLabel: (option) => (option && option.cusname ? option.cusname : ''),
        }))

        const fieldAddmore = detailFields.map((field, index) => {
            if (field?.detailid < 0) {
                return null
            }
            return <div key={index} className=" border-gray-300 border rounded-md mb-5  ">
                <Grid item container direction="row" alignItems="center" justifyContent="flex-start" style={{ margin: 7 }}>
                    {field?.detailid !== undefined ?
                        <Grid item container xs={12} alignItems="center">
                            <b className="ml-5">{field.cag_name} {field.item_name}</b>
                            <Button style={{ marginRight: 20 }} size="large" className=" p-0 m-0" onClick={() => {
                                this.onDetailAddChange(-field.detailid, index, 'detailid')
                            }}>Remove</Button>
                        </Grid>
                        :
                        CustomAutoselect({
                            fullWidth: true,
                            disabled: field?.detailid === undefined ? false : !isCreateOrder,
                            style: { marginRight: 15, marginBottom: 8 },
                            id: String(index) + '_select',
                            options: list_items,
                            label: "Select Item",
                            inputProps: 'Items',
                            groupBy: (option) => option.cag_name,
                            getOptionLabel: (option) => ((option?.itemname ?? '') + ((list_itemid_selected?.includes(option?.itemid) ? ' ✅' : ''))),
                            // getOptionDisabled: (option) => {
                            //     return list_itemid_selected.includes(option.itemid)
                            // }, 
                            onChange: (e, value) => {
                                this.setDisabledItemSelected(field.item_id, value.itemid)
                                this.onDetailAddChange(value.itemid || -1, index, "item_id", value.cag_id || -1, "cag_id")
                                if (e === null || e.key === 'Enter') {
                                    this.nextFocus(String(index) + '_quanltiy')
                                }
                            }
                        })}
                    {CustomTextField({
                        id: String(index) + "_quanltiy",
                        label: 'Quanltiy',
                        type: 'number',
                        style: { maxWidth: 100, marginRight: 5, marginTop: 5, marginBottom: 8 },
                        value: field.detailquality ? field.detailquality : '',
                        onChange: (e) => {
                            this.onDetailAddChange(parseInt(e.target.value), index, "detailquality")
                        },
                        onKeyDown: (e) => {
                            if (e === null || e.key === 'Enter') {
                                this.nextFocus(String(index) + '_note')
                            }
                        }
                    })}
                    {CustomTextField({
                        id: String(index) + '_note',
                        label: 'Note',
                        style: { marginRight: 5, marginTop: 5, marginBottom: 8 },
                        value: field.detailnote === null ? '' : field.detailnote,
                        onChange: (e) => {
                            this.onDetailAddChange(e.target.value, index, "detailnote")
                        },
                        onKeyDown: (e) => {
                            if (index === detailFields.length) return
                            if (e === null || e.key === 'Enter') {
                                this.nextFocus(String(index + 1) + '_select')
                            }
                        }
                    })}

                    {this.isTopping(index).length === 0 ? '' :
                        <Autocomplete
                            multiple
                            id="multiple-select-chips"
                            style={{ marginRight: 11, marginTop: 5, marginBottom: 8, minWidth: 150 }}
                            options={this.isTopping(index)}
                            onChange={(event, value, reason, detail) => {
                                this.handleAddTopping(value, index, reason, detail?.option)
                            }}
                            value={(detailFields[index].toppings || []).filter(option => option.detail_id !== -1)}
                            getOptionLabel={(option) => (option ? option.top_name : '')}
                            isOptionEqualToValue={(option, value) => this.isOptionEqualToValue(option, value)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    variant="outlined"
                                    label="Options"
                                />
                            )}
                            renderTags={(value, getTagProps) =>
                                value.map((opt, indx) => {
                                    if (opt?.detail_id === -1) return null
                                    return <Chip
                                        style={{ fontWeight: 'bold' }}
                                        key={indx}
                                        label={(opt.topquality === 1 ? '' : opt.topquality) + ' ' + opt.top_name}
                                        onClick={(event) => this.handleShowMenuChip(indx, index, true, event)}
                                        {...getTagProps({ index: indx })}
                                    />
                                }
                                )}
                        />}
                </Grid>
            </div>
        })

        const menuItem = (
            <Menu
                id="long-menu"
                MenuListProps={{
                    'aria-labelledby': 'long-button',
                }}
                anchorEl={anchorEl.target}
                open={isBackDropOpen}
                onClose={() => this.setState({ isBackDropOpen: false })}
                slotProps={{ paper: { style: { maxHeight: 48 * 4.5, width: '20ch' } } }}
            >
                {[...Array(20).keys()].map((number) => (
                    <MenuItem
                        key={number + 1}
                        onClick={() => {
                            this.handleToppingChangeQuanlity(number + 1, anchorEl.index, anchorEl.indexParent)
                            this.setState({ isBackDropOpen: false })
                        }}
                    >
                        {number + 1}
                    </MenuItem>
                ))}
            </Menu>)

        const btn_action = (
            <Grid container item alignItems="center" justifyContent="space-around">
                <Button onClick={this.addFields} >Add Field</Button>

                <Button onClick={async () => {
                    this.setState({ isLoadingBody: true })
                    isCreateOrder ? await this.postOrder() : await this.updateOrder();
                    this.setState({ isLoadingBody: false })
                }} >{isCreateOrder ? 'Submit order' : 'Save Order'}</Button>

                <Button onClick={async () => {
                    if (isCreateOrder) {
                        this.resetFields()
                    } else {
                        this.onOrderInfoChange(-orderField.orid, 'orid')
                    }
                }}>{isCreateOrder ? 'Reset fields' : 'Delete'}</Button>
                {!isCreateOrder ? <Button onClick={() => this.closeModal()} >Close</Button> : null}
            </Grid>)

        const backdrop = (
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={isLoadingBody}
            >{loading_triangle}
            </Backdrop>)

        return (
            <div className={`z-10 ${isCreateOrder === true ? '' : 'fixed top-0 left-0 w-full h-full overflow-y-auto overflow-x-hidden bg-white'} md:pl-40 md:pr-40 p-1`}>
                <h1>{isCreateOrder === true ? 'Create' : 'Update'} {<Link to="/order">Order</Link>}</h1>
                {menuItem}
                {backdrop}
                <Grid container item direction='row' xs={12} alignItems="center" justifyContent="center" gap={1} style={{ paddingBottom: 10 }}>
                    {calendar_ui}
                    {time_ui}
                </Grid>
                {
                    isLoadingInit ? loading_triangle :
                        <Grid alignItems="center" justifyContent="center" style={{ paddingBottom: 20 }} >
                            {input_name}
                            {fieldAddmore}
                            {btn_action}
                        </Grid>
                }
            </div>
        );

    }


}


export default withParams(CreateOrder);