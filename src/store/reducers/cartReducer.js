import * as actionTypes from '../actions/actionTypes';
import {updateObject} from '../utility';

const initialstate = {
    loading : false,
    error : null,
    cart : null
};


const cartStart = (state, action) => {
    return updateObject(state, {
      error: null,
      loading: true
    });
  };
  
  const cartSuccess = (state, action) => {
    return updateObject(state, {
      cart: action.data,
      error: null,
      loading: false
    });
  };
  

const cartFail = (state, action) => {
    return {
        ...state,
        error : action.error,
        loading : false
    }
}



const cartReducer = (state= initialstate, action) => {
    switch (action.type){
    case actionTypes.CART_START:
        return cartStart(state, action);
    case actionTypes.CART_SUCCESS:
        return cartSuccess(state, action);
    case actionTypes.CART_SUCCESS:
        return cartFail(state,action);
    default:
        return state;

}
}

export default cartReducer;