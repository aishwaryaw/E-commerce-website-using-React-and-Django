from django.urls import path
from .views import HomeView, ItemDetailView, add_to_cart, remove_from_cart, OrderSummaryView, remove_single_item_from_cart, CheckoutView, CouponView, PaymentView, RefundView

app_name = 'core'

urlpatterns = [
    path('', HomeView.as_view(), name='home'),
    path('')
    # path('product/<slug>',ItemDetailView, name='product' ),
    # path('add-to-cart/<slug>/', add_to_cart, name='add-to-cart'),
    # path('remove-from-cart/<slug>/', remove_from_cart, name='remove-from-cart'),
    # path('remove-single-item-from-cart/<slug>/', remove_single_item_from_cart , name='remove-single-item-from-cart'),
    # path('order-summary/', OrderSummaryView.as_view(), name='order-summary'),
    # path('checkout/', CheckoutView.as_view(), name = 'checkout'),
    # path('add-coupon/', CouponView.as_view(), name='add-coupon'),
    # path('payment/<payment_option>', PaymentView.as_view() , name='payment'),
    # path('request-refund/', RefundView.as_view(), name='request-refund')

]
