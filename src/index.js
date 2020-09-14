import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import {BrowserRouter} from 'react-router-dom';
import thunk from 'redux-thunk';
import { combineReducers, compose, createStore, applyMiddleware } from 'redux';
import authReducer from './store/reducers/authReducer';
import cartReducer from './store/reducers/cartReducer';
import {Provider} from 'react-redux';


const composeEnhances = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;


const rootReducer = combineReducers({
  auth : authReducer,
  cart : cartReducer
});

const store = createStore(rootReducer, composeEnhances(applyMiddleware(thunk)));

const app = (
  <BrowserRouter>
  <Provider store= {store}>
    <App />
  </Provider>
  </BrowserRouter>
);

ReactDOM.render(app, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
