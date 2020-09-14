import * as actionType from './actionTypes';
import {authAxios} from '../../utils';
import {orderSummaryURL} from '../../constants';

export const cart_start = () =>{
    return {
        type : actionType.CART_START,
    }
}

export const cart_success = (data) =>{
    return {
        type : actionType.CART_SUCCESS,
        data

    }
}
export const cart_fail = (error) =>{
    return {
        type : actionType.CART_FAIL,
        error : error
    }
}

export const fetchCart = () =>{
    return dispatch => {
        dispatch(cart_start);
        authAxios.get(orderSummaryURL).then(res=>{
            dispatch(cart_success(res.data));
        }).catch(error =>{
            dispatch(cart_fail(error))
        })
    }
}