import React, { useState , useEffect} from 'react'
import {connect} from 'react-redux';
import axios from 'axios';
import {productListURL} from '../constants';
import { Container, Message, Segment , Item, Dimmer, Loader, Image, Button, Icon, Label} from 'semantic-ui-react';
import {authAxios} from '../utils';
import {addToCartURL} from '../constants';
import { fetchCart } from '../store/actions/cart';
import { Link } from 'react-router-dom';

function Home(props) {
    const {refreshCart} = props;
    const [products, setProducts] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        refreshCart();
        axios.get(productListURL).then(res => {
            setProducts(res.data);
            setLoading(false);
        }).catch(error =>{
            setError(error);
            setLoading(false);
        });
        
    }, []);

    const handleAddtoCart = (slug) =>{
        authAxios.post(addToCartURL, {
            'slug' : slug
        }).then(res =>{
            props.refreshCart();
            setLoading(false);
            setError('');
        }).catch(error =>{
            setLoading(false);
            setError(error);
        })
    }
    
    return (
        <Container style={{ 'marginTop' : '50px'}}>
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

        <Item.Group divided>
        { products.map(product => {
            return(
                <Item key={product.id} >
                <Item.Image size='tiny' src={product.image} />
          
                <Item.Content>
                <Link to={`/product/${product.id}`}><Item.Header>{product.title}</Item.Header></Link>
                <Item.Meta>
                    <span>{product.category}</span>
                </Item.Meta>
                <Item.Description>
                   <p>{product.description}</p>
                    <b>${product.price}</b>
                  </Item.Description>
                  <Item.Extra>
                    {/* <Button primary floated='right' onClick={(slug)=>handleAddtoCart(product.slug)}>
                        Add to cart
                        <Icon name='right chevron' />
                    </Button> */}
                    { product.discount_price && (
                    <Label color='green' >
                        On discount ${ product.discount_price }
                    </Label>
                    )}

                    <Label color={
                        product.label === 'primary' ? 'blue' : product.label === 'secondary' ? 'yellow' : 'olive' 
                    } > {product.label} </Label>
                        
                    </Item.Extra>
               
                </Item.Content>
              </Item>
            )
        }) }
    
      </Item.Group>
      </Container>
    )
    
}

const mapStateToProps = (state) => {
    return {
        loading : state.auth.loading,
        error : state.auth.error,
        cart : state.cart.cart
    }
   
}

const mapDispatchToProps = (dispatch)=>{
    return {
        refreshCart : () => dispatch(fetchCart())
    }
}


export default connect(mapStateToProps, mapDispatchToProps)(Home)
