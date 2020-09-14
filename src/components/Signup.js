import React, { useState } from 'react';
import { Button, Form, Grid, Header, Image, Message, Segment } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import {connect} from 'react-redux';
import {authSignup} from '../store/actions/auth';
import {Redirect, NavLink} from 'react-router-dom';
import logo from '../logo.svg';

const Signup = (props) => {

    const { error, loading, token , signup } = props;
    let errors = [];
    const [user, setUser] = useState({username : '', password1 : '', password2:'', email : ''});    
    
    const handleSubmit = (e) =>{
        e.preventDefault();
        signup(user.username,user.email, user.password1, user.password2);
    }

    if(error){
      
      Object.keys(error.response.data).forEach(key=>{
          errors.push(`${key}  : ${error.response.data[key][0]}`);
      })
      console.log(errors);
    }

    const handleChange = (e) =>{
        const {name, value} = e.target;
        setUser((prevState)=> ({
            ...prevState,
            [name] : value
        }));
    }

if(token) {return <Redirect to="/" /> }
else{
   return ( 

  <React.Fragment>
  
  <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
    <Grid.Column style={{ maxWidth: 450 }}>
    {error && errors.map(err =>(<Message negative>{err}</Message>) )}
      <Header as='h2' color='teal' textAlign='center'>
        <Image src={logo} /> Sign up to your account
      </Header>

      <Form size='large' onSubmit= {handleSubmit} >
        <Segment stacked>
          <Form.Input
           fluid
           name='username'
           icon='user' 
           iconPosition='left' 
           placeholder='username'
           value = {user.username}
           onChange = {handleChange}
            />
       
          <Form.Input
            fluid
            name ='password1'
            icon='lock'
            iconPosition='left'
            placeholder='Password'
            type='password'
            value = {user.password1}
            onChange = {handleChange}
          />
          <Form.Input
           fluid
           name='password2'
           icon='user' 
           iconPosition='left' 
           type="password"
           placeholder='Confirm password'
           value = {user.password2}
           onChange = {handleChange}
            />
          <Form.Input
            fluid
            name ='email'
            icon='lock'
            iconPosition='left'
            placeholder='Email Address'
            type='email'
            value = {user.email}
            onChange = {handleChange}
          />

          <Button color='teal' fluid size='large' disabled={loading} loading={loading} >
            Sign up
          </Button>
        </Segment>
      </Form>
      <Message>
      Already have a account? <NavLink to='/login'>Log in</NavLink>
       
      </Message>
    </Grid.Column>
  </Grid>
  </React.Fragment>
)
}
}

const mapStateToProps = (state) => {
    return {
        loading : state.auth.loading,
        error : state.auth.error,
        token : state.auth.token
    }
   
}

const mapDispatchToProps = (dispatch)=>{
    return {
        signup : (username,email, password1, password2) => dispatch(authSignup(username,email, password1, password2))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Signup);
