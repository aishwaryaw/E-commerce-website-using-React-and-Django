from core.models import Order, Coupon, OrderItem, Item, Variation, ItemVariation, Address, Payment, Coupon
from rest_framework import serializers
from django_countries.serializer_fields import CountryField

 
class VariationDetailSerializer(serializers.ModelSerializer):
    item = serializers.SerializerMethodField()
    class Meta:
        model = Variation
        fields = (
            'id',
            'name',
            'item'
        )

    def get_item(self,obj):
        return ItemSerializer(obj.item).data


class ItemVariationDetailSerializer(serializers.ModelSerializer):
    variation = serializers.SerializerMethodField()
    class Meta:
        model = ItemVariation
        fields = (
            'id',
            'value',
            'attachment',
            'variation'
        )
    def get_variation(self, obj):
        return VariationDetailSerializer(obj.variation).data


class ItemSerializer(serializers.ModelSerializer):
    category = serializers.SerializerMethodField()
    label = serializers.SerializerMethodField()
    class Meta:
        model = Item
        fields = (
            'id',
            'title',
            'category',
            'label',
            'slug',
            'price',
            'description',
            'discount_price',
            'image'
        )
    def get_category(self, obj):
        return obj.get_category_display()
    
    def get_label(self, obj):
        return obj.get_label_display()
    


class OrderItemSerializer(serializers.ModelSerializer):
    item = serializers.SerializerMethodField()
    final_price = serializers.SerializerMethodField()
    item_variations = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = (
            'id',
            'item',
            'quantity',
            'final_price',
            'item_variations'
        )

    def get_final_price(self, obj):
        return obj.get_final_price()

    def get_item(self, obj):
        return ItemSerializer(obj.item).data
    
    def get_item_variations(self, obj):
        return ItemVariationDetailSerializer(obj.item_variations.all(), many= True).data



class OrderSerializer(serializers.ModelSerializer):
    order_items = serializers.SerializerMethodField()
    total = serializers.SerializerMethodField()
    coupon = serializers.SerializerMethodField()
    class Meta:
        model = Order
        fields = (
            'id',
            'order_items',
            'coupon',
            'total',
            'ordered_date'
        )
    def get_total(self, obj):
        return obj.get_total_price()

    def get_order_items(self, obj):
        return OrderItemSerializer(obj.items.all(), many= True).data

    def get_coupon(self, obj):
        if obj.coupon is not None:
            return CouponSerializer(obj.coupon).data
        return None



class ItemVariationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemVariation
        fields = (
            'id',
            'value',
            'attachment'
        )


class VariationSerializer(serializers.ModelSerializer):
    item_variations = serializers.SerializerMethodField()

    class Meta:
        model = Variation
        fields = (
            'id',
            'name',
            'item_variations'
        )

    def get_item_variations(self, obj):
        return ItemVariationSerializer(obj.itemvariation_set.all(), many=True).data


class ItemDetailSerializer(serializers.ModelSerializer):
    category = serializers.SerializerMethodField()
    label = serializers.SerializerMethodField()
    variations = serializers.SerializerMethodField()

    class Meta:
        model = Item
        fields = (
            'id',
            'title',
            'category',
            'label',
            'slug',
            'price',
            'description',
            'discount_price',
            'image',
            'variations'
        )
    def get_category(self, obj):
        return obj.get_category_display()
    
    def get_label(self, obj):
        return obj.get_label_display()

    def get_variations(self, obj):
        return VariationSerializer(obj.variation_set.all(), many= True).data


class AddressSerializer(serializers.ModelSerializer):
    country = CountryField()
    class Meta:
        model = Address
        fields = (
            'id',
            'user',
            'street_address',
            'apartment_address',
            'zip',
            'address_type',
            'country',
            'default'
        )


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = (
            'id',
            'amount',
            'timestamp'
        )

class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = (
            'id',
            'amount',
            'code'
        )
   