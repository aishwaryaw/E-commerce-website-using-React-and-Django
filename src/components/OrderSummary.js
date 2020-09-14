import React, { useState , useEffect} from 'react'
import {connect} from 'react-redux';
import axios from 'axios';
import {orderSummaryURL, updateItemQuantityURL, deleteItemURL} from '../constants';
import { Container, Message, Segment , Item, Dimmer, Loader, Image, Button, Icon, Label, Table} from 'semantic-ui-react';
import {authAxios} from '../utils';
import {addToCartURL} from '../constants';
import {Redirect, Link} from 'react-router-dom';
import { fetchCart } from '../store/actions/cart';

function OrderSummary(props) {

    const {isAuthenticated, fetchCart} = props;
    const [data, setData] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchOrder();
    }, []);

    const fetchOrder = () => {
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
        

    const renderVariations = (orderitem) => {
        let text = '';
        orderitem.item_variations.forEach(iv =>{
            text += `${iv.variation.name} : ${iv.value}, `;
        })
        return text;
    }

    const handleFormatVariations = (item_variations) =>{
    //[{id: 3, value: "grey", attachment: "/media/shirt5.jpg", variation: {…}} , {id: 5, value: "S", attachment: null, variation: {…}}] -> [3,5]
        return Object.keys(item_variations).map(key => {
            return item_variations[key].id;
        });
        
    }

    const handleAddtoCart = (slug, item_variations) =>{
        // console.log(item_variations);[{id: 3, value: "grey", attachment: "/media/shirt5.jpg", variation: {…}} , {id: 5, value: "S", attachment: null, variation: {…}}]
        const variations = handleFormatVariations(item_variations);
        //console.log(variations); [3,5]
        setLoading(true);
        authAxios.post(addToCartURL, {
            'slug' : slug,
            'variations' : variations
        }).then(res =>{
            fetchOrder();
            fetchCart();
            setLoading(false);
            setError('');
        }).catch(error =>{
            setLoading(false);
            setError(error);
        })
    }

    const handleRemoveQuantityFromCart = (slug, item_variations) => {
        setLoading(true);
        const variations = handleFormatVariations(item_variations);
        authAxios.post(updateItemQuantityURL, {
            'slug' : slug,
            'variations' : variations
        }).then(res => {
            fetchOrder();
            fetchCart();
            setLoading(false);
            setError('');
        }).catch(error => {
            setError(error);
            setLoading(false);
        })
    }

const handleRemoveItem = (id) =>{
    setLoading(true);
    authAxios.delete(deleteItemURL(id)).then(res=>{
        setLoading(false);
        fetchCart();
        fetchOrder();
    }).catch(error => {
        setError(error);
        setLoading(false);
    })
}
    
if(!isAuthenticated) { return <Redirect to="/login" /> }
    return (
        <Container style={{ 'margin-top' : '50px'}}>
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
        { data && (
        <Table celled>
            <Table.Header>
            <Table.Row>
                <Table.HeaderCell>Item #</Table.HeaderCell>
                <Table.HeaderCell>Item name</Table.HeaderCell>
                <Table.HeaderCell>Item price</Table.HeaderCell>
                <Table.HeaderCell>Item quantity</Table.HeaderCell>
                <Table.HeaderCell>Item total price</Table.HeaderCell>
            </Table.Row>
            </Table.Header>

        
            <Table.Body>
            { data.order_items && data.order_items.length != 0 ? data.order_items.map((order_item, i)=>(

            
                <Table.Row key={order_item.id}>
                <Table.Cell>{i+1}</Table.Cell>
                <Table.Cell>
                    {order_item.item.title} - { " "}
                    {renderVariations(order_item)}
                </Table.Cell>
                <Table.Cell>
                    {
                    order_item.item.discount_price ? 
                    <p>${order_item.item.discount_price}</p>:
                    <p>${order_item.item.price}</p>}
                    </Table.Cell> 

                    <Table.Cell textAlign="center">
                        <Icon 
                        name="minus"
                        style = {{float:'left', cursor:'pointer'}}
                        onClick = {()=>handleRemoveQuantityFromCart(order_item.item.slug, order_item.item_variations)}
                        />
                        {order_item.quantity}
                        <Icon 
                        name="plus"
                        onClick = {()=> handleAddtoCart(order_item.item.slug, order_item.item_variations)}
                        style = {{float:'right', cursor:'pointer'}}
                        />
                        </Table.Cell>

                    <Table.Cell>
                    {order_item.item.discount_price &&( 
                    <Label color="green" ribbon>On discount</Label>)}
                    ${order_item.final_price}
                    <Icon 
                    name="trash"
                    color = "red"
                    onClick = {()=> handleRemoveItem(order_item.id)}
                    style ={{float : 'right' , cursor : 'pointer'}} />
                    </Table.Cell>       
                </Table.Row>
            )):
            <Table.Row style={{marginTop  : '50px'}} >No items in your cart</Table.Row>
            }
            <Table.Row>
                <Table.Cell />
                <Table.Cell />
                <Table.Cell />
                <Table.Cell textAlign="right" colSpan="2">
                    Order Total: ${data.total}
                </Table.Cell>
                </Table.Row>

            </Table.Body> 
        { data.order_items && data.order_items.length != 0 &&  ( 
            <Table.Footer>
                <Table.Row>
                <Table.HeaderCell colSpan="5">
                    <Link to="/checkout">
                    <Button floated="right" color="yellow">
                        Checkout
                    </Button>
                    </Link>
                </Table.HeaderCell>
                </Table.Row>
             </Table.Footer>   
        )}
            </Table>
          
        )}
        </Container>
    )
    
}

const mapStateToProps = (state) => {
    return {
        isAuthenticated : state.auth.token !== null
    }
   
}

const mapDispatchToProps = (dispatch) => {
    return {
        fetchCart : () => dispatch(fetchCart())
    }
}


export default connect(mapStateToProps, mapDispatchToProps)(OrderSummary)
