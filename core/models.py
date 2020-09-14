from django.db import models
from django.shortcuts import reverse
from django.conf import settings
from django_countries.fields import CountryField
from django.db.models.signals import post_save
# Create your models here.

CATEGORY_CHOICES = (
    ('S','Shirt'),
    ('SW', 'Sport wear'),
    ('OW', 'Outwear')
)

LABEL_CHOICES = (
    ('P','primary'),
    ('S','secondary'),
    ('D','danger')
)

ADDRESS_CHOICES = (
    ('B', 'Billing Address'),
    ('S', 'Shipping Address')
)

class Item(models.Model):
    title = models.CharField(max_length=100)
    category = models.CharField(choices=CATEGORY_CHOICES, max_length=2)
    label = models.CharField(choices=LABEL_CHOICES, max_length=1)
    slug = models.SlugField()
    price = models.FloatField()
    description = models.TextField(blank=True, null=True)
    discount_price = models.FloatField(blank=True, null=True)
    image = models.ImageField()

    def __str__(self):
        return self.title

    def get_absolute_url(self):
        return reverse("core:product", kwargs={
            'slug':self.slug
        })

    def get_add_to_cart_url(self):
        return reverse("core:add-to-cart", kwargs={
            'slug':self.slug
        })
    def get_remove_from_cart_url(self):
        return reverse("core:remove-from-cart", kwargs={
            'slug':self.slug
        })
    
   
class OrderItem(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    ordered = models.BooleanField(default=False)
    item_variations = models.ManyToManyField('ItemVariation')

    def __str__(self):
        return f"{self.quantity} of {self.item.title}"

    def get_total_item_price(self):
        return self.quantity * self.item.price

    def get_discount_total_item_price(self):
        return self.quantity * self.item.discount_price

    def get_amount_saved(self):
        return self.get_total_item_price() - self.get_discount_total_item_price()

    def get_final_price(self):
        if self.item.discount_price:
            return self.get_discount_total_item_price()
        return self.get_total_item_price()



class Order(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    items = models.ManyToManyField(OrderItem)
    ref_code = models.CharField(max_length=20, blank=True, null=True)
    start_date = models.DateField(auto_now_add=True)
    ordered_date= models.DateField()
    ordered = models.BooleanField(default=False)
    being_delivered = models.BooleanField(default=False)
    received = models.BooleanField(default=False)
    refund_requested = models.BooleanField(default=False)
    refund_granted = models.BooleanField(default=False) 
    coupon = models.ForeignKey('Coupon' ,on_delete=models.CASCADE,blank=True, null=True )
    shipping_address = models.ForeignKey('Address', related_name='shipping_address', on_delete=models.SET_NULL, blank=True, null=True )
    billing_address = models.ForeignKey('Address', related_name='billing_address', on_delete=models.SET_NULL, blank=True, null=True )
    payment = models.ForeignKey('Payment', on_delete=models.SET_NULL, blank=True, null=True)

    def __str__(self):
        return self.user.username
    
    def get_total_price(self):
        total = 0
        for item in self.items.all():
            total = total + item.get_final_price()
        if self.coupon:
            total -= self.coupon.amount
        return total


class Coupon(models.Model):
    code = models.CharField(max_length=15)
    amount = models.FloatField()

    def __str__(self):
        return self.code
    

class Address(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    street_address = models.CharField(max_length=100)
    apartment_address = models.CharField(max_length=100)
    country = CountryField(multiple = False)
    zip = models.CharField(max_length=100)
    address_type = models.CharField(max_length=1, choices=ADDRESS_CHOICES)
    default = models.BooleanField(default=False)

    def __str__(self):
        return self.user.username

    class Meta:
        verbose_name_plural = 'Addresses'


class Payment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, blank=True, null=True)
    stripe_charge_id = models.CharField(max_length=50)
    amount = models.FloatField()
    timestamp = models.DateField(auto_now_add=True)

    def __str__(self):
        return self.user.username


class Refund(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    email = models.EmailField()
    accepted = models.BooleanField(default=False)
    reason = models.TextField()

    def __str__(self):
        return f"{self.pk}"


class UserProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    stripe_customer_id = models.CharField(max_length=50, blank=True, null=True)
    one_click_purchasing = models.BooleanField(default=False)

    def __str__(self):
        return self.user.username


def userprofile_reciever(sender, instance ,created, *args , **kwargs):
    if created:
        userprofile = UserProfile.objects.create(user=instance)


post_save.connect(userprofile_reciever, sender = settings.AUTH_USER_MODEL)


class Variation(models.Model):
    name = models.CharField(max_length=50)
    item = models.ForeignKey(Item, on_delete=models.CASCADE)

    class Meta :
        unique_together = (
            ('item', 'name')
        )
    def __str__(self):
        return self.name


class ItemVariation(models.Model):
    value = models.CharField(max_length=50)
    attachment = models.ImageField(blank=True)
    variation = models.ForeignKey(Variation, on_delete=models.CASCADE)

    class Meta:
        unique_together = (
            ('variation', 'value')
        )
    def __str__(self):
        return self.value
    

