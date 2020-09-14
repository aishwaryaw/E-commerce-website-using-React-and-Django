from django.shortcuts import render, get_object_or_404, redirect
from django.contrib import messages
from django.utils import timezone
from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.exceptions import ObjectDoesNotExist
from django.views.generic import ListView, DetailView, View
from core.models import Item, OrderItem, Order, Address, Coupon, Payment, Refund, UserProfile
from .forms import CheckoutForm, CouponForm, PaymentForm, RefundForm
import random
import string
import stripe
# Create your views here.

stripe.api_key = settings.STRIPE_SECRET_KEY

def create_ref_code():
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=20))


class HomeView(ListView):
    model = Item
    paginate_by=10
    template_name = 'home-page.html'


# class view
#  class ItemDetailView(DetailView):
#     model = Item
#     template_name = 'product.html'
# in urls = use a ItemDetailView.as_view()
  

def ItemDetailView(request, slug):
    # model = Item
    # template_name = 'product.html'
  
    item = get_object_or_404( Item, slug = slug)
    items = Item.objects.filter(category=item.category).exclude(slug=slug)
    context = {
            'object' : item,
            'items' : items
        }
    return render(request, "product.html", context)



@login_required
def add_to_cart(request , slug):
    item = get_object_or_404(Item, slug=slug)
    order_item, created = OrderItem.objects.get_or_create(
        item=item,
        user=request.user,
        ordered=False
    )
    order_qs = Order.objects.filter(user=request.user, ordered=False)
    if order_qs.exists():
        order = order_qs[0]
         # check if the order item is in the order
        if order.items.filter(item__slug=slug).exists():
            order_item.quantity += 1
            order_item.save()
            messages.info(request, "This item quantity was updated successfully")
            return redirect("core:order-summary")
        
        else:
            order.items.add(order_item)
            messages.info(request, "This item was added to your cart")
            return redirect("core:order-summary")

    else:
        ordered_date = timezone.now()
        order = Order.objects.create(
            user=request.user,
            ordered_date=ordered_date,
        )
        order.items.add(order_item)
        messages.info(request, "This item was added to your cart.")
        return redirect("core:order-summary")


@login_required
def remove_from_cart(request, slug):
    item = get_object_or_404(Item, slug=slug)
    order_qs = Order.objects.filter(
        user=request.user,
        ordered=False,
    )

    if order_qs.exists():
        order = order_qs[0]
         # check if the order item is in the order
        if order.items.filter(user=request.user, item__slug = slug ).exists():
            order_item = OrderItem.objects.filter(
                user=request.user,
                ordered=False,
                item = item
            )[0]
            order.items.remove(order_item)
            order_item.delete()
            messages.info(request, "Item has been deleted from your cart")
            return redirect("core:order-summary")
        
        else:
            messages.info(request, "This item was not in your cart")
            return redirect("core:product", slug=slug)
        
    else:
        messages.info(request, "You do not have an active order")
        return redirect("core:product", slug=slug)


@login_required
def remove_single_item_from_cart(request,slug):
    item = get_object_or_404(Item, slug=slug)
    order_qs = Order.objects.filter(
        user=request.user,
        ordered=False,
    )

    if order_qs.exists():
        order = order_qs[0]
         # check if the order item is in the order
        if order.items.filter(item__slug=slug).exists():
            order_item = OrderItem.objects.filter(
                item = item,
                user = request.user,
                ordered=False
            )[0]

            if order_item.quantity > 1 :
                order_item.quantity -= 1
                order_item.save()
            else:
                order.items.remove(order_item)
                order_item.delete()
                
            messages.info(request,"This item quantity was updated")
            return redirect("core:order-summary")

        else:
            messages.info("core:order-summary", "This item was not in your cart")
            return redirect("core:product", slug=slug)
    else:
        messages.info(request, "You do not have an active order")
        return redirect("core:product", slug=slug)

        

class OrderSummaryView(LoginRequiredMixin, View):
    def get(self, *args, **kwargs):
        try:
            order = Order.objects.get(user=self.request.user, ordered=False)
            # order = order_qs[0]
            # order_items = order.items.all()
            # order_items
            context = {
                'object' : order
            }
            # print(order_items)
            return render(self.request, 'orderSummary.html' , context)

        except ObjectDoesNotExist:
            messages.warning(self.request, "You do not have an active order")
            return redirect("/")

def is_valid_form(values):
    for field in values:
        if field == '':
            return False
        return True


class CheckoutView(LoginRequiredMixin, View):
    def get(self, *args, **kwargs):
        try :
            order = Order.objects.get(user=self.request.user, ordered=False)
            if order.items.count() == 0:
                messages.info(self.request, "You don't have items in your cart")
                return redirect("core:home")

            form = CheckoutForm()
            context = {
                'form' : form,
                'order': order,
                'couponform' : CouponForm(),
                'display_coupon_form' : True
            }

            shipping_address_qs = Address.objects.filter(
                user=self.request.user,
                default=True,
                address_type= 'S'
            )

            if shipping_address_qs.exists():
                context.update(
                   { 'default_shipping_address': shipping_address_qs[0] }
                )

            billing_address_qs = Address.objects.filter(
                user=self.request.user,
                default=True,
                address_type= 'B'
            )

            if billing_address_qs.exists():
                context.update(
                   { 'default_billing_address' : billing_address_qs[0] }
                )
            return render(self.request, "checkout-page.html", context)


        except ObjectDoesNotExist:
            messages.warning(self.request, "You don't have an active order")
            return redirect("core:home")


    def post(self, *args, **kwargs):
        form = CheckoutForm(self.request.POST or None)
        try:
            order = Order.objects.get(user=self.request.user, ordered=False)
            if form.is_valid():

                use_default_shipping = form.cleaned_data.get(
                    'use_default_shipping'
                )

                if use_default_shipping:
                    print("using the default shipping address")
                    address_qs = Address.objects.filter(
                        user = self.request.user,
                        default=True,
                        address_type = 'S',
                    )
                    if address_qs.exists():
                        shipping_address = address_qs[0]
                        order.shipping_address = shipping_address
                        order.save()
                    else:
                        messages.info(self.request, "You do not have a default shipping address")
                        return redirect('core:checkout')

                else:
                    print('User is entring new shipping address')
                    shipping_address1 = form.cleaned_data.get('shipping_address')
                    shipping_address2 = form.cleaned_data.get('shipping_address2')
                    shipping_country = form.cleaned_data.get('shipping_country')
                    shipping_zip = form.cleaned_data.get('shipping_zip')

                    if is_valid_form([shipping_address1, shipping_country, shipping_zip]):
                        shipping_address = Address.objects.create(
                            user= self.request.user,
                            street_address=shipping_address1,
                            apartment_address= shipping_address2,
                            country= shipping_country,
                            zip=shipping_zip,
                            address_type='S'       
                        )

                        order.shipping_address = shipping_address
                        order.save()

                        set_default_shipping = form.cleaned_data.get(
                            'set_default_shipping'
                        )
                        if set_default_shipping:
                            shipping_address.default = True
                            shipping_address.save()

                    else:
                        messages.info(self.request, "Please fill in the required shipping address fields")


                use_default_billing = form.cleaned_data.get(
                    'use_default_billing'
                )
                use_same_billing = form.cleaned_data.get(
                    'same_billing_address'
                )

                if use_same_billing:
                    print("Using same billing address as shipping address")
                    billing_address = shipping_address
                    billing_address.address_type = 'B'
                    billing_address.pk = None
                    billing_address.save()
                    order.billing_address = billing_address
                    order.save()
                
                elif use_default_billing:
                    print("Using same default billing address")
                    address_qs = Address.objects.filter(
                        user=self.request.user,
                        address_type='B',
                        default=True
                    )
                    if address_qs.exists():
                        billing_address = address_qs[0]
                        order.billing_address = billing_address
                        order.save()
                    else:
                        messages.info(self.request, "You don't have a default billing address")
                        return redirect("core:checkout")

                else:
                    print("User entering new billing address")
                    billing_address1 = form.cleaned_data.get('billing_address')
                    billing_address2 = form.cleaned_data.get('billing_address2')
                    billing_country = form.cleaned_data.get('billing_country')
                    billing_zip = form.cleaned_data.get('billing_zip')

                    if is_valid_form([billing_address1, billing_country, billing_zip]):
                        billing_address = Address(
                            user=self.request.user,
                            street_address=billing_address1,
                            apartment_address=billing_address2,
                            country= billing_country,
                            zip = billing_zip,
                            address_type = 'B'
                        )

                        billing_address.save()
                        order.billing_address= billing_address
                        order.save()

                        set_default_billing = form.cleaned_data.get('set_default_billing')
                        if set_default_billing:
                            billing_address.default = True
                            billing_address.save()
                    
                    else:
                        messages.info(self.request, "Please fill in the required billing address fields")
                
                payment_option = form.cleaned_data.get('payment_option')
                if payment_option == 'S':
                    messages.info(self.request, "You selected stripe as payment option")
                    return redirect('core:payment', payment_option='stripe')
                
                elif payment_option == 'P':
                    return redirect('core:payment', payment_option='paypal')
                else:
                    messages.warning(
                        self.request, "Invalid payment option selected")
                    return redirect('core:checkout')
            else:
                messages.info(self.request, "Form is not valid")
                return redirect("core:checkout")

        except ObjectDoesNotExist:
            messages.warning(self.request, "You do not have an active order")
            return redirect("core:order-summary")

    

class CouponView(LoginRequiredMixin,View):
    def post(self, *args, **kwargs):
        form = CouponForm(self.request.POST or None)
        if form.is_valid():
            try:
                code = form.cleaned_data.get('code')
                order = Order.objects.get(
                    user=self.request.user,
                    ordered=False
                )
                try:
                    coupon = Coupon.objects.get(code=code)
                    order.coupon = coupon
                    order.save()
                    messages.info(self.request, "Successfully added coupon")
                    return redirect('core:checkout')

                except ObjectDoesNotExist:
                    messages.warning(self.request, "This coupon does not exist")
                    return redirect("core:checkout")
                 

            except ObjectDoesNotExist:
                messages.warning(self.request, "You do not have an active order")
                return redirect("core:checkout")



class PaymentView(LoginRequiredMixin, View):

    def get(self, *args, **kwargs):
        try:
            order = Order.objects.get(user=self.request.user, ordered=False)
            if order.items.count() == 0:
                messages.info(self.request, "You don't have items in your cart")
                return redirect("core:home")

            elif order.billing_address:
                context = {
                    'display_coupon_form' : False,
                    'STRIPE_PUBLIC_KEY' : settings.STRIPE_PUBLIC_KEY,
                    'order' : order
                }

                userprofile = self.request.user.userprofile
                if userprofile.one_click_purchasing:
                    # fetch the users card list
                    cards = stripe.Customer.list_sources(
                        userprofile.stripe_customer_id,
                        limit = 3,
                        object = 'card'
                    )

                    card_list = cards['data']
                    if len(card_list) >  0 :
                        # update the context with the default card
                        context.update({
                            'card' : card_list[0]
                        })
                return render(self.request, "payment.html", context)

            else:
                messages.info(self.request, "You do not have a billing address")
                return redirect("core:checkout")
        
        except ObjectDoesNotExist:
            messages.warning(self.request, "You don't have an active order")
            return redirect("core:home")


    def post(self, *args, **kwargs):
        order = Order.objects.get(user= self.request.user , ordered=False)
        userprofile = self.request.user.userprofile
        form = PaymentForm(self.request.POST or None)
        if form.is_valid():
            save = form.cleaned_data.get('save')
            use_default = form.cleaned_data.get('use_default')
            stripetoken = form.cleaned_data.get('stripeToken')

            if save :
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
            
                if save or use_default:

                    # charge the customer because we cannot charge the token more than once
                    charge = stripe.PaymentIntent.create(
                        amount = amount,
                        currency = "usd",
                        description = "Payment"
                    )

                else:
                    print(stripetoken)
                    # charge once of the token
                    charge = stripe.PaymentIntent.create(
                        amount = amount,
                        currency = "usd",
                        description = "Payment"                
                    )
                    # print(charge)
                                        
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
                order.ref_code = create_ref_code()
                order.save()

                messages.success(self.request, "Your order was successful!")
                return redirect("/")

            except stripe.error.CardError as e:
                body = e.json_body
                err = body.get('error', {})
                messages.warning(self.request, f"{err.get('message')}")
                return redirect("/")

            except stripe.error.RateLimitError as e:
                # Too many requests made to the API too quickly
                messages.warning(self.request, "Rate limit error")
                return redirect("/")

            except stripe.error.InvalidRequestError as e:
                # Invalid parameters were supplied to Stripe's API
                print(e)
                messages.warning(self.request, "Invalid parameters")
                return redirect("/")

            except stripe.error.AuthenticationError as e:
                # Authentication with Stripe's API failed
                # (maybe you changed API keys recently)
                messages.warning(self.request, "Not authenticated")
                return redirect("/")

            except stripe.error.APIConnectionError as e:
                # Network communication with Stripe failed
                messages.warning(self.request, "Network error")
                return redirect("/")

            except stripe.error.StripeError as e:
                # Display a very generic error to the user, and maybe send
                # yourself an email
                messages.warning(
                    self.request, "Something went wrong. You were not charged. Please try again.")
                return redirect("/")

            except Exception as e:
                # send an email to ourselves
                print(e)
                messages.warning(
                    self.request, "A serious error occurred. We have been notifed.")
                return redirect("/")

        messages.warning(self.request, "Invalid data received")
        return redirect("/payment/stripe/")



class RefundView(LoginRequiredMixin, View):
    def get(self, *args, **kwargs):
        form = RefundForm()
        context = {
            'form' : form
        }
        return render(self.request, "refund.html", context)

    def post(self, *args,**kwargs):
        form = RefundForm(self.request.POST or None)
        if form.is_valid():
            ref_code = form.cleaned_data.get('ref_code')
            message = form.cleaned_data.get('message')
            email = form.cleaned_data.get('email')
            try:
                order = Order.objects.get(ref_code = ref_code)
                if not order.refund_granted:
                    if not order.refund_requested:
                        order.refund_requested = True
                        order.save()

                        # store the refund
                        refund = Refund.objects.create(order=order, email=email, reason=message)
                        messages.info(self.request, "Your request was recieived")
                        return redirect("core:request-refund")
                    else:
                        messages.info(self.request, "Your request has already been registered")
                        return redirect("core:request-refund")
                        
                else:
                    messages.info(self.request, "Your request has already been granted")
                    return redirect("core:request-refund")

            except ObjectDoesNotExist:
                messages.warning(self.request, "Order with given ref code is not found")
                return redirect("core:request-refund")









    





                


















