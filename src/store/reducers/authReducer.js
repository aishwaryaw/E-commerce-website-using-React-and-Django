import * as actionTypes from '../actions/actionTypes';
import {updateObject} from '../utility';

const initialstate = {
    loading : false,
    error : null,
    token : null
};


const authStart = (state, action) => {
    return updateObject(state, {
      error: null,
      loading: true
    });
  };
  
  const authSuccess = (state, action) => {
    return updateObject(state, {
      token: action.token,
      error: null,
      loading: false
    });
  };
  

const authFail = (state, action) => {
    return {
        ...state,
        error : action.error,
        loading : false
    }
}

const logout = (state, action) =>{
    return{
        ...state,
        token : null
    }
}


const authReducer = (state= initialstate, action) => {
    switch (action.type){
    case actionTypes.AUTH_START:
        return authStart(state, action);
    case actionTypes.AUTH_SUCCESS:
        return authSuccess(state, action);
    case actionTypes.AUTH_FAIL:
        return authFail(state,action);
    case actionTypes.AUTH_LOGOUT:
        return logout(state, action);
    default:
        return state;

}
}

export default authReducer;