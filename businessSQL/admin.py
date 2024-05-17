from typing import Any
from django.contrib import admin
from .models import Category   
from .models import Customer
from .models import Item  
from .models import Order
from .models import Detail
from .models import Topping
from .models import Detail_Topping
from django import forms

class CustomerAdmin(admin.ModelAdmin):
    list_display = ('cusname', 'cusphone')  # S
    
    def get_form(self, request, obj=None, **kwargs) :
        form = super().get_form(request, obj, **kwargs)
        form.base_fields['cusphone'].required = False
        form.base_fields['cusnote'].required = False
        return form
    
class ItemAdmin(admin.ModelAdmin):
    list_display = ('cag_id','itemname','itemprice')

class ToppingAdmin(admin.ModelAdmin):
    list_display = ('cag_id','topname','topprice')
    
class DetailToppingInline(admin.TabularInline):
    model = Detail_Topping
    extra = 0
    def get_formset(self, request, obj=None, **kwargs):
        formset = super().get_formset(request, obj, **kwargs)
        if obj:  # obj will be the Detail instance
            item_category_id = obj.item_id.cag_id_id
            formset.form.base_fields['top_id'].queryset = formset.form.base_fields['top_id'].queryset.filter(cag_id_id=item_category_id)
        return formset

    
class DetailInline(admin.TabularInline):
    model = Detail
    extra = 0
    inlines = [DetailToppingInline]
 
class DetailToppingAdmin(admin.ModelAdmin):
    list_display = ('detailtopid','detail_id','top_id','topprice','topquality')
      
class OrderAdmin(admin.ModelAdmin):
    list_display = ('cus_id','orpickup','ordate','ispickup')
    inlines = [DetailInline] 

    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        form.base_fields['orpickup'].required = False
        form.base_fields['orextraprice'].required = False
        return form

class DetailAdmin(admin.ModelAdmin):
    list_display = ('or_id','or_id_with_ordate','item_id','detailquality','detailid')
    inlines = [DetailToppingInline]  # Include the inline here
    
    def or_id_with_ordate(self, obj):
        return obj.or_id.ordate
    or_id_with_ordate.short_description = 'Order with Date'  
    
    def get_form(self, request, obj=None, **kwargs) :
        form = super().get_form(request, obj, **kwargs)
        form.base_fields['detailnote'].required = False
        return form
 
    
    
    
    
# Register your models here.
admin.site.register(Category) 
admin.site.register(Customer, CustomerAdmin) 
admin.site.register(Item,ItemAdmin) 
admin.site.register(Topping, ToppingAdmin)
admin.site.register(Order,OrderAdmin) 
admin.site.register(Detail,DetailAdmin) 
admin.site.register(Detail_Topping, DetailToppingAdmin)
