import React , {useEffect} from 'react';
import { Route } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Home from './components/Home';
import {checkAuthState} from './store/actions/auth';
import {connect} from 'react-redux';
import Navbar from './components/Navbar';
import ProductDetail from './components/ProductDetail';
import OrderSummary from './components/OrderSummary';
import Profile from './components/Profile';
import wrappedForm from './components/Checkout';
import Products from './components/Products';


function App(props) {

  useEffect(() => {
    console.log(props.isAuthenticated);
    props.onTryAutoSignup();
  });

  return (
    
    <div className="App">
      <Navbar/>
    <Route exact path="/" component={Home} />
     <Route path="/login" component={Login} />
     <Route path = "/signup" component = {Signup} />
     <Route path="/product/:id" component={ProductDetail} />
     <Route path="/order-summary" component={OrderSummary} />
     <Route path="/profile" component={Profile} />
     <Route path="/checkout" component={wrappedForm} />
     <Route path="/products" component={Products} />
    </div>
  );
}

const mapStateToProps = state => {
  return {
    isAuthenticated: state.auth.token !== null
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onTryAutoSignup: () => dispatch(checkAuthState())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
