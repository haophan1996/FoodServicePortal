import React, { Component } from "react";
import { Button, TextField, Grid, Autocomplete } from "@mui/material/"
import { ThreeDots } from 'react-loader-spinner'
import 'fomantic-ui-css/semantic.min.css'; // Import Fomantic UI CSS
import 'fomantic-ui-css/semantic.min.js'; // Import Fomantic UI JavaScript
import 'fomantic-ui-css/semantic.css';
import axios from "axios";
import { getExtractCookie } from '../Auth/auth'

export class EditOrder extends Component {
    constructor(props) {
        super()
        this.calendarRef = React.createRef();
        this.cancelTokenSource = axios.CancelToken.source();
        this.state = {
            selectOreder: props.data,
            isModalLoading: false,
            initField: null,
            fields: [], //List add more item
            list_items: [], //All item with category
            list_itemid_selected: [], //Keep tracking if item select, so item in list will disblaed
        }
    }

    closeModal = (data, update) => { this.props.onClose(data, update) };

    async getListItem() {
        try {
            const csrft = await getExtractCookie(this.cancelTokenSource)
            const config = {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': ' application/json',
                    'X-CSRFToken': csrft
                }
            };
            const body = JSON.stringify(this.state.selectOreder.details);
            const res = await axios.post("/api/v1/getallitem", body, config)
            if (res.data.success) {
                this.setState({ list_items: res.data.success, list_itemid_selected: res.data.itemid })
            } else {
                console.log(res.data.error)
            }
        } catch (error) {
            console.log("Cannot fetch Get list Item", error)
        }
    }

    async postUpdateOrder() {
        try {
            const { selectOreder, fields } = this.state
            const csrft = await getExtractCookie(this.cancelTokenSource)
            const updateOrder = JSON.stringify(selectOreder);
            const addOrder = JSON.stringify(fields);
            const config = {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': ' application/json',
                    'X-CSRFToken': csrft
                }
            };

            const res = await axios.post('/api/v1/updateorder', { update: updateOrder, add: addOrder }, config)

            if (res.data.success) {
                const updated_order = res.data.success[0]
                this.closeModal(updated_order, true)
            } else {
                console.log(res.data.error)
            }
        } catch (err) {
            if (err.error)
                console.log(err.error)
        }
    }

    componentDidMount() {
        const { selectOreder } = this.state
        this.setState({ initField: { detailnote: "", detailquality: "", item_id: null, or_id: selectOreder.orid } })
        const $calendar = window.$('.ui.calendar').calendar({
            type: 'date',
            onChange: (date, text) => {
                const format_date = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
                this.onSelectOrderChange("ordate", format_date)
            }
        });
        $calendar.calendar('set date', this.state.selectOreder.ordate)
        document.body.style.overflow = 'hidden'; //Made order hidden overflow

        document.addEventListener("keydown", this.handleKeyPress);
    }

    componentWillUnmount() { 
        document.body.style.overflow = 'auto'; 
        document.removeEventListener("keydown", this.handleKeyPress); 
    }

    handleKeyPress = async (event) => {
        if (event.key === 'Enter'){
            this.saveOrder();
        } else if (event.key === 'Escape') {
            this.closeModal()
        }
    }

    saveOrder = async () => {
        await this.postUpdateOrder()
    }

    addFields = async () => {
        const { initField, list_items } = this.state
        if (list_items.length === 0) { await this.getListItem() }

        this.setState(prevState => ({
            fields: [...prevState.fields, initField]
        }));
    };

    onSelectOrderChange = (key, value) => {
        const updatedDetails = this.state.selectOreder;
        updatedDetails[key] = value
        this.setState({ selectOreder: updatedDetails })
    }

    onDetailOrderChange = (value, index, keyUpdate) => {
        const updatedDetails = [...this.state.selectOreder.details];
        updatedDetails[index] = { ...updatedDetails[index], [keyUpdate]: value }
        this.setState(prevState => ({
            selectOreder: {
                ...prevState.selectOreder,
                details: updatedDetails
            }
        }));
    }

    onFieldAddOrderChange = (value, index, keyUpdate) => {
        const updatedDetails = [...this.state.fields]
        updatedDetails[index] = { ...updatedDetails[index], [keyUpdate]: value }

        this.setState({ fields: updatedDetails })
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

    render() {
        const {
            selectOreder,
            isModalLoading,
            list_items,
            list_itemid_selected,
            fields,
            calendar } = this.state

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

        const calendar_ui = (<div className="ui big calendar" id="multimonth_calendar" ref={this.calendarRef} >
            <div className="ui input left icon">
                <i className="calendar icon"></i>
                <input type="text" placeholder="Date" />
            </div>
        </div>)

        const nameOrder = (
            <h4 className=" inline-block">
                Edit Order - <span className=" text-2xl">{selectOreder.cus_name}</span>
            </h4>
        )

        const CustomTextField = ({ id, fullWidth, className, label, style, value, onChange, type }) => (
            <TextField fullWidth={fullWidth}
                style={style}
                type={type === null ? 'text' : type}
                className={className}
                InputProps={{ style: { fontSize: 19 } }}
                id={id}
                label={label}
                variant="outlined"
                value={value}
                onChange={onChange} />
        );

        const detail_body = (selectOreder.details.map((key, index) => {
            if (key.or_id !== -1) {
                return (
                    <div key={key.detailid} className=" border-gray-300 border rounded-md mb-5">
                        <b className="ml-5">{key.cag_name} {key.item_name}</b>
                        <Button style={{ marginRight: 20 }} size="large" className=" p-0 m-0" id={String(key.detailid)} onClick={() => {
                            this.setDisabledItemSelected(key.item_id, null)
                            this.onDetailOrderChange(-1, index, "or_id")
                        }}>Remove</Button>
                        <Grid item container direction="row" alignItems="center" justifyContent="flex-start" xs={12} style={{ margin: 7 }}>

                            {CustomTextField({
                                id: String(key.detailid + index) + "Quanltiy",
                                label: 'Quanltiy',
                                style: { maxWidth: 100, marginRight: 5 },
                                type: 'number',
                                value: key.detailquality,
                                onChange: (e) => this.onDetailOrderChange(e.target.value, index, "detailquality")
                            })}

                            {CustomTextField({
                                id: String(key.detailid + index) + 'note',
                                className: "flex-grow",
                                label: 'Note',
                                style: { marginRight: 10 },
                                value: key.detailnote === null ? '' : key.detailnote,
                                onChange: (e) => this.onDetailOrderChange(e.target.value, index, "detailnote")
                            })}
                        </Grid>
                    </div>
                )
            }
            return null
        }))

        const button_action = (isModalLoading ? loading_triangle : (
            <Grid container direction="row" alignItems="center" justifyContent="space-between">
                <Button style={{ marginBottom: 10 }} onClick={() => { 
                    this.saveOrder()
                }} variant="outlined">Save</Button>
                <Button style={{ marginBottom: 10 }} variant="contained" onClick={this.addFields}>ADD MORE</Button>
                <Button style={{ marginBottom: 10 }} onClick={this.closeModal} variant="outlined" color="error">Close</Button>
            </Grid>)
        )

        const customAutoselect = ({ id, style, label, options, getOptionDisabled, getOptionLabel, groupBy, onChange }) => (
            <Autocomplete fullWidth disableClearable selectOnFocus disablePortal blurOnSelect
                style={style}
                id={id}
                onChange={onChange}
                getOptionDisabled={getOptionDisabled}
                options={options}
                groupBy={groupBy}
                getOptionLabel={getOptionLabel}
                renderInput={(params) => (
                    <TextField {...params}
                        label={label}
                        placeholder="type a few words"
                        InputProps={{ ...params.InputProps, type: 'search', }} />
                )} />
        )

        const fieldAddmore = fields.map((field, index) => (
            <div key={index} className=" border-gray-300 border rounded-md mb-5">
                <Grid item container direction="row" alignItems="center" justifyContent="flex-start" xs={12} style={{ margin: 7 }}>
                    {customAutoselect({
                        id: String(index) + '_select',
                        style: { maxWidth: 300, marginRight: 5 },
                        options: list_items,
                        label: "Select Item",
                        groupBy: (option) => option.cag_name,
                        getOptionLabel: (option) => (option ? option.itemname : ''),
                        getOptionDisabled: (option) => {
                            return list_itemid_selected.includes(option.itemid)
                        },
                        onChange: (e, value) => {
                            this.setDisabledItemSelected(field.item_id, value.itemid)
                            this.onFieldAddOrderChange(value.itemid || -1, index, "item_id")
                        }
                    })}
                    {CustomTextField({
                        id: String(index) + "_Quanltiy",
                        label: 'Quanltiy',
                        type: 'number',
                        style: { maxWidth: 100, marginRight: 5 },
                        value: field.detailquality,
                        onChange: (e) => this.onFieldAddOrderChange(e.target.value, index, "detailquality")
                    })}

                    {CustomTextField({
                        id: String(index) + '_note',
                        className: "flex-grow",
                        label: 'Note',
                        style: { marginRight: 10 },
                        value: field.detailnote === null ? '' : field.detailnote,
                        onChange: (e) => this.onFieldAddOrderChange(e.target.value, index, "detailnote")
                    })}
                </Grid>
            </div>
        ))

        return (<div className="fixed top-0 left-0 w-full h-full overflow-auto bg-white z-10">
            <div className="p-1 mt-5">
                <Grid container alignItems="center" justifyContent="center" >

                    <Grid item xs={12} sm={8} style={{ maxWidth: 800 }}>
                        <Grid style={{ marginBottom: 10 }} container direction="row" alignItems="center" justifyContent="space-between">
                            {nameOrder}
                            {calendar_ui}
                        </Grid>


                        {CustomTextField({
                            id: 'pickuptime',
                            fullWidth: true,
                            label: 'Pick Up Time',
                            style: { marginBottom: 10 },
                            value: selectOreder.orpickup,
                            onChange: (e) => this.onSelectOrderChange("orpickup", e.target.value)
                        })}
                        {detail_body}
                        {fieldAddmore}
                        {button_action}
                    </Grid>
                </Grid>
            </div>

        </div>
        )
    }
}


export default EditOrder;