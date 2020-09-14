import React, { useEffect } from 'react'
import { Menu, Container, Dropdown, DropdownDivider } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import { connect } from "react-redux";
import {logout} from '../store/actions/auth';
import {fetchCart} from '../store/actions/cart';

function Navbar(props) {
    const {authenticated, logout, fetchCart, cart} = props;
    useEffect(()=>{
        fetchCart();
    },[]);
    console.log(cart);

    return (
     
        <Menu>
        <Container>
            <Link to="/">
            <Menu.Item header name='home'/>
            </Link>

            <Link to="/products">
            <Menu.Item header name='Products'/>
            </Link>

        { authenticated ?(
            <React.Fragment>
            <Menu.Menu position="right">
            <Link to="/profile">
            <Menu.Item position="right" name='Profile'/>
            </Link>

            <Dropdown 
            icon="cart"
            text= { `${cart!= null ? cart.order_items.length : '0'} `}
            className='link item'
            pointing
            >
            <Dropdown.Menu>
            { cart !== null ?(
                <React.Fragment>
                    { cart.order_items.map(order_item =>(
                         <Dropdown.Item key={order_item.id}>
                            {order_item.quantity} x {order_item.item.title} 
                         </Dropdown.Item>
                        )
                    )}
                    { cart.order_items.length < 1 ? (
                        <Dropdown.Item>No items in your cart</Dropdown.Item>
                    ) : null}
                    <DropdownDivider />
                    <Link to="/order-summary"><Dropdown.Item text="Checkout" icon="arrow right" /></Link>
                    </React.Fragment>

            ) : (
            <Dropdown.Item>No items in your cart</Dropdown.Item>
             ) }
            
            </Dropdown.Menu>
            </Dropdown>
        
            <Menu.Item header onClick={logout} name="Logout" style={{cursor : 'pointer'}} position="right" />

            </Menu.Menu>
        </React.Fragment>

        ) : (
            <Menu.Menu position="right">
                <Link to="/login">
                  <Menu.Item header>Login</Menu.Item>
                </Link>
                <Link to="/signup">
                  <Menu.Item header>Signup</Menu.Item>
                </Link>
              </Menu.Menu>
        )}
        </Container>
      </Menu>
 
    )
}

const mapStateToProps = (state) => {
    return {
        authenticated : state.auth.token !== null,
        cart : state.cart.cart
    }
   
}

const mapDispatchToProps = (dispatch)=>{
    return {
       logout : ()=>dispatch(logout()),
       fetchCart : () => dispatch(fetchCart())
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Navbar);
