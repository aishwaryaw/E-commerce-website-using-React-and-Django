from rest_framework.generics import ListAPIView, RetrieveAPIView, DestroyAPIView, UpdateAPIView, CreateAPIView
from rest_framework.views import APIView
from .serializers import(OrderSerializer, OrderItemSerializer, 
ItemSerializer, ItemDetailSerializer , AddressSerializer,
PaymentSerializer, CouponSerializer)
from core.models import Order, OrderItem, Item, ItemVariation, Variation, Address, Payment, Coupon
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK, HTTP_400_BAD_REQUEST
from django.shortcuts import get_object_or_404 , render
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from django.http import Http404
from django.utils import timezone
from django.db.models import Q
from django_countries import countries
import stripe

stripe.api_key = settings.STRIPE_SECRET_KEY

class ItemListView(ListAPIView):
    serializer_class = ItemSerializer
    permission_classes = (AllowAny,)
    queryset = Item.objects.all()


class ItemDetailView(RetrieveAPIView):
    serializer_class = ItemDetailSerializer
    permission_classes = (AllowAny,)
    queryset = Item.objects.all()


class OrderDetailView(RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = (IsAuthenticated,)
    def get_object(self):
        try:
            order = Order.objects.get(user=self.request.user , ordered=False)
            return order
        
        except ObjectDoesNotExist:
            raise Http404 


class AddToCartAPIView(APIView):
    permission_classes = (IsAuthenticated,)
    def post(self , request, *args, **kwargs):
        slug = request.data.get('slug', None)
        variations = request.data.get('variations', [])

        if(slug is None):
            return Response({"message":"invalid request"} , HTTP_400_BAD_REQUEST)

        item = get_object_or_404(Item, slug=slug)
        min_variation_count = Variation.objects.filter(item = item).count()
        if len(variations) < min_variation_count:
            return Response({"message":"Please provide all variation types"}, status=400)

        order_item_qs = OrderItem.objects.filter(
            user = request.user,
            ordered=False,
            item= item
        )

        for v in variations:
            order_item_qs = order_item_qs.filter(
                Q(item_variations__exact = v)
            )

        if order_item_qs.exists():
            order_item = order_item_qs[0]
            order_item.quantity +=1
            order_item.save()

        else:
            order_item = OrderItem.objects.create(
                item=item,
                user=request.user,
                ordered=False
            )

            order_item.item_variations.add(*variations)
            order_item.save()

        order_qs = Order.objects.filter(user=request.user, ordered=False)
        if order_qs.exists():
            order = order_qs[0]
            # check if the order item is in the order
            if not order.items.filter(item__id = order_item.id).exists():
                order.items.add(order_item)
                return Response(HTTP_200_OK)

        else:
            ordered_date = timezone.now()
            order = Order.objects.create(
                user=request.user,
                ordered_date=ordered_date,
            )
            order.items.add(order_item)
            return Response(HTTP_200_OK)




class UpdateItemQuantityView(APIView):
    def post(self, request, *args, **kwargs):
        slug = request.data.get('slug', None)
        if slug is None:
            Response(HTTP_400_BAD_REQUEST)

        item = get_object_or_404(Item, slug=slug)
        variations = request.data.get('variations', [])
        print(variations)
        min_variation_count = Variation.objects.filter(item=item).count()
        if min_variation_count > len(variations):
            return Response({"message" : "Please provide all variations"}, HTTP_400_BAD_REQUEST)
        
        order_item_qs = OrderItem.objects.filter(
            ordered=False,
            user=request.user,
            item=item
        ) 

        for v in variations:
            order_item_qs = order_item_qs.filter(
                Q(item_variations__exact=v)
            )
        
        if order_item_qs.exists():
            order_item = order_item_qs[0]

        order_qs = Order.objects.filter(
            user=request.user,
            ordered=False,
        )
        print(order_item)

        if order_qs.exists():
            order = order_qs[0]
            print(order)
            # check if the order item is in the order
            if order.items.filter( item=item ).exists():
                if order_item.quantity > 1 :
                    order_item.quantity -= 1
                    order_item.save()
                else:
                    order.items.remove(order_item)
                    order_item.delete()
                return Response(HTTP_200_OK)

            else:
                return Response({"message" : "This item was not in your cart"}, HTTP_400_BAD_REQUEST)
        else:
            return Response({"message" :"You do not have an active order"}, HTTP_400_BAD_REQUEST)

        
class DeleteItemView(DestroyAPIView):
    permission_classes = (IsAuthenticated,)
    queryset = OrderItem.objects.all()



class AddressListView(ListAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = AddressSerializer
    def get_queryset(self):
        address_type = self.request.query_params.get('address_type', None)
        print(address_type)
        address_qs = Address.objects.all()
        if address_type is None:
            return address_qs
        return Address.objects.filter(user=self.request.user, address_type=address_type)


class CountryListView(ListAPIView):
    def get(self, request, *args, **kwargs):
        return Response(countries, status = HTTP_200_OK)


class AddressCreateView(CreateAPIView):
    serializer_class = AddressSerializer
    permission_classes = (IsAuthenticated,)
    queryset = Address.objects.all()


class AddressUpdateView(UpdateAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = AddressSerializer
    queryset = Address.objects.all()

class AddressDeleteView(DestroyAPIView):
    permission_classes = (IsAuthenticated,)
    queryset = Address.objects.all()


class UserIdView(APIView):
    def get(self, request, *args, **kwargs):
        return Response( {'userID' : request.user.id} ,status= HTTP_200_OK)


class AddCouponView(APIView):
    def post(self, request, *args,**kwargs):
        code = request.data.get('code', None)
        if code is None:
            return Response({"message" : "Please provide code"}, status=HTTP_400_BAD_REQUEST)

        order_qs = Order.objects.filter(user=request.user, ordered=False)
        if order_qs.exists():
            print(code)
            coupon = get_object_or_404(Coupon,code=code)
            order = order_qs[0]
            order.coupon = coupon
            order.save()
            return Response(HTTP_200_OK)
        return Response({"message" : "You do not have an active order"}, status=HTTP_400_BAD_REQUEST)

class PaymentView(APIView):
    def post(self, request, *args, **kwargs):
        order = Order.objects.get(user=request.user , ordered=False)
        userprofile = request.user.userprofile
        billing_address_id = request.data.get('billing_address')
        shipping_address_id = request.data.get('shipping_address')
        stripetoken = request.data.get('stripeToken')

        billing_address = Address.objects.get(id= billing_address_id)
        shipping_address = Address.objects.get(id = shipping_address_id)


        if userprofile.stripe_customer_id != '' and userprofile.stripe_customer_id is not None:
            customer = stripe.Customer.retrieve(
                    userprofile.stripe_customer_id
                )

            customer.sources.create(source=stripetoken)

        else:
            customer = stripe.Customer.create(
            email = self.request.user.email
            )

            customer.sources.create(source= stripetoken)
            userprofile.stripe_customer_id = customer['id']
            userprofile.one_click_purchasing = True
            userprofile.save()
                
        amount = int(order.get_total_price())

        try:
            # charge the customer because we cannot charge the token more than once
            charge = stripe.PaymentIntent.create(
                    amount = amount,
                    currency = "usd",
                    description = "Payment",
                    customer= userprofile.stripe_customer_id
            )
                                        
            # create payment
            payment = Payment.objects.create(
            user= self.request.user,
            amount= amount, 
            stripe_charge_id=charge['id']
            )
            payment.save()

            #assign the payment to order
            order_items = order.items.all()
            order_items.update(ordered=True)
            for item in order_items:
                item.save()

            order.ordered = True
            order.payment= payment
            order.shipping_address = shipping_address
            order.billing_address = billing_address
            # order.ref_code = create_ref_code()
            order.save()

            return Response({"message" :"Your order was successful!"}, status=HTTP_200_OK)

        except stripe.error.CardError as e:
            body = e.json_body
            err = body.get('error', {})
            return Response({"message" : f"{err.get('message')}"}, status=HTTP_400_BAD_REQUEST)

        except stripe.error.RateLimitError as e:
            # Too many requests made to the API too quickly
           return Response({"message" : f"{err.get('message')}"}, status=HTTP_400_BAD_REQUEST)

        except stripe.error.InvalidRequestError as e:
            # Invalid parameters were supplied to Stripe's API
            print(e)
            return Response({"message" : f"{err.get('message')}"}, status=HTTP_400_BAD_REQUEST)

        except stripe.error.AuthenticationError as e:
            # Authentication with Stripe's API failed
            # (maybe you changed API keys recently)
            return Response({"message" : f"{err.get('message')}"}, status=HTTP_400_BAD_REQUEST)

        except stripe.error.APIConnectionError as e:
            # Network communication with Stripe failed
           return Response({"message" : f"{err.get('message')}"}, status=HTTP_400_BAD_REQUEST)

        except stripe.error.StripeError as e:
            # Display a very generic error to the user, and maybe send
            # yourself an email
            return Response({"message" : f"{err.get('message')}"}, status=HTTP_400_BAD_REQUEST)

        except Exception as e:
            # send an email to ourselves
            print(e)
            return Response({"message" : f"{err.get('message')}"}, status=HTTP_400_BAD_REQUEST)

        return Response({"message":"Invalid data received"}, status=HTTP_400_BAD_REQUEST)



class PaymentListView(ListAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = PaymentSerializer
    def get_queryset(self):
        return Payment.objects.filter(user=self.request.user)
    
class OrderHistoryView(ListAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = OrderSerializer
    def get_queryset(self):
        return Order.objects.filter(ordered=True, user=self.request.user)


class ProductsFilterView(ListAPIView):
    permission_classes = (AllowAny,)
    serializer_class = ItemSerializer
    def get_queryset(self):
        category = self.request.query_params.get('category', None)
        min = self.request.query_params.get('min', 0)
        max = self.request.query_params.get('max', 500)
        print(category, min, max)
        if category is None or category == 'all':
            return Item.objects.filter(price__range=(min, max))
        products = Item.objects.filter(category=category, price__range=(min, max))
        return products
