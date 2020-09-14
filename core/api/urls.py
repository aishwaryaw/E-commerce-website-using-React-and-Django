from django.urls import include, path
from .views import (
    ItemListView, OrderDetailView, AddToCartAPIView, ItemDetailView , UpdateItemQuantityView, DeleteItemView,
    AddressListView, AddressCreateView, AddressUpdateView, AddressDeleteView, CountryListView, UserIdView,
    PaymentView, AddCouponView, PaymentListView , OrderHistoryView, ProductsFilterView
    )

urlpatterns = [
    path('products/' , ItemListView.as_view(), name = 'product-list'),
    path('order-summary/', OrderDetailView.as_view(), name='order-summary' ),
    path('add-to-cart/', AddToCartAPIView.as_view(), name='add-to-cart'),
    path('product/<pk>/', ItemDetailView.as_view() , name='product-detail' ),
    path('update-quantity/', UpdateItemQuantityView.as_view(), name='update-quantity'),
    path('delete-item/<pk>/', DeleteItemView.as_view(), name= 'delete-item' ),
    path('address-list/', AddressListView.as_view(), name='address-list'),
    path('address-create/', AddressCreateView.as_view(), name = 'address-create'),
    path('address-update/<pk>/',AddressUpdateView.as_view(), name='address-update' ),
    path('address-delete/<pk>/', AddressDeleteView.as_view(), name='address-delete'),
    path('countries/', CountryListView.as_view(), name='countries'),
    path('user-id/', UserIdView.as_view(), name='user-id'),
    path('checkout/', PaymentView.as_view(), name='checkout'),
    path('add-coupon/',AddCouponView.as_view(), name='add-coupon'),
    path('payment-list/', PaymentListView.as_view(), name='payment-list'),
    path('order-list/', OrderHistoryView.as_view(), name='order-list'),
    path('product-filter/', ProductsFilterView.as_view(), name='product-filter')
]
