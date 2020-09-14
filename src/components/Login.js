import React, { useState } from 'react';
import { Button, Form, Grid, Header, Image, Message, Segment } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import {connect} from 'react-redux';
import {authLogin} from '../store/actions/auth';
import {Redirect, NavLink} from 'react-router-dom';
import logo from '../logo.svg';

const Login = (props) => {

    const { error, loading, token , login } = props;
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    let errors = [];
    // console.log(localStorage.getItem("token"));
    // console.log(loading);
    
    const handleSubmit = (e) =>{
        e.preventDefault();
        login(username, password);
    }

    const handleChange = (e) =>{
        if (e.target.name == 'username'){
        setUsername(e.target.value);
        }
        else {
        setPassword(e.target.value);
        }
    }
    
    if(error){
      
      Object.keys(error.response.data).forEach(key=>{
          errors.push(`${key}  : ${error.response.data[key][0]}`);
      })
      console.log(errors);
    }


if(token) {return <Redirect to="/" /> }
else{
   return ( 

  <React.Fragment>
  <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
    <Grid.Column style={{ maxWidth: 450 }}>
      <Header as='h2' color='teal' textAlign='center'>
        <Image src={logo} /> Log-in to your account
      </Header>

      {error && errors.map(err =>(<Message negative>{err}</Message>) )}

      <Form size='large' onSubmit= {handleSubmit} >
        <Segment stacked>
          <Form.Input
           fluid
           name='username'
           icon='user' 
           iconPosition='left' 
           placeholder='username'
           value = {username}
           onChange = {handleChange}
            />
          <Form.Input
            fluid
            name ='password'
            icon='lock'
            iconPosition='left'
            placeholder='Password'
            type='password'
            value = {password}
            onChange = {handleChange}
          />

          <Button color='teal' fluid size='large' disabled={loading} loading={loading} >
            Login
          </Button>
        </Segment>
      </Form>
      <Message>
      New to us? <NavLink to='/signup'>Sign Up</NavLink>
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
        login : (username, password) => dispatch(authLogin(username, password))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);
