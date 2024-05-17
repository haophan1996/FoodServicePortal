import React, { Component } from 'react'
import Grid from '@mui/material/Grid';
import { Button, Box, Card, Select, MenuItem, InputLabel, FormControl, CardContent, Typography } from "@mui/material/"
import { East as EastIcon, West as WestIcon, AttachMoney as AttachMoneyIcon } from '@mui/icons-material';
import { ThreeDots } from 'react-loader-spinner'

import {
  TableRow,
  TableHeaderCell,
  TableHeader,
  TableFooter,
  TableCell,
  TableBody,
  Table,
} from 'semantic-ui-react'
import axios from 'axios';


export class DashBoard extends Component {

  constructor(props) {
    super()
    this.state = {
      listoption: [],
      selectedOption: "",
      selectedOptionIndex: 0,
      total_money_value: 0.00,
      detail_sale_items: [],
      columnSortOrders: [],
      isLoadingDate: true,
      isLoadingBody: true,
      isEmptyDataBase: false,
      openSnackbar: false
    }
  }

  componentDidMount() {
    this.setState({}, async () => {
      await this.getlistdateorder()
      this.isLoadingDate = false; //done loading
    })
  }


  handleOptionChange = async (value) => {
    this.setState({
      isLoadingBody: true, // set loading body state to TRUE
      selectedOption: value
    }, async () => {
      const date = this.state.listoption[value].date
      await this.get_total_price(date)
      await this.get_total_detail(date)
      this.setState({ isLoadingBody: false })
    })
  }

  handleOnClickBackOption = () => {
    const { selectedOption } = this.state
    this.handleOptionChange(selectedOption > 0 ? (selectedOption - 1) : 0)
  }

  handleOnClickForwardOption = () => {
    const { selectedOption, listoption } = this.state
    this.handleOptionChange(selectedOption < (listoption.length - 1) ? selectedOption + 1 : (listoption.length - 1))
  }
  // End 

  handleSort = (column) => {
    const { detail_sale_items, columnSortOrders } = this.state;
    const sortOrder = columnSortOrders[column] === 'ascending' ? 'descending' : 'ascending';

    const sortedItems = [...detail_sale_items].sort((a, b) => {
      const valueA = typeof a[column] === 'string' ? a[column].toLowerCase() : a[column];
      const valueB = typeof b[column] === 'string' ? b[column].toLowerCase() : b[column];
      if (valueA < valueB) return sortOrder === 'ascending' ? -1 : 1;
      if (valueA > valueB) return sortOrder === 'ascending' ? 1 : -1;
      return 0;
    });

    this.setState(prevState => ({
      detail_sale_items: sortedItems,
      columnSortOrders: {
        ...prevState.columnSortOrders,
        [column]: sortOrder
      }
    }));
  };

  // Call api
  async getlistdateorder() {
    try {
      const res = await axios.get('/api/v1/getlistdateorder')
      if (res.data.empty) {
        this.setState({ isLoadingBody: false, isLoadingDate: false, isEmptyDataBase: true })
      }
      if (res.data.success) {
        this.setState({
          listoption: res.data.success,
          isLoadingDate: false
        }, async () => {
          this.setState({ selectedOption: res.data.show_index })
          await this.get_total_detail(res.data.show_date)
          await this.get_total_price(res.data.show_date)
          this.setState({ isLoadingBody: false })
        })

      }

    } catch (err) {
      if (err.response.data.detail) {
        console.log(err.response.data.detail, 'Could not confirm your account, please loggin')
      } else {
        console.log(err.response.data)
      }
    }
  }

  async get_total_detail(date) {
    try {
      const res = await axios(`/api/v1/gettotaldetail/${date}`)
      if (res.data.success) {
        this.setState({ detail_sale_items: res.data.success })
      }
    } catch (err) {

    }
  }

  async get_total_price(date) {
    try {
      const res = await axios(`/api/v1/gettotalpricebydate/${date}`)
      if (res.data.success) {
        this.setState({ total_money_value: res.data.success.total_price })
      }
    } catch (err) {

    }
  }


  render() {
    const {
      listoption,
      selectedOption,
      total_money_value,
      detail_sale_items,
      columnSortOrders,
      isLoadingDate,
      isLoadingBody,
      isEmptyDataBase,
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
      <Grid container justifyContent="center" alignItems={'center'} direction='row'>
        <Box pr={1}>
          <Button disabled={this.state.isLoadingBody || selectedOption === 0} onClick={this.handleOnClickBackOption} variant="outlined"><WestIcon fontSize='medium' /></Button>
        </Box>
        <Grid item xs={7} sm={6} md={5} lg={4}>
          <FormControl sx={{ width: '100%' }}>
            <InputLabel id="demo-simple-select-error-label">Date</InputLabel>
            <Select
              style={{ fontSize: '17px' }}
              fullWidth
              value={selectedOption}
              label="Date"
              onChange={(e) => this.handleOptionChange(e.target.value)}>
              {listoption.map((ls, index) => (<MenuItem style={{ fontSize: '17px' }} key={index} value={index}>{ls.format_date}</MenuItem>))}
            </Select>
          </FormControl>
        </Grid>
        <Box pl={1}>
          <Button disabled={selectedOption === listoption.length - 1 ? true : this.state.isLoadingBody} onClick={this.handleOnClickForwardOption} variant="outlined"><EastIcon fontSize='medium' /></Button>
        </Box>
      </Grid>
    </>)

    const card_money = (<Grid item>
      <Card sx={{ minWidth: 335 }}>
        <CardContent>
          <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
            Total
          </Typography>
          <Typography variant="h4" component="div">
            <AttachMoneyIcon className=' text-green-900 -mt-1' fontSize='Large' />{total_money_value.toFixed(2)}
          </Typography>
        </CardContent>
      </Card>
    </Grid>)

    const table_detail = (<Grid item >
      <Card className='ml-1' sx={{ maxWidth: 700 }}>
        <Table unstackable sortable celled size='large'>
          <TableHeader>
            <TableRow>
              <TableHeaderCell
                style={{ backgroundColor: '#f2f2f2' }}
                sorted={columnSortOrders['item_name']}
                onClick={() => this.handleSort('item_name')}>Name</TableHeaderCell>
              <TableHeaderCell
                style={{ backgroundColor: '#f2f2f2' }}
                sorted={columnSortOrders['total_quality']}
                onClick={() => this.handleSort('total_quality')}>Total Order</TableHeaderCell>
              <TableHeaderCell
                style={{ backgroundColor: '#f2f2f2' }}
                sorted={columnSortOrders['total_customers']}
                onClick={() => this.handleSort('total_customers')}>Customer</TableHeaderCell>
            </TableRow>
          </TableHeader>

          <TableBody>
            {detail_sale_items.map((it, index) => (
              <TableRow key={index}>
                <TableCell>{it?.type === 'topping' ? "Topping" : ''} {it.category_name} {it.name} <p className=' font-semibold'>{"$"}{it.firm_price}</p></TableCell>
                <TableCell>{it?.total_quality}</TableCell>
                <TableCell>{it.total_customers}</TableCell>
              </TableRow>
            ))}

          </TableBody>

          <TableFooter>
            <TableRow>
              <TableHeaderCell><b>Total:</b></TableHeaderCell>
              <TableHeaderCell style={{ color: 'blue' }}>{detail_sale_items.length === 0 ? 0 :
                detail_sale_items.reduce(
                  (sum, item) => {
                    const totalQuality = isNaN(item.total_quality) ? 0 : item.total_quality;
                    return sum + totalQuality;
                  }, 0)} </TableHeaderCell>
              <TableHeaderCell > 
              </TableHeaderCell>

            </TableRow>
          </TableFooter>
        </Table>
      </Card>
    </Grid >)

    const body = (<Grid className='p-5' container justifyContent="center" alignItems={'flex-start'} direction='row' spacing={1}>
      {card_money}
      {table_detail}
    </Grid>)

    return (
      <>
        <h1 className=''>DashBoard</h1>
        <div className='mt-10'>
          {isEmptyDataBase === true ? <h2 className='flex align-middle justify-center'>I dont see any orders in database, please go to Order and create one</h2> :
            <Grid container spacing={1}>
              {isLoadingDate === true ? loading_triangle : selectDate}
              {isLoadingBody === true ? loading_triangle : body}
            </Grid>}
        </div>
      </>
    )
  }
}

export default DashBoard