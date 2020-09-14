import React, { useState, useEffect } from 'react'
import {Dimmer, Loader, Image, Message, Segment, Item, Label, Form, Select, Divider, Header, Container, Button} from 'semantic-ui-react';
import {connect} from 'react-redux';
import { Redirect, Link } from 'react-router-dom';
import { authAxios } from '../utils';
import { addressListURL,checkoutURL, addCouponURL, orderSummaryURL } from '../constants';
import {CardElement, injectStripe, StripeProvider, Elements} from 'react-stripe-elements';
import { fetchCart } from '../store/actions/cart';

const OrderPreview = ({data}) => {
    return (
        <React.Fragment>
        { data && (
        <React.Fragment>
        <Item.Group divided>
        { data.order_items && data.order_items.map((order_item,i) => {
            return(
                <Item key={i} >
                <Item.Image size='tiny' src={`http://127.0.0.1:8000${order_item.item.image}`} />
       
                <Item.Content>
                <Item.Header>{order_item.item.title} X {order_item.quantity}</Item.Header>
                <Item.Extra>
                    { order_item.item.discount_price && (
                    <Label color='green' >
                        On discount 
                    </Label>
                    )}
                    </Item.Extra>
                    ${order_item.final_price}
                </Item.Content>
              </Item>
            )
        }) }
    
      </Item.Group>

      <Item.Group>
          <Item.Content>
            <Item.Header>Order total : ${data.total}</Item.Header>
            {data.coupon && (
                <Label color="green" style = {{marginLeft : "10px"}}>
                    Coupon code : {data.coupon.code} for 
                    ${data.coupon.amount}
                </Label>
            )}
          </Item.Content>
      </Item.Group>
      </React.Fragment>
        )}
      </React.Fragment>
    )
}

const CouponForm = (props) => {
    const {addCoupon} = props;
    const [code, setCode] = useState("");


    const handleChange = (e)=>{  
        setCode(e.target.value);
    }

    const handleSubmit = (e)=>{
        addCoupon(e, code);
        setCode("");
    }
    
    return(
        <Form onSubmit={handleSubmit}>
        <Form.Field>
        <label>Enter coupon code</label>
        <Form.Input
            name="code" 
            placeholder='Enter code'
            value={code}
            required
            onChange = {handleChange}
            /> 
        </Form.Field>

        <Form.Button primary>
          Apply code
        </Form.Button>
        
      </Form>
    )
    }

function Checkout(props) {
    const {isAuthenticated, refreshCart} = props;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [shippingAddresses, setShippingAddresses] = useState([]);
    const [billingAddresses, setBillingAddresses] = useState([]);
    const [data, setData] = useState(null);
    const [selectedShippingAddress, setSelectedShippingAddress] = useState('');
    const [selectedBillingAddress, setSelectedBillingAddress ] = useState('');
    const [visible, setVisible] = useState(false);
    const [success, setSuccess] = useState(false);

  
    useEffect(() => {
        handleFetchBillingAddresses();
        handleFetchShippingAddresses();
        handleFetchOrder();
    }, [])

    const handleGetDefaultAddress = (addresses)=>{
        const filteredAddresses = addresses.filter(el => el.default === true);
        if (filteredAddresses.length > 0){
            return filteredAddresses[0].id;
        }
        return "";
    }
    const handleFetchBillingAddresses = () => {
        setLoading(true);
        authAxios.get(addressListURL('B')
        ).then(res => {
            setBillingAddresses(res.data.map(a=>{
                return {
                    key : a.id,
                    text : `${a.street_address} ${a.apartment_address}, ${a.country}`,
                    value : a.id
                }
            }));
            setSelectedBillingAddress(handleGetDefaultAddress(res.data));
            setLoading(false);
        }).catch(error => {
            setError(error.response.data.message);
            setLoading(false);
        })
    }

    const handleFetchShippingAddresses = () => {
        setLoading(true);
        authAxios.get(addressListURL('S')
        ).then(res => {
            setShippingAddresses(res.data.map(a=>{
                return {
                    key : a.id,
                    text : `${a.street_address} ${a.apartment_address}, ${a.country}`,
                    value : a.id
                }
            }));
            setSelectedShippingAddress(handleGetDefaultAddress(res.data));
            setLoading(false);
        }).catch(error => {
            setError(error.response.data.message);
            setLoading(false);
        })
    }

    const handleFetchOrder = () => {
            setLoading(true);
            authAxios.get(orderSummaryURL).then(res => {
                    setData(res.data);
                    setLoading(false);
            }).catch(error =>{
                    if(error.response.status == 404){
                        setError('You do not have an active order');
                        setLoading(false);
                    }
                    else{
                        setError(error);
                        setLoading(false);
                    }  
                });
            }

    const handleSelectChange = (e, {name, value}) => {
        if (name == "selectedBillingAddress" ){
            setSelectedBillingAddress(value);
        }
        else{
            setSelectedShippingAddress(value);
        }
    }

    const handleAddCoupon = (e, code) => {
        setLoading(true);
        e.preventDefault();
        console.log(code);
        authAxios.post(addCouponURL, {
            'code' : code
        }).then(res =>{
            setLoading(false);
            setVisible(true);
            handleFetchOrder();
        }).catch(error =>{
            setLoading(false);
            setError(error.response.dadta.message);
        })
    }

    const handlePaymentSubmit = () => {
        if(selectedBillingAddress == "" || selectedShippingAddress == ""){
            setError('Please enter addresses');
        }
        else{
        setLoading(true);
        if(props.stripe){
            props.stripe.createToken().then(result => {
                if(result.error){
                    setError(error);
                    setLoading(false);
                }
                else{
                    authAxios.post(checkoutURL, {
                        stripeToken : result.token.id,
                        billing_address : selectedBillingAddress,
                        shipping_address : selectedShippingAddress
                    }).then(res=>{
                        setLoading(false);
                        setSuccess(true);
                        refreshCart();
                    }).catch(error => {
                        setLoading(false);
                        setError(error);
                    })
                }
            })
        }
        else{
            console.log('Stripe not loaded');
        }
    }
    }

    const handleDismiss = () => {
        setVisible(!visible);
    }

    if(!isAuthenticated) return <Redirect to="/login" />

    return (
        success ? (
            <Message positive>
                <Message.Header>Your payment was successful</Message.Header>
                <p>Go to your <b>Profile</b> to see the payment history</p>
            </Message>
        ) :(   
            <Container>
                {visible && (
                    <Message positive onDismiss={handleDismiss} >
                        Successfully added coupon
                    </Message>
                )}
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

                    <OrderPreview data= {data} />
                    <Divider />

                    <CouponForm addCoupon = {(e,code) => handleAddCoupon(e,code)}/>

                    <Divider />
                    <Header>Select billing address </Header>
                    {billingAddresses.length > 0 ? (<Select
                    name="selectedBillingAddress"
                    value = {selectedBillingAddress}
                    search
                    clearable
                    loading = {billingAddresses.length < 1 }
                    fluid
                    onChange = {handleSelectChange}
                    options={billingAddresses} 
                    /> 
                    ):
                    (
                        <p>You do not have billing address <Link to="/profile">Add a billing address</Link> </p>
                    )}

                    <Header>Select shipping address</Header>
                    {shippingAddresses.length > 0 ? (<Select
                    name="selectedShippingAddress"
                    value = {selectedShippingAddress}
                    search
                    clearable
                    loading = {shippingAddresses.length < 1 }
                    fluid
                    onChange = {handleSelectChange}
                    options={shippingAddresses} 
                    />
                    ) : 
                    (
                        <p>You need to add shipping address <Link to="/profile">Add a shipping address</Link> </p>
                    )
                    }

                    <Divider />
                    {shippingAddresses.length < 1 || billingAddresses.length < 1 ? (
                        <p>You need to add addresses before you complete the payment</p>
                    ): 
                        (   
                        <React.Fragment>
                        <Header>Would you like to complete the purchase?</Header>
                        <CardElement />

                        <Button loading={loading} disabled={loading} primary onClick={handlePaymentSubmit}>
                            Pay
                        </Button>
                        </React.Fragment>
                        )}

            </Container>

        )
               
    )
}

const mapStateToProps = (state) => {
    return {
        isAuthenticated : state.auth.token !== null
    }
}

const mapDispatchToProps = (dispatch)=>{
    return{
        refreshCart : () => dispatch(fetchCart())
    }
}
const InjectedForm = injectStripe(connect(mapStateToProps, mapDispatchToProps)(Checkout))

const wrappedForm = () => (
    <Container text>
        <StripeProvider apiKey="">
            <div>
            <h1>Complete your order</h1>
            <Elements>
                <InjectedForm/>
            </Elements>
            </div>
        </StripeProvider>
    </Container>
)

export default wrappedForm
