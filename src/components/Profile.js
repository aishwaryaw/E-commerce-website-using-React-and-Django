import React, { useState, useEffect } from 'react'
import {Menu, Container, Grid, Dimmer, Loader, Image, Message, Header, Segment, Card, Button, Label, Form, Checkbox, Select, Divider, Table} from 'semantic-ui-react';
import {connect} from 'react-redux';
import { Redirect } from 'react-router-dom';
import { authAxios } from '../utils';
import { addressListURL, countriesURL, addressDeleteURL, userIdURL ,addressCreateURL, addressUpdateURL , paymentListURL, orderListURL } from '../constants';

const CREATE_FORM = "CREATE_FORM";
const UPDATE_FORM = "UPDATE_FORM";

const PaymentList = () => {
    const [error, setError] = useState('');
    const [loading , setLoading] = useState(false);
    const [payments, setPayments] = useState([]);

    useEffect(()=>{
        fetchPayments();
    }, [])

    const fetchPayments = () => {
        setLoading(true);
        authAxios.get(paymentListURL).then(res => {
            setLoading(false);
            setPayments(res.data);
        }).catch(error =>{
            setLoading(false);
            setError(error);
        })
    }

    return (
        <Table celled>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>ID</Table.HeaderCell>
                    <Table.HeaderCell>Amount</Table.HeaderCell>
                    <Table.HeaderCell>Date</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {payments.length > 0 ? payments.map(p=>(
                    <Table.Row key={p.id}>
                        <Table.Cell>{p.id}</Table.Cell>
                        <Table.Cell>{p.amount}</Table.Cell>
                        <Table.Cell>{new Date(p.timestamp).toUTCString()}</Table.Cell>
                    </Table.Row>
                )) : <Table.Row>No payment history found</Table.Row>}
            </Table.Body>
        </Table>
    )
}

const OrderHistory = () => {
    const [error, setError] = useState('');
    const [loading , setLoading] = useState(false);
    const [orders, setOrders] = useState([]);

    useEffect(()=>{
        fetchOrders();
    }, [])

    const fetchOrders = () => {
        setLoading(true);
        authAxios.get(orderListURL).then(res => {
            setLoading(false);
            setOrders(res.data);
        }).catch(error =>{
            setLoading(false);
            setError(error);
        })
    }

    const renderOrderDesc = (order_items) => {
        let desc = "";
        order_items.forEach(order_item => {
            desc += `${order_item.item.title} X ${order_item.quantity} => ${order_item.final_price}, `;
        })
        return desc;
    }

    return (
        <Table celled>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>ID</Table.HeaderCell>
                    <Table.HeaderCell>Order description</Table.HeaderCell>
                    <Table.HeaderCell>Date</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {orders.length > 0 ? orders.map(o=>(
                    <Table.Row key={o.id}>
                        <Table.Cell>{o.coupon && (<Label color="green" ribbon>Coupon applied of ${o.coupon.amount}</Label> )}
                        <p>{o.id}</p>
                        </Table.Cell>
                        <Table.Cell>{renderOrderDesc(o.order_items)}</Table.Cell>
                        <Table.Cell>{new Date(o.ordered_date).toUTCString()}</Table.Cell>
                    </Table.Row>
                )) : <Table.Row>No order history found</Table.Row>}
            </Table.Body>
        </Table>
    )
}

const AddressForm = (props) => {
    const [error, setError] = useState(null);
    const {countries, activeItem, address, user_id, form_type, callback } = props;
    const [success, setSuccess] = useState(false);
    const [saving , setSaving ] = useState(false);

    const [formData, setFormData] = useState({
        id : "",
        address_type : "",
        street_address : "",
        apartment_address : "",
        country : "",
        zip : "",
        default : false,
        userId : 1
    });

    useEffect(()=> {
        if(form_type == UPDATE_FORM){
            setFormData(address);
        }
    },[])

    const handleSubmit = (e) => {
        e.preventDefault();
        if(form_type == CREATE_FORM){
            handleCreateAddress();
        }
        else if(form_type == UPDATE_FORM){
            handleUpdateAddress();
        }
    }

    const handleSelectChange = (e, {name, value}) => {
        setFormData(prevState => ({
            ...prevState,
            [name] : value
        }));
    }

    const handleToggleDefault = (e) => {
        const value = e.target.value;
        setFormData(prevState => ({
            ...prevState,
            default : !formData.default
        }))
    }
    const handleChange = (e)=>{
        const name = e.target.name;
        const value = e.target.value;
        setFormData(prevState => (
            {
                ...prevState,
                [name] : value
            }
        ))
    }

    const handleCreateAddress = () => {
        setSaving(true);
        authAxios.post(addressCreateURL, {
            ...formData,
            user : user_id,
            address_type : activeItem == "billingAddress" ? "B" : "S"
        }).then(res => {
            setFormData({
                id : "",
                address_type : "",
                street_address : "",
                apartment_address : "",
                country : "",
                zip : "",
                default : false,
                userId : 1
            });
            setSaving(false);
            setSuccess(true);
            callback();
        }).catch(error=>{
            setError(error.response.data.message);
        })
    }

    const handleUpdateAddress = () => {
        setSaving(true);
        authAxios.put(addressUpdateURL(formData.id), {
            ...formData,
            user : user_id,
            address_type : activeItem == "billingAddress" ? "B" : "S"
         }).then(res=>{
            // setFormData({
            //     id : "",
            //     address_type : "",
            //     street_address : "",
            //     apartment_address : "",
            //     country : "",
            //     zip : "",
            //     default : false,
            //     userId : 1
            // });
             setSaving(false);
             setSuccess(true);
             callback();
             console.log(success);
         }).catch(error => {
             setError(error.response.data);
         })
    }
    return(
        <Form onSubmit={handleSubmit} success={success} error={error}>
        <Form.Input
            name="street_address" 
            placeholder='Street Address'
            value={formData.street_address}
            required
            onChange = {handleChange}
            />

        <Form.Input
          placeholder='apartment address' 
          name='apartment_address'
          value={formData.apartment_address} 
          onChange = {handleChange}
          />
  
        <Form.Field required>
        <Select
        name="country"
        search
        clearable
        loading = {countries.length < 1 }
        fluid
        value={formData.country}
        onChange = {handleSelectChange}
        placeholder='Select your country' 
        options={countries} 
        />
        </Form.Field>

        <Form.Input
        name="zip"
        placeholder="zip"
        required
        value={formData.zip}
        onChange = {handleChange}
        />

        <Form.Field>
          <Checkbox 
          name="default" 
          checked={formData.default} 
          label='Default' 
          onChange ={ handleToggleDefault }
          />
          </Form.Field>

        {success && (
          <Message success header="Success!" content="Your address was saved" />
        )}

        {error && (
          <Message
            error
            header="There was an error"
            content={JSON.stringify(error)}
          />
        )}

        <Form.Button disabled={saving} loading={saving} primary>
          Save
        </Form.Button>


      </Form>
    )
    }

function Profile(props) {
    const {isAuthenticated} = props;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeItem, setActiveItem ] = useState('billingAddress');
    const [addresses, setAddresses] = useState([]);
    const [countries, setCountries] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [userId, setUserId] = useState(1);

    useEffect(() => {
        handleFetchUserId();
        handleFetchAddresses();
        handleFetchCountries();
    }, [activeItem])

    const handleFetchAddresses = () => {
        const address_type = activeItem === 'billingAddress' ? 'B' : 'S';
        setLoading(true);
        console.log(address_type);
        authAxios.get(addressListURL(address_type)
        ).then(res => {
            setAddresses(res.data);
            setLoading(false);
            console.log(res.data);
        }).catch(error => {
            setError(error.response.data.message);
            setLoading(false);
        })
    }

    const handleFormatCountries = (countries) => {
        const keys = Object.keys(countries);
        return keys.map(key =>{
            return{
                k : key,
                text : countries[key],
                value : key,
            }
        })
    }

    const handleFetchCountries = () => {
        setLoading(true);
        authAxios.get(countriesURL).then(res => {
            setCountries(handleFormatCountries(res.data));
            setLoading(false);
        }).catch(error => {
            setError(error.response.data.message);
            setLoading(false);
        })
    }

    const handleDeleteAddress = (id) => {
        setLoading(true);
        authAxios.delete(addressDeleteURL(id)).then(res => {
            setLoading(false);
            handleCallback();
        }).catch(error=>{
            setError(error.response.data);
            setLoading(false);
        })
    }

    const handleItemClick = (name) =>
    { 
        setActiveItem(name);
    }

    const handleCallback = () => {
        handleFetchAddresses();
        handleSelectAddress(null);
    }

    const handleGetActiveItem = () => {
        if(activeItem == 'billingAddress'){
            return "Billing Address";
        } 
        else if(activeItem == 'shippingAddress'){
            return "Shipping Address";
        }
    }

    const handleSelectAddress = (address) => {
        setSelectedAddress(address);
    }

    const handleFetchUserId = () => {
        authAxios.get(userIdURL).then(res=> {
            setUserId(res.data.userID);
        }).catch(error => {
            setError(error.response.data.message);
        })
    }

   
    const renderAddresses = () => {
    return (
    <React.Fragment>
    <Card.Group style={{'marginTop' : '20px'}}>
    {addresses && addresses.map(address => (
        <Card key={address.id}>
        <Card.Content>
            {address.default && <Label as="a" color="blue" ribbon="right">
                Default
                </Label>
            }
            <Card.Header>{address.street_address} , {address.apartment_address}</Card.Header>
            <Card.Meta>{address.country}</Card.Meta>
            <Card.Description>
                {address.zip}
            </Card.Description>
        </Card.Content>
        <Card.Content extra>
            <Button color="yellow" onClick={() =>handleSelectAddress(address)}>Update</Button>
            <Button color="red" onClick={()=> handleDeleteAddress(address.id)}>Delete</Button>
        </Card.Content>
        </Card>
    ))}
    </Card.Group>

    { addresses && addresses.length > 0 ? <Divider /> : null}

    {selectedAddress == null  ? (
        <AddressForm
            form_type = {CREATE_FORM}
            user_id = {userId}
            activeItem = {activeItem}
            callback = {handleCallback}
            countries = {countries}
        />
    ) : null }
    { selectedAddress && (
        <AddressForm
        form_type = {UPDATE_FORM}
        activeItem = {activeItem}
        countries = {countries}
        user_id = {userId}
        callback = {handleCallback}
        address = {selectedAddress}
        />
    )}
        </React.Fragment>
    )}

    if(!isAuthenticated) return <Redirect to="/login" />

    return (
            <Grid container divided columns={2} >
                <Grid.Row columns={1}>
                    <Grid.Column>
                    {error && (
                    <Message negative>
                    <Message.Header>There was some error </Message.Header>
                    <p>{JSON.stringify(error)}</p>
                    </Message> 
                    )}

                    {loading && (
                    <Segment>
                        <Dimmer active inverted>
                        <Loader size='mini'>Loading</Loader>
                    </Dimmer>
                    <Image src="/images/wireframe/short-paragraph.png" />
                    </Segment>
                    )}

                    </Grid.Column>
                </Grid.Row>

                <Grid.Row>
                    <Grid.Column width={6}>
                    <Menu pointing vertical>
                        <Menu.Item
                        name='Billing Address'
                        active={activeItem === 'billingAddress'}
                        onClick={() => handleItemClick("billingAddress")}
                        />
                        <Menu.Item
                        name='Shipping Address'
                        active={activeItem === 'shippingAddress'}
                        onClick={() => handleItemClick('shippingAddress')}
                        />
                        <Menu.Item
                        name="paymentHistory"
                        active={activeItem === 'paymentHistory'}
                        onClick = {()=>handleItemClick("paymentHistory")}
                        />
                        <Menu.Item
                        name="orderHistory"
                        active ={activeItem == "orderHistory"}
                        onClick = {()=>handleItemClick("orderHistory")}
                        />
                    </Menu>
                    </Grid.Column>

                    <Grid.Column width={10}>
                        <Header>{handleGetActiveItem}</Header>
                        {activeItem === "paymentHistory" ? (
                            <PaymentList/>
                        ):
                        activeItem == "orderHistory"  ? (
                            <OrderHistory/>
                        ) :(
                        renderAddresses() 
                        )
                        }
                    </Grid.Column>
                </Grid.Row>
                
            </Grid>
    
    )
}

const mapStateToProps = (state) => {
    return {
        isAuthenticated : state.auth.token !== null
    }
}
export default  connect(mapStateToProps)(Profile)
