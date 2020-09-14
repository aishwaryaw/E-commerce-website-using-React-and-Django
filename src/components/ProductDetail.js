import React, { useState , useEffect} from 'react'
import {connect} from 'react-redux';
import axios from 'axios';
import {productDetailURL} from '../constants';
import { Container, Message, Segment , Item, Dimmer, Loader, Image, Button, Icon, Label,Grid, Card, Header, Select, Form} from 'semantic-ui-react';
import {authAxios} from '../utils';
import {addToCartURL} from '../constants';
import { fetchCart } from '../store/actions/cart';

function ProductDetail(props) {

    const [product, setProduct] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [formVisible, setFormVisible] = useState(false);
    const [formData, setFormData] = useState({});
    const [success, setSuccess] = useState(null);
    const [image, setImage] = useState('');

    useEffect(() => {
        setLoading(true);
        const id = props.match.params.id;
        axios.get(productDetailURL(id)).then(res => {
            setProduct(res.data);
            setLoading(false);
        }).catch(error =>{
            console.log(error.response);
            setError(error.res.message);
            setLoading(false);
        });
        
    }, []);

    const handleFormToggle = ()=>{
        if(props.isAuthenticated){
        setFormVisible(!formVisible);
        }
        else{
            window.location = "/login";
        }
    }

    const handleAddtoCart = (e,slug) =>{
        e.preventDefault();
        setLoading(true);
        const variations = handleFormatData(formData);
        authAxios.post(addToCartURL, {
            'slug' : slug,
            'variations' : variations
        }).then(res =>{
            props.refreshCart();
            setLoading(false);
            setSuccess('Succesfully added to cart');
            handleFormToggle();
            setError('');
        }).catch(error =>{
            console.log(error);
            if(error.response.status == 401){
            window.location = "/login";
            }
            setLoading(false);
            setError(error.response.data.message);
        })
    }
    

    const handleChange = (e, { name, value }) => {
            setFormData(prevState => ({
                ...prevState,
                [name] : value 
                //color : 2(id)
            }));
           
    }

    const handleFormatData = (formData) =>{
        // convert {colour: 1, size: 2} to [1,2] - they're all variations
        return Object.keys(formData).map(key=>{
            return formData[key];
        });
    }

    const handleSetImage = (img)=>{
        setImage(img);
    }

    // console.log(formData);
    // console.log(product);
    
    return (
        <Container style={{ 'marginTop' : '50px'}}>
            {success && (
                <Message positive>
                    <Message.Header>{success}</Message.Header>
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

            <Grid columns={2} divided>
                <Grid.Row>
                <Grid.Column>
                <Card
                fluid
                image={image == ''? product.image : image}
                header={product.title}
                meta={
                    <React.Fragment>
                        <b>${product.price}</b>
                        {product.discount_price && (
                        <Label color='green' >
                            On discount ${ product.price - product.discount_price }
                        </Label>
                        )}
                        <Label color={
                            product.label === 'primary' ? 'blue' : product.label === 'secondary' ? 'yellow' : 'olive' 
                        } > {product.label} </Label>
                        </React.Fragment>
                }
                description={product.description}
                extra={(
                    <Button   
                    fluid
                    color="yellow"
                    floated="right"
                    icon
                    labelPosition="right"
                    onClick = {handleFormToggle}
                    >
                    Add to cart
                    <Icon name='cart plus' />
                    </Button>
                )}
            />

            {formVisible && (
                <React.Fragment>
                <form onSubmit={(e)=>handleAddtoCart(e, product.slug)}>
                    {product.variations.map(v => {
                        const name = v.name.toLowerCase();
                        return(
                            <Form.Field key={v.id}>
                            <Select
                            fluid
                            name={name}
                            onChange = {handleChange}
                            placeholder = {`Select ${name}`}
                            options = {
                                v.item_variations.map(iv=>{
                                    return {
                                        key : iv.id,
                                        text : iv.value,
                                        value : iv.id
                                    };
                                })
                            }
                            />
                            </Form.Field>
                        )
                    })}
                  <Form.Button fluid primary>Add</Form.Button>
                </form>
         
                </React.Fragment>
            )}

                </Grid.Column>

                <Grid.Column>
                    <Header as="h2">Try different variations</Header>
                    <Item.Image size="tiny" onClick={()=>setImage(product.image)} src={product.image}/>
                    { product.variations && product.variations.map(
                        variation => {
                        return (
                            <React.Fragment key={variation.id}>
                            <Header as="h4">{variation.name}</Header>
                            <Item.Group divided>
                            {variation.item_variations.map(item_variation =>(
                            <Item key={item_variation.id}>
                            {item_variation.attachment &&
                            <Item.Image onClick={()=>setImage(`http://127.0.0.1:8000${item_variation.attachment}`)} size="tiny" src={`http://127.0.0.1:8000${item_variation.attachment}`} /> 
                            }
                            <Item.Content verticalAlign="middle" >{item_variation.value}</Item.Content>
                            </Item>
                            ))}
                            </Item.Group>
                            </React.Fragment>
                    )}) } 
                </Grid.Column>
              
                </Grid.Row>
                </Grid>

      
      </Container>
    )
    
}

const mapStateToProps = (state) =>{
    return{
        isAuthenticated : state.auth.token !== null
    }
}
const mapDispatchToProps = (dispatch)=>{
    return {
        refreshCart : () =>dispatch(fetchCart())
    }
}


export default connect(mapStateToProps, mapDispatchToProps)(ProductDetail)
