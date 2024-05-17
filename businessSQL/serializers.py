from rest_framework import serializers
from .models import Item, Category, Customer, Order, Detail, Topping, Detail_Topping

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['cagid', 'cagname'] 


class ItemSerializer(serializers.ModelSerializer):
    cag_name = serializers.CharField(source='cag_id.cagname')  # Specify the source of the field
    
    class Meta:
        model = Item
        fields = ['itemid', 'cag_name', 'cag_id','itemname', 'itemprice', 'itemnote']  # Include the fields you want to serialize
 

class ToppingSerializer(serializers.ModelSerializer):
    cag_name = serializers.CharField(source='cag_id.cagname')  # Specify the source of the field
    topquality = serializers.IntegerField(default=1)
    top_name = serializers.CharField(source='topname')
    top_id = serializers.IntegerField(source='topid')
    
    class Meta:
        model = Topping
        fields = ['top_id', 'cag_name', 'cag_id', 'top_name', 'topprice', 'topquality']  # Include the fields you want to serialize

#Detail Topping
class DetailToppingSerializer(serializers.ModelSerializer):
    top_name = serializers.CharField(source='top_id.topname')
    class Meta:
        model = Detail_Topping
        fields = ['detailtopid', 'detail_id', 'top_id', 'top_name', 'topprice', 'topquality']
  
class DetailSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source='item_id.itemname')
    cag_name = serializers.CharField(source='item_id.cag_id')  
    cag_id = serializers.CharField(source='item_id.cag_id.cagid')  
    toppings = serializers.SerializerMethodField()
    
    class Meta:
        model = Detail 
        fields = ['detailid', 'or_id', 'item_id', 'item_name','cag_id','cag_name','detailnote', 'detailquality', 'firm_price', 'toppings']  # Include the fields you want to serialize
    
    def get_toppings(self, instance): 
        toppings = instance.detail_topping_set.all()
        serializer = DetailToppingSerializer(toppings, many=True)
        return serializer.data  
        
class OrderSerializer(serializers.ModelSerializer): 
    details = serializers.SerializerMethodField()
    cus_name = serializers.CharField(source='cus_id.cusname')
    total_price = serializers.SerializerMethodField()
    
    class Meta:
        model = Order 
        fields = ['orid', 'cus_id', 'cus_name','ordate', 'orpickup', 'orextraprice', 'ispickup', 'total_price', 'details'] 
        ordering = ['-orid'] 
    
    def get_total_price(self, instance):
        details = instance.detail_set.all()
        
        total_price = 0 
        for detail in details:
            detail_price = detail.firm_price * detail.detailquality
            for topping in detail.detail_topping_set.all():
                detail_price += topping.topprice * topping.topquality 
            total_price += detail_price
            
        # total_price = sum((detail.firm_price * detail.detailquality) for detail in details)
        return total_price
    
    def get_details(self, instance):
        details = instance.detail_set.all().order_by('detailid')  # Sort details by detailid, first come first shows
        serializer = DetailSerializer(details, many=True)
        return serializer.data  