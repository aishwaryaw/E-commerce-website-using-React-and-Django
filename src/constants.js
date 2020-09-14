const localhost = 'http://127.0.0.1:8000/';

const apiURL = 'api/';

export const endPoint = `${localhost}${apiURL}`;

export const productListURL = `${endPoint}products/`;
export const orderSummaryURL = `${endPoint}order-summary/`;
export const addToCartURL =`${endPoint}add-to-cart/`;
export const productDetailURL = (id)=> `${endPoint}product/${id}/`;
export const updateItemQuantityURL = `${endPoint}update-quantity/`;
export const deleteItemURL = (id) => `${endPoint}delete-item/${id}/`;
export const addressListURL = addressType => `${endPoint}address-list/?address_type=${addressType}`;
export const addressCreateURL = `${endPoint}address-create/`;
export const addressUpdateURL = (id) => `${endPoint}address-update/${id}/`;
export const addressDeleteURL = (id) => `${endPoint}address-delete/${id}/`;
export const countriesURL = `${endPoint}countries/`;
export const userIdURL = `${endPoint}user-id/`;
export const paymentListURL = `${endPoint}payment-list/`;
export const checkoutURL = `${endPoint}checkout/`;
export const addCouponURL = `${endPoint}add-coupon/`;
export const orderListURL = `${endPoint}order-list/`;
export const productFilterURL = (category, min, max) =>`${endPoint}product-filter/?category=${category}&min=${min}&max=${max}`;