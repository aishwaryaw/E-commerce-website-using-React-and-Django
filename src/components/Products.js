import React, { useState, useEffect } from 'react'
import {Menu, Container, Grid, Dimmer, Loader, Image, Message, Header, Segment, Card, Button, Label, Form, Checkbox, Select, Divider, Table} from 'semantic-ui-react';
import {connect} from 'react-redux';
import { Redirect, Link } from 'react-router-dom';
import axios from 'axios';
import { productFilterURL} from '../constants';


function Products() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeItemCategory, setActiveItemCategory ] = useState('allCategories');
    const [activeItemPrice, setActiveItemPrice] = useState({
        text : 'allPrices',
        min : 0,
        max : 500
    });
    const [products, setProducts] = useState([]);

    useEffect(() => {
        handleFetchClothes();
    }, [activeItemCategory, activeItemPrice])


    const handleFetchClothes = () => {
    //     let min = 0;
    //     let max = 0;

    //    if(activeItemPrice === 'allPrices'){
    //        min = 0;
    //        max = 300;
    //    }
    //    else if(activeItemPrice == '<100'){
    //         min = 0;
    //         max = 100;
    //    }

    //    else if(activeItemPrice == '100-200'){
    //        min = 100;
    //        max = 200;
    //    }
    //    else {
    //        min = 200;
    //        max = 500;
    //    }

        setLoading(true);
        // console.log(address_type);
        const category = activeItemCategory == 'shirt' ? 
        'S' :  activeItemCategory == 'sportwear' ? 'SW' : activeItemCategory == 'outwear' ? 'OW' : 'all' ;

        axios.get(productFilterURL(category, activeItemPrice.min, activeItemPrice.max)
        ).then(res => {
            setProducts(res.data);
            setLoading(false);
            console.log(res.data);
        }).catch(error => {
            setError(error.response.data.message);
            setLoading(false);
        })
    }
 
    const handleCategoryItemClick = (name) =>
    { 
        setActiveItemCategory(name);
    }

    const handlePriceItemClick  = (text,min, max) => {
        setActiveItemPrice(prevState => ({
            ...prevState,
            text:text,
            min:min,
            max: max
        }));
    }

    
    const renderProducts = () => {
    return (
    <React.Fragment>
    <Card.Group style={{'marginTop' : '20px'}}>

    {products && products.length > 0 ? products.map(product => (
        <Card key={product.id}>
        <Card.Content>
        <Image floated="right" size="tiny" src={product.image} wrapped/>
        <Link to={`/product/${product.id}`}><Card.Header>{product.title}</Card.Header></Link>
        <Card.Meta style={{marginTop : '5px'}}>{product.category}
        <Label style={{ marginLeft: '5px'}} color={product.label =='primary'? 'blue' : product.label=='secondary' ? 'yellow' : 'orange'}>{product.label}</Label>
        </Card.Meta>
        <Card.Description>{product.description}</Card.Description>
        </Card.Content>
        <Card.Content extra>
            <Card.Header>${product.price}
            {product.discount_price && <Label as="a" color="green" ribbon="right">
                on discount ${product.discount_price}
                </Label>
            }
            </Card.Header>
        </Card.Content>
       
        </Card>
    )) : ( <p>No items matching your category</p> )}
    </Card.Group>
    </React.Fragment>
    )}

   
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
                        name="All"
                        active={activeItemCategory=='allCategories'}
                        onClick={()=>handleCategoryItemClick('allCategories')}
                        />
                        <Menu.Item
                        name='Shirt'
                        active={activeItemCategory === 'shirt'}
                        onClick={() => handleCategoryItemClick("shirt")}
                        />
                        <Menu.Item
                        name='Sport wear'
                        active={activeItemCategory === 'sportwear'}
                        onClick={() => handleCategoryItemClick('sportwear')}
                        />
                        <Menu.Item
                        name="Outwear"
                        active={activeItemCategory === 'outwear'}
                        onClick = {()=>handleCategoryItemClick("outwear")}
                        />
                    </Menu>

                    <Menu pointing vertical>
                        <Menu.Item
                        name="All price ranges"
                        active={activeItemPrice.text =='allPrices'}
                        onClick={()=>handlePriceItemClick('allPrices', 0, 500)}
                        />
                        <Menu.Item
                        name='Less than $100'
                        active={activeItemPrice.text === '<100'}
                        onClick={() => handlePriceItemClick("<100", 0, 100)}
                        />
                        <Menu.Item
                        name='$100 to $200'
                        active={activeItemPrice.text === '100-200'}
                        onClick={() => handlePriceItemClick('100-200', 100, 200)}
                        />
                        <Menu.Item
                        name="Greater than $200"
                        active={activeItemPrice.text === '>200'}
                        onClick = {()=>handlePriceItemClick(">200", 200, 500)}
                        />
                    </Menu>
                    </Grid.Column>

                    <Grid.Column width={10}>
                        <Header>Items</Header>
                        {renderProducts()}
                  
                    </Grid.Column>
                </Grid.Row>
                
            </Grid>
    
    )
}

const mapStateToProps = (state) => {
    return {
       
    }
}
export default connect(mapStateToProps)(Products)
