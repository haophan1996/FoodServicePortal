import React, { Component } from "react";
import { ThreeDots } from 'react-loader-spinner'
import 'fomantic-ui-css/semantic.min.css'; // Import Fomantic UI CSS
import 'fomantic-ui-css/semantic.min.js'; // Import Fomantic UI JavaScript
import 'fomantic-ui-css/semantic.css';
import axios from "axios";
import { useParams } from 'react-router-dom';
import { TextField, Grid, Button, InputLabel, Chip, Menu, MenuItem, Select, FormControl, Backdrop, Autocomplete, Checkbox } from "@mui/material/"
import { CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon, CheckBox as CheckBoxIcon } from '@mui/icons-material';
import { getExtractCookie } from '../Auth/auth';
import {
    TableRow,
    TableHeaderCell,
    TableHeader,
    TableCell,
    TableBody,
    Table,
    Label
} from 'semantic-ui-react'
import { Grow } from '@mui/material';

function withParams(Component) {
    return (props) => <Component {...props} params={useParams()} />;
}

export class CreateItem extends Component {
    constructor(props) {
        super(props)
        this.cancelTokenSource = axios.CancelToken.source();
        this.state = {
            isLoadingBody: true,
            list_category: [],
            list_topping: [],
            list_item: [],
            isMenuChipOpen: false,
            isBackDropOpen: false,
            isBackDropCreate: false,
            element_category: { cagname: '' },
            element_item: { itemname: '', itemprice: '', cag_id: null },
            element_topping: { top_name: '', topprice: '', cag_id: null },
            anchorElChip: { target: null, type: null, index: null, element: null, topping_filter: null },
        }
    }

    getFocusName = () => {
        setTimeout(() => {
            document.getElementById('edit_item_name')?.focus()
        }, 300);
    }

    onpenCreateCategory = () => {
        this.setState({ isBackDropCreate: true, anchorElChip: { target: null, type: "create_category", index: null, element: this.state.element_category, topping_filter: null } }, () => this.getFocusName());
    }

    onpenCreateTopping = () => {
        this.setState({ isBackDropCreate: true, anchorElChip: { target: null, type: "create_topping", index: null, element: this.state.element_topping, topping_filter: null } }, () => this.getFocusName());
    }

    onpenCreateItem = () => {
        this.setState({ isBackDropCreate: true, anchorElChip: { target: null, type: "create_item", index: null, element: this.state.element_item, topping_filter: null } }, () => this.getFocusName());
    }

    async componentDidMount() {
        await this.fetch_category();
        await this.fetch_item();
        await this.fetch_topping();
        document.addEventListener('keydown', this.handleKeyDown);
        this.setState({ isLoadingBody: false })
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleKeyDown);
    }

    handleKeyDown = async (event) => {
        const { isBackDropOpen, isBackDropCreate, isLoadingBody } = this.state
        if (isLoadingBody) return

        if (event.key === 'Escape') {
            if (isBackDropOpen || isBackDropCreate) {
                this.setState({ isBackDropOpen: false, isBackDropCreate: false })
            }
        } else if (event.key === 'Enter') {
            if (isBackDropOpen || isBackDropCreate) {
                await this.handleSubmitItems()
            }
        } else {
            return
        }

    }

    async handleSubmitItems() {
        this.setState({ isLoadingBody: true })
        const { anchorElChip, isBackDropOpen } = this.state
        const link = anchorElChip?.type.split('_')[1]

        try {
            const updateOrder = JSON.stringify(anchorElChip?.element);
            const csrft = await getExtractCookie(this.cancelTokenSource)
            const config = {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrft
                }
            };

            const res = await axios.post(`/api/v1/update${link}`, updateOrder, config)
            if (res.data.sucessdelete) {
                if (anchorElChip?.type.includes('category')) {
                    this.setState(({ list_category }) => {
                        const id = -anchorElChip?.element.cagid
                        const updatedList = list_category.filter(item => item.cagid !== id);
                        return { list_category: updatedList };
                    });

                }
            } else if (res.data.success) {
                if (anchorElChip?.type.includes('category')) {
                    if (anchorElChip?.index === null) {
                        this.setState(preState => ({
                            list_category: [...preState.list_category, res.data.success]
                        }))
                        this.handleEditChipAction(anchorElChip, '', 'cagname')
                    } else {
                        const updateObject = [...this.state.list_category]
                        updateObject[anchorElChip.index] = res.data.success
                        this.setState({ list_category: updateObject })
                    }
                } else if (anchorElChip?.type.includes('item')) {
                    if (anchorElChip?.index === null) {
                        const updateItem = { ...this.state.anchorElChip?.element }
                        updateItem.itemname = ''
                        updateItem.itemprice = 0
                        this.setState(preState => ({
                            list_item: [...preState.list_item, res.data.success],
                            anchorElChip: { ...this.state.anchorElChip, element: updateItem }
                        }))
                    } else {
                        const updateObject = [...this.state.list_item]
                        updateObject[anchorElChip.index] = res.data.success
                        this.setState({ list_item: updateObject })
                    }
                } else if (anchorElChip?.type.includes('topping')) {
                    if (anchorElChip?.index === null) {
                        const updateTopping = { ...this.state.anchorElChip?.element }
                        updateTopping.top_name = ''
                        updateTopping.topprice = ''
                        console.log(updateTopping)
                        this.setState(preState => ({
                            list_topping: [...preState.list_topping, res.data.success],
                            anchorElChip: { ...this.state.anchorElChip, element: updateTopping }
                        })) 
                    } else {
                        const updateObject = [...this.state.list_topping]
                        updateObject[anchorElChip.index] = res.data.success
                        this.setState({ list_topping: updateObject })
                    }
                }
            } else {
                alert(res.data.error)
                console.log(res.data.error)
            }
        } catch (err) {
            console.log("Cannot post Update", err)
        }

        if (isBackDropOpen) {
            this.setState({ isBackDropOpen: !isBackDropOpen })
        } else {
            this.getFocusName()
        }
        this.setState({ isLoadingBody: false })
    }

    async handleEditChipAction(data, value, key) {
        if (value !== undefined) {
            const updateTopping = { ...data?.element }
            updateTopping[key] = value
            this.setState({
                anchorElChip: {
                    ...data,
                    element: updateTopping
                }
            });
        }

    }


    async fetch_category() {
        try {
            const res = await axios.get("api/v1/getallcategory")
            if (res.data.success) {
                this.setState({
                    list_category: res.data.success,
                })
            } else {
                console.log(res.data.error)
            }
        } catch (error) {
            console.log("Cannot fetch Categories", error)
        }

        // this.setState({
        //     list_category: [
        //         {
        //             "cagid": 1,
        //             "cagname": "bltm"
        //         },
        //         {
        //             "cagid": 3,
        //             "cagname": "suachua"
        //         },
        //         {
        //             "cagid": 5,
        //             "cagname": "banh"
        //         },
        //         {
        //             "cagid": 4,
        //             "cagname": "tra"
        //         },
        //         {
        //             "cagid": 2,
        //             "cagname": "trasua"
        //         }
        //     ]
        // })
    }

    async fetch_item() {
        try {
            const res = await axios.get("api/v1/getallitem")
            if (res.data.success) {
                this.setState({
                    list_item: res.data.success,
                })
            } else {
                console.log(res.data.error)
            }
        } catch (error) {
            console.log("Cannot fetch Items", error)
        }
        // this.setState({
        //     list_item: [
        //         {
        //             "itemid": 19,
        //             "cag_name": "banh",
        //             "cag_id": 5,
        //             "itemname": "flan",
        //             "itemprice": "16.00",
        //             "itemnote": null
        //         },
        //         {
        //             "itemid": 3,
        //             "cag_name": "bltm",
        //             "cag_id": 1,
        //             "itemname": "10 in",
        //             "itemprice": "42.00",
        //             "itemnote": null
        //         },
        //         {
        //             "itemid": 4,
        //             "cag_name": "bltm",
        //             "cag_id": 1,
        //             "itemname": "10 in KSA",
        //             "itemprice": "45.00",
        //             "itemnote": null
        //         },
        //         {
        //             "itemid": 9,
        //             "cag_name": "bltm",
        //             "cag_id": 1,
        //             "itemname": "12 cupcakes",
        //             "itemprice": "28.00",
        //             "itemnote": null
        //         },
        //         {
        //             "itemid": 10,
        //             "cag_name": "bltm",
        //             "cag_id": 1,
        //             "itemname": "12 cupcakes KSA",
        //             "itemprice": "30.00",
        //             "itemnote": null
        //         },
        //         {
        //             "itemid": 5,
        //             "cag_name": "bltm",
        //             "cag_id": 1,
        //             "itemname": "12 in",
        //             "itemprice": "65.00",
        //             "itemnote": null
        //         },
        //         {
        //             "itemid": 6,
        //             "cag_name": "bltm",
        //             "cag_id": 1,
        //             "itemname": "12 in KSA",
        //             "itemprice": "70.00",
        //             "itemnote": null
        //         },
        //         {
        //             "itemid": 7,
        //             "cag_name": "bltm",
        //             "cag_id": 1,
        //             "itemname": "6 cupcakes",
        //             "itemprice": "14.00",
        //             "itemnote": null
        //         },
        //         {
        //             "itemid": 8,
        //             "cag_name": "bltm",
        //             "cag_id": 1,
        //             "itemname": "6 cupcakes KSA",
        //             "itemprice": "15.00",
        //             "itemnote": null
        //         },
        //         {
        //             "itemid": 1,
        //             "cag_name": "bltm",
        //             "cag_id": 1,
        //             "itemname": "8 in",
        //             "itemprice": "32.00",
        //             "itemnote": null
        //         },
        //         {
        //             "itemid": 2,
        //             "cag_name": "bltm",
        //             "cag_id": 1,
        //             "itemname": "8 in KSA",
        //             "itemprice": "35.00",
        //             "itemnote": null
        //         },
        //         {
        //             "itemid": 11,
        //             "cag_name": "bltm",
        //             "cag_id": 1,
        //             "itemname": "togo",
        //             "itemprice": "16.00",
        //             "itemnote": null
        //         },
        //         {
        //             "itemid": 12,
        //             "cag_name": "bltm",
        //             "cag_id": 1,
        //             "itemname": "togo KSA",
        //             "itemprice": "18.00",
        //             "itemnote": null
        //         },
        //         {
        //             "itemid": 17,
        //             "cag_name": "suachua",
        //             "cag_id": 3,
        //             "itemname": "nếp cẩm",
        //             "itemprice": "6.00",
        //             "itemnote": null
        //         },
        //         {
        //             "itemid": 16,
        //             "cag_name": "suachua",
        //             "cag_id": 3,
        //             "itemname": "uống",
        //             "itemprice": "6.00",
        //             "itemnote": null
        //         },
        //         {
        //             "itemid": 18,
        //             "cag_name": "tra",
        //             "cag_id": 4,
        //             "itemname": "trà nhãn",
        //             "itemprice": "7.00",
        //             "itemnote": null
        //         },
        //         {
        //             "itemid": 14,
        //             "cag_name": "trasua",
        //             "cag_id": 2,
        //             "itemname": "hồng lài",
        //             "itemprice": "6.00",
        //             "itemnote": null
        //         },
        //         {
        //             "itemid": 15,
        //             "cag_name": "trasua",
        //             "cag_id": 2,
        //             "itemname": "olong lài",
        //             "itemprice": "6.00",
        //             "itemnote": null
        //         },
        //         {
        //             "itemid": 13,
        //             "cag_name": "trasua",
        //             "cag_id": 2,
        //             "itemname": "thái xanh",
        //             "itemprice": "6.00",
        //             "itemnote": null
        //         }
        //     ]
        // })
    }

    async fetch_topping() {
        try {
            const res = await axios.get("api/v1/getalltoppingwithoutsub")
            if (res.data.success) {
                this.setState({
                    list_topping: res.data.success,
                })
            } else {
                console.log(res.data.error)
            }
        } catch (error) {
            console.log("Cannot fetch Toppings", error)
        }

        // this.setState({
        //     list_topping: [
        //         {
        //             "top_id": 1,
        //             "cag_name": "bltm",
        //             "cag_id": 1,
        //             "top_name": "lap xuong",
        //             "topprice": "5.00",
        //             "topquality": 1
        //         },
        //         {
        //             "top_id": 2,
        //             "cag_name": "trasua",
        //             "cag_id": 2,
        //             "top_name": "banh flan",
        //             "topprice": "1.00",
        //             "topquality": 1
        //         },
        //         {
        //             "top_id": 3,
        //             "cag_name": "trasua",
        //             "cag_id": 2,
        //             "top_name": "pho mai jelly",
        //             "topprice": "1.00",
        //             "topquality": 1
        //         }
        //     ]
        // })
    }

    render() {
        const {
            isLoadingBody,
            list_category,
            list_topping,
            list_item,
            isMenuChipOpen,
            isBackDropOpen,
            anchorElChip,
            isBackDropCreate,
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

        const menuItem = (
            <Menu
                id="long-menu"
                MenuListProps={{
                    'aria-labelledby': 'long-button',
                }}
                anchorEl={anchorElChip.target}
                open={isMenuChipOpen}
                onClose={() => this.setState({ isMenuChipOpen: false })}
                slotProps={{ paper: { style: { maxHeight: 48 * 4.5, width: '20ch' } } }}
            >
                <MenuItem
                    key={1}
                    onClick={() => {
                        this.setState({ isBackDropOpen: true, isMenuChipOpen: false }, () => this.getFocusName())
                    }} >
                    Edit Item
                </MenuItem>
                <MenuItem
                    key={2}
                    onClick={async () => {
                        this.setState({ isMenuChipOpen: false, isLoadingBody: true })
                        const id = anchorElChip?.type?.includes('category') ? anchorElChip?.element?.cagid :
                            anchorElChip?.type?.includes('item') ? anchorElChip?.element?.itemid :
                                anchorElChip?.element?.top_id
                        await this.handleEditChipAction(anchorElChip, -id, anchorElChip?.type?.includes('category') ? 'cagid' :
                            anchorElChip?.type?.includes('item') ? 'itemid' : 'top_id')
                        await this.handleSubmitItems()
                    }} >
                    Delete
                </MenuItem>
                {/* {anchorElChip?.type !== 'list_topping' ? '' :
                    <MenuItem
                        key={3}
                        onClick={async () => { 
                            const e = list_topping.filter(item => item.top_name === anchorElChip.element.top_name && item.top_id) 
                            const topping_filter = list_category.filter(option => !e?.some(filterItem => filterItem.cag_name === option.cagname)) 
                            this.setState({
                                anchorElChip: { ...anchorElChip, topping_filter: topping_filter }
                            }) 
                        }} >
                        Add more category
                    </MenuItem>} */}
            </Menu>)


        const ui_cagtegory = (<>
            <Table unstackable sortable celled size="large">
                <TableHeader><TableRow>
                    <TableHeaderCell style={{ backgroundColor: '#f2f2f2' }}>Categories</TableHeaderCell>
                    <TableHeaderCell style={{ backgroundColor: '#f2f2f2' }}>Items / {<span className="text-[#3B74CC]">Toppings</span>}</TableHeaderCell>
                </TableRow></TableHeader>

                <TableBody >
                    {list_category.map((cag, index) => (
                        <TableRow key={cag.cagid + 'cag'} >
                            <TableCell onClick={(event) => {
                                this.setState({ anchorElChip: { target: event.target, type: "list_category", index: index, element: cag }, isMenuChipOpen: true });
                            }}>
                                {cag.cagname}
                            </TableCell>
                            <TableCell >
                                {list_item.map((item, index) => {
                                    if (item.cag_id === cag.cagid)
                                        return <span key={index + '_' + item.itemid + '_item'}>
                                            <Chip
                                                label={item.itemname + ' - $' + item.itemprice}
                                                size="large"
                                                // color="success" 
                                                style={{ margin: 5, fontWeight: "bold", fontSize: "15px", padding: 0, backgroundColor: 'black', color: 'white' }}
                                                onClick={(event) => {
                                                    this.setState({ anchorElChip: { target: event.target, type: "list_item", index: index, element: item }, isMenuChipOpen: true });
                                                }}
                                            />
                                        </span>
                                    else return null
                                })}
                                <br />
                                {
                                    list_topping.map((topping, index) => {
                                        if (topping.cag_id === cag.cagid)
                                            return <span key={topping.top_id + '_topping'}>
                                                <Chip
                                                    label={topping.top_name + ' - $' + topping.topprice}
                                                    size="large"
                                                    color="primary"
                                                    style={{
                                                        margin: 5,
                                                        fontWeight: "bold",
                                                        fontSize: "18px",
                                                    }}
                                                    onClick={(event) => {
                                                        this.setState({ anchorElChip: { target: event.target, type: "list_topping", index: index, element: topping }, isMenuChipOpen: true });
                                                    }}
                                                />
                                            </span>
                                        else return null
                                    })
                                }
                            </TableCell>

                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </>)

        // const test_topping_cag = (<Autocomplete
        //     multiple
        //     id="checkboxes-tags-demo"
        //     options={anchorElChip?.topping_filter ?? []}
        //     disableCloseOnSelect
        //     value={[]}
        //     getOptionLabel={(option) => option?.cagname ?? option?.cag_name ?? 'Empty'}
        //     renderOption={(props, option, { selected }) => (
        //         <li {...props}>
        //             <Checkbox
        //                 icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
        //                 checkedIcon={<CheckBoxIcon fontSize="small" />}
        //                 style={{ marginRight: 8 }}
        //                 checked={selected}
        //             />
        //             {option?.cagname ?? 'Empty'}
        //         </li>
        //     )}
        //     renderInput={(params) => (
        //         <TextField {...params} label="Categories" placeholder="Favorites" />
        //     )}
        //     ChipProps={{
        //         style: {
        //             fontSize: '16px', // Adjust the font size to increase chip size
        //             height: '40px', // Adjust the height to increase chip size
        //             borderRadius: '20px', // Adjust the border radius for a rounded appearance
        //         },
        //     }}
        // />)

        const edit_items = (
            <Grid item container xs={9} gap={5} justifyContent='center'>
                {anchorElChip?.type === 'list_category' || anchorElChip?.type === 'create_category' ? '' :
                    <FormControl sx={{ minWidth: 150 }}>
                        <InputLabel htmlFor="grouped-native-select">Cagtegory</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={anchorElChip?.element?.cag_id ?? ''}
                            label="Cagtegory"
                            onChange={(event) => this.handleEditChipAction(anchorElChip, event.target.value, 'cag_id')}>
                            {list_category.map((cag) => {
                                return <MenuItem key={cag.cagid} value={cag.cagid}>{cag.cagname}</MenuItem>
                            })}
                        </Select>
                    </FormControl>}

                <TextField
                    InputProps={{ style: { fontSize: 14, fontWeight: "bold" } }}
                    id="edit_item_name"
                    label="Name"
                    variant="outlined"
                    autoFocus
                    value={anchorElChip?.type === 'list_topping' ? (anchorElChip?.element?.top_name ?? 'Empty') :
                        anchorElChip?.type === 'list_item' ? (anchorElChip?.element?.itemname ?? 'Empty') :
                            anchorElChip?.type === 'list_category' ? (anchorElChip?.element?.cagname ?? 'Empty') :
                                anchorElChip?.type === 'create_category' ? (anchorElChip?.element?.cagname ?? 'Empty') :
                                    anchorElChip?.type === 'create_item' ? (anchorElChip?.element?.itemname ?? 'Empty') :
                                        (anchorElChip?.element?.top_name ?? 'Empty')}
                    onChange={(event) => {
                        this.handleEditChipAction(anchorElChip, event.target.value,
                            (anchorElChip?.type === 'list_topping' || anchorElChip?.type === 'create_topping') ? 'top_name' :
                                (anchorElChip?.type === 'list_item' || anchorElChip?.type === 'create_item') ? 'itemname' :
                                    'cagname'
                        )
                    }} />

                {(anchorElChip?.type === 'list_category' || anchorElChip?.type === 'create_category') ? '' :
                    <TextField
                        InputProps={{
                            style: { fontSize: 14, fontWeight: "bold" },
                            inputProps: { type: 'number', min: 0, step: 1.00 }
                        }}
                        id="edit_item"
                        label="Price"
                        variant="outlined"
                        value={anchorElChip?.type === 'list_topping' ? (anchorElChip?.element?.topprice ?? 0) :
                            anchorElChip?.type === 'list_item' ? (anchorElChip?.element?.itemprice ?? 0) :
                                anchorElChip?.type === 'create_item' ? (anchorElChip?.element?.itemprice ?? 0) :
                                    (anchorElChip?.element?.topprice ?? 0)}
                        onChange={(event) => {
                            this.handleEditChipAction(anchorElChip, event.target.value, anchorElChip?.type.includes('topping') ? 'topprice' : 'itemprice')
                        }}
                    />}
            </Grid>)

        const btn_save_items = (<Grid item container alignItems='center' justifyContent='center'>
            {/* {anchorElChip?.type === 'list_topping' ? <Button onClick={(event) => this.handleSubmitItems()}>Update names {'(enter)'}</Button> : ''} */}
            <Button onClick={(event) => this.handleSubmitItems()}>Save {'(enter)'}</Button>
            <Button onClick={(event) => this.setState({ isBackDropOpen: false, isBackDropCreate: false })}>Close {'(esc)'}</Button>
        </Grid>)

        const edit_items_components = (<>
            <Backdrop open={isBackDropOpen}>
                <div className="bg-white p-4 z-10 ml-3 mr-3 border rounded-lg">
                    {!isBackDropOpen ? "" :
                        <Grid item container direction='column' xs={12} justifyContent='center' alignItems='center' gap={5}>
                            {anchorElChip?.type !== null ? edit_items : ''}
                            {/* {anchorElChip?.type !== 'list_topping' ? '' :
                                <span>{anchorElChip.topping_filter?.map((item) => {
                                    return <span className="border rounded-lg p-1 ml-2 mr-2">{item.cag_name} </span>
                                })}</span>
                            } */}
                            {anchorElChip?.type !== null ? btn_save_items : ''}
                        </Grid>}
                </div>
            </Backdrop>
        </>)

        const btn_create = (<Label>
            <h3>Create</h3>
            <Button size="large" variant={anchorElChip?.type === 'create_category' ? "outlined" : 'text'} onClick={this.onpenCreateCategory}>Cagtegory</Button>
            <Button size="large" variant={anchorElChip?.type === 'create_item' ? "outlined" : 'text'} onClick={this.onpenCreateItem}>Item</Button>
            <Button size="large" variant={anchorElChip?.type === 'create_topping' ? "outlined" : 'text'} onClick={this.onpenCreateTopping}>Topping</Button>
        </Label>)

        const create_items_components = (<Backdrop open={isBackDropCreate} TransitionComponent={Grow} transitionDuration={100}>
            <div className="bg-white p-4 z-10 ml-3 mr-3 border rounded-lg">
                <Grid item container direction='column' xs={12} justifyContent='center' gap={5}>
                    {anchorElChip?.type?.includes('category') ? 'Create Category' : anchorElChip?.type?.includes('item') ? 'Create Item' : 'Create Topping'}
                    {anchorElChip?.type !== null ? edit_items : ''}
                    {anchorElChip?.type !== null ? btn_save_items : ''}
                </Grid>
            </div>
        </Backdrop>)

        const isSetLoading = (<Backdrop open={isLoadingBody}>
            {loading_triangle}
        </Backdrop>)

        return (
            <div className="animate-fade-in ">
                <h1 className=''>Create Item</h1>
                {/* {test_topping_cag} */}
                {btn_create}
                <div className='mt-10'>
                    {ui_cagtegory}
                </div>
                {edit_items_components}
                {create_items_components}
                {menuItem}
                {isSetLoading}
            </div>
        )
    }


}


export default withParams(CreateItem);