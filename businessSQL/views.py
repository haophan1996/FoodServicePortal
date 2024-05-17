from .models import Customer, Category, Item, Order, Detail, Topping, Detail_Topping
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions 
from .serializers import ItemSerializer, ToppingSerializer,  CategorySerializer, CustomerSerializer, OrderSerializer, DetailSerializer
from django.db.models import Sum, F, Count, DecimalField
from django.utils import timezone
from datetime import datetime
import json, pprint
from django.db.models.functions import Coalesce, Lower
from decimal import Decimal 
from django.db import connection

pp = pprint.PrettyPrinter(indent=3)

# Get all customer name, id, phone, note
class GetALLCustomer(APIView):
    # permission_classes = (permissions.AllowAny, )
    
    def get(self, request, format=None): 
        try:
            customers = Customer.objects.all()
            serializer = CustomerSerializer(customers, many = True)
            
            return Response({'success': serializer.data})
        except:
            return Response({'error': 'Something went wrong when Get All Customer'})


class UpdateCustomer(APIView):
    
    def post(self, request, format=None):
        try:
            data = self.request.data 
            id = data.get('cusid', None)
            name = data.get('cusname', None)
            
            if name == None or len(name) == 0:
                return Response({'error': 'Please check customer Name'}) 
            
            if id != None and id < 0: 
                Customer.objects.get(pk=-id).delete()
                return Response({'sucessdelete': f'Removed Customer with id {-id}'})
                
            item, created = Customer.objects.update_or_create(
                cagid=id,
                defaults={ 'cusname':name }
            ) 
            
            serializer = CustomerSerializer(item)
            return Response({'success': serializer.data})
        except Exception as e:
            return Response({'error': f"Something went wrong when Update Customer. {e}"})

# Get all name, id
class GetAllCategory(APIView):
    # permission_classes = (permissions.AllowAny, ) 
    
    def get(self, request, format=None): 
        try:
            categories = Category.objects.all().order_by(Lower('cagname'))
            serializer = CategorySerializer(categories, many=True)
            return Response({'success': serializer.data})
        except:
            return Response({'error': 'Something went wrong when Get All Category'})
        
class UpdateCategory(APIView):
    permission_classes = (permissions.AllowAny, ) 
    
    def post(self, request, format=None):
        try:
            data = self.request.data 
            id = data.get('cagid', None)
            name = data.get('cagname', None)
            
            if name == None or len(name) == 0:
                return Response({'error': 'Please check cagtegory Name'}) 
            
            if id != None and id < 0: 
                Category.objects.get(pk=-id).delete()
                return Response({'sucessdelete': f'Removed category with id {-id}'})
                
            item, created = Category.objects.update_or_create(
                cagid=id,
                defaults={
                    'cagname':name
                }
            ) 
            
            serializer = CategorySerializer(item)
            return Response({'success': serializer.data})
        except Exception as e:
            return Response({'error': f"Something went wrong when Update Category. {e}"})
    
class GetAllItem(APIView):
    # permission_classes = (permissions.AllowAny, ) 
    
    def get(self, request, format=None): 
        try:  
            items = Item.objects.all().order_by('cag_id__cagname', 'itemname') 
            serializer = ItemSerializer(items, many=True)
            return Response({'success': serializer.data})
        except:
            return Response({'error': 'Something went wrong when Get All Item'})
        
    def post(self, request, fomat=None):
        try:
            details = self.request.data 
            items = Item.objects.all().order_by('cag_id__cagname', 'itemname') 
            serializer = ItemSerializer(items, many=True) 
            if details != None:
                print(details)
                item_ids = set(detail['item_id'] for detail in details if detail['or_id'] != -1)
                 
                for serialized_item in serializer.data:
                    serialized_item['isSelected'] = serialized_item['itemid'] in item_ids
            
            return Response({'success': serializer.data, 'itemid': item_ids})
        except Exception as e:
            return Response({'error': f'Something went wrong when Get Item {e}'})

class UpdateItem(APIView):
    permission_classes = (permissions.AllowAny, ) 
    
    def post(self, request, format=None):
        try:
            data = self.request.data 
            id = data.get('itemid', None)
            cag_id = data.get('cag_id', None)
            name = data.get('itemname', None)
            price = data.get('itemprice', None)
             
            if id != None and id < 0: 
                Item.objects.get(pk=-id).delete() 
                return Response({'success': f'Removed item with id {-id}'})
            
            if name == None or len(name) == 0:
                return Response({'error': 'Please check item name'})
            elif cag_id == None:
                return Response({'error': 'Please include cag_id'})
            elif price == None:
                return Response({'error': 'Please check Item Price'})
            
            if price != None:
                price = Decimal(price)
                if price < 0:
                    return Response({'error': 'Itemprice must not be negative'})
                    
            cagtegory_instance = Category.objects.get(pk=cag_id)
            
            item, created = Item.objects.update_or_create(
                itemid=id,
                defaults={
                    'cag_id': cagtegory_instance,
                    'itemname': name,
                    'itemprice': price
                }
            ) 
             
            serializer = ItemSerializer(item) 
            return Response({'success': serializer.data})
        except Exception as e:
            return Response({'error': f"Something went wrong when Update Item. {e}"})
        
class GetAllTopping(APIView):
    permission_classes = (permissions.AllowAny, )

    def get(self, request, format=None):
        try: 
            toppings = Topping.objects.all()
            serializer = ToppingSerializer(toppings, many=True)

            grouped_data = {}
            for item in serializer.data:
                cag_id = item['cag_id']
                if cag_id not in grouped_data:
                    grouped_data[cag_id] = []
                grouped_data[cag_id].append(item)

            return Response({'success': grouped_data}) 
        except:
            return Response({'error': 'Something went wrong when Get All Topping'})
        
class GetAllToppingWithoutSub(APIView):
    permission_classes = (permissions.AllowAny, )

    def get(self, request, format=None):
        try: 
            toppings = Topping.objects.all().order_by('topname')
            serializer = ToppingSerializer(toppings, many=True)  
            return Response({'success': serializer.data}) 
        except Exception as e:
            return Response({'error': f'Something went wrong when Get All Topping With Out Sub. {e}'})

class UpdateTopping(APIView):
    permission_classes = (permissions.AllowAny, ) 
    
    def post(self, request, format=None):
        try:
            data = self.request.data 
            id = data.get('top_id', None)
            cag_id = data.get('cag_id', None)
            name = data.get('top_name', None)
            price = data.get('topprice', None)
            
            if id != None and id < 0: 
                Topping.objects.get(pk=-id).delete() 
                return Response({'success': f'Removed topping with id {-id}'})
            
            if name == None or len(name) == 0:
                return Response({'error': 'Please check Topping Name'})
            elif cag_id == None:
                return Response({'error': 'Please include cag_id'})
            elif price == None:
                return Response({'error': 'Please check Topping Price'})
             
            if price != None: 
                price = Decimal(price)
                if price < 0:
                    return Response({'error': 'Topprice must not be negative'})
                    
            cagtegory_instance = Category.objects.get(pk=cag_id)
            
            topping, created = Topping.objects.update_or_create(
                topid=id,
                defaults={
                    'cag_id': cagtegory_instance,
                    'topname': name,
                    'topprice': price
                }
            ) 
             
            serializer = ToppingSerializer(topping) 
            return Response({'success': serializer.data})
        except Exception as e:
            return Response({'error': f"Something went wrong when Update Item. {e}"})
        
class GetAllOrder(APIView):
    # permission_classes = (permissions.AllowAny, )

    def get_order_details_view_by_date(self,date=None):
        with connection.cursor() as cursor:
            cursor.execute("SELECT get_order_details(%s) as result",[date])
            row = cursor.fetchone()
            return row[0]
            
    def get(self, request, date=None, format=None):
        try:     
            ## query by django
            # orders = Order.objects.all().order_by('orid') 
            # serializer = OrderSerializer(orders, many=True)
            # return Response({'success': serializer.data})
            if date:
                data = self.get_order_details_view_by_date(date=date)  
            else:  
                data = self.get_order_details_view_by_date()
            return Response({'success': data})
        except Exception as e:
            return Response({'error': f'Something went wrong when Get Order {e}'})

# Get a list date 
class GetListDateOrder(APIView):
    # permission_classes = (permissions.AllowAny, ) 
    
    def get(self, request, format=None):
        today = timezone.now().date()
        isToday = False
        show = None
        closest_index = None
        try:   
            distinct_dates = Order.objects.order_by('ordate').values_list('ordate', flat=True).distinct()
            closest_date = min(distinct_dates, key=lambda d: abs(datetime.combine(d, datetime.min.time()) - datetime.combine(today, datetime.min.time())))
            show = closest_date 
            formatted_dates = []
            
            for i, date in enumerate(distinct_dates):
                formatted_dates.append({'date': date.strftime("%Y-%m-%d"), 'format_date': date.strftime("%b, %d, %Y")})
                if date.strftime("%Y-%m-%d") == str(today):
                    isToday = True
                    closest_index = i
                if not isToday: 
                    # Calculate the closest date
                    if date.strftime("%Y-%m-%d") == str(closest_date):
                        closest_index = i
                     

            return Response({'success': formatted_dates, 'show_format_date': str(show.strftime("%b, %d, %Y")), 'show_date': str(show), 'show_index': closest_index})
        except Exception as e:
            if str(e) == 'min() arg is an empty sequence':
                return Response({'empty': str(e)})
            else:
                return Response({'error': 'Something went wrong when getting the list of dates', 'details': str(e)})


class GetAllDetail(APIView):
    permission_classes = (permissions.AllowAny, ) 
    
    def get(self, request, format=None):
        try:  
            details = Detail.objects.all()
            serializer = DetailSerializer(details, many=True)
            return Response({'success': serializer.data})
        except:
            return Response({'error': 'Something went wrong when Get All Detail'})


# Get Total Item, Customer
class GetTotalDetail(APIView):
    permission_classes = (permissions.AllowAny, ) 
    
    def get(self, request, date, format=None):
        try:
            item_queryset = (
                Detail.objects
                .filter(or_id__ordate=date)
                .values('item_id__itemname', 'item_id__cag_id__cagname', 'firm_price')
                .annotate(
                    total_quality=Sum('detailquality'),
                    total_customers=Count('or_id__cus_id', distinct=True)
                )
                .order_by('-total_quality', 'item_id__itemname', 'item_id__cag_id__cagname')
            )
            
            topping_queryset = (
                Detail_Topping.objects
                .filter(detail_id__or_id__ordate=date)
                .values('top_id__topname', 'topprice')
                .annotate(
                    total_toppings_quality=Sum('topquality'),
                    total_customers=Count('detail_id__or_id__cus_id', distinct=True)
                )
                .order_by('top_id__topname')
            )
            
            result_list = []
            
            for item_data in item_queryset:
                item_info = {
                    'name': item_data['item_id__itemname'],
                    'category_name': item_data['item_id__cag_id__cagname'],
                    'firm_price': item_data['firm_price'],
                    'total_quality': item_data['total_quality'],
                    'total_customers': item_data['total_customers'],
                    'type': 'item'  # Indicates this is an item
                }
                result_list.append(item_info)
                
            for topping_data in topping_queryset:
                topping_info = {
                    'name': topping_data['top_id__topname'],
                    'firm_price': topping_data['topprice'],
                    'total_quality': topping_data['total_toppings_quality'],
                    'total_customers': topping_data['total_customers'],
                    'type': 'topping'  # Indicates this is a topping
                }
                result_list.append(topping_info)
            
            return Response({'success': result_list})
        except Exception as e: 
            return Response({'error': f"Something went wrong when Get Top sale item by date. {e}"})
    
# Get total price by date
class GetTotalPriceByDate(APIView):
    permission_classes = (permissions.AllowAny, ) 
    
    def get(self, request, date, format=None):
        try: 
            queryset = Detail.objects.filter(or_id__ordate=date)
             
            total_price_detail = queryset.aggregate(
                total_price=Sum( 
                    Coalesce(
                        F('detail_topping__topprice') * F('detail_topping__topquality'),
                        0
                    ),
                    output_field=DecimalField()
                )
            )['total_price']
            
            total_price_topping = queryset.aggregate(total_price=Sum(F('detailquality') * F('firm_price')))['total_price'] 
            
            total_price = total_price_detail + total_price_topping
             
            # total_price = queryset.aggregate(total_price=Sum(F('detailquality') * F('firm_price')))['total_price'] 
            return Response({'success': {'total_price': total_price}})
        except Exception as e: 
            return Response({'error': f"Something went wrong when Get Top sale item by date. {e}"})
        
# This will update order [Order date, isPickup, extraPrice, orPicup] [ Detail note, quanlity]
class UpdateOrder(APIView):
    # permission_classes = (permissions.AllowAny, ) 
    
    def post(self, request, format=None): 
        try:
            body = request.data
            orid = body.get('orid', None)
            
            '''Remove if order id is negative ID, also remove detail and detail_topping'''
            if orid == None:
                return Response({'error': 'Missing key [`orid`], please refresh website and try again!'})
            elif orid < 0:  
                order_instance = Order.objects.get(pk=-orid)
                order_instance.delete()
                return Response({'success_delete': f'Order removed {-orid}'})
            
            ordate = body.get('ordate', None)
            orpickup = body.get('orpickup', None)
            orextraprice = body.get('orporextrapriceickup', None)
            ispickup = body.get('ispickup', None)
            order_instance = Order.objects.get(pk=orid)
            
            if ordate == None:
                return Response({'error': 'Please check Date order. It is invalid'})
            else:
                Order.objects.filter(pk=orid).update(ordate=ordate, orpickup=orpickup, orextraprice=orextraprice, ispickup=ispickup)
            
            details = body.get('details', None)
            
            if details != None:
                for detail in details:
                    detail_id = detail.get('detailid',None)
                    
                    if detail_id != None and detail_id < 0:
                        '''Remove details and detail topping if details id is Negative id'''
                        detail_instance = Detail.objects.get(pk=-detail_id)
                        detail_instance.delete()
                        continue
                    
                    detail_note = detail.get('detailnote', None)
                    detail_quan = detail.get('detailquality', None)
                    detail_itemid = detail.get('item_id', None)
                     
                    
                    if detail_itemid == None:
                        return Response({'error': 'Item ID key missing, contact dev to check'})
                    if detail_quan < 1 or detail_quan == None:
                        return Response({'error': 'Item Quanlity is invalid, please check'}) 
                     
                    if detail_id == None:
                        print(detail)
                        '''Create item if detail id is None'''  
                        item_intance = Item.objects.get(pk=detail_itemid)
                        detail_instance = Detail.objects.create(
                            or_id=order_instance, 
                            item_id=item_intance,
                            detailnote=detail_note,
                            detailquality=detail_quan,
                            firm_price=item_intance.itemprice)   
                        
                        detail_toppings = detail.get('toppings', None) 
                        if detail_toppings != None:
                            self.update_topping(detail_toppings, detail_instance) 
                    else:
                        '''Update details'''
                        detail_instance = Detail.objects.get(pk=detail_id)
                        detail_instance.detailnote = detail_note
                        detail_instance.detailquality = detail_quan
                        detail_instance.save()
                        
                        detail_toppings = detail.get('toppings', None) 
                        if detail_toppings != None:
                            self.update_topping(detail_toppings, detail_instance) 
                       
            order = Order.objects.filter(orid=orid)
            serializer = OrderSerializer(order, many=True) 
            return Response({'success': serializer.data})
        except Exception as e:
            return Response({'error' : f'Something went wrong when Update Order. {e}'})
    
    def update_topping(self, toppings, detail_instance):
        for topping in toppings:
            top_id = topping.get('top_id',None)
            topquan = topping.get('topquality',None)
            detailtopid = topping.get('detailtopid', None)
            detail_id = topping.get('detail_id', None) 
            topping_intance = Topping.objects.get(pk=top_id)
            
            if detail_id == -1:
                '''if detail_id equal -1, meaning delete'''
                detail_topping_instance = Detail_Topping.objects.get(pk=detailtopid)
                detail_topping_instance.delete()
                continue
            
            '''Add/Update to detail_topping'''
            Detail_Topping.objects.update_or_create(
                detail_id=detail_instance, 
                top_id = topping_intance,
                defaults={
                    'topprice':topping_intance.topprice, 
                    'topquality':topquan
                })
         
class PostOrder(APIView):
    permission_classes = (permissions.AllowAny, ) 
    
    def post(self, request, format=None):
        try: 
            body = request.data 
            cus_id = body['cus_id']
            ordate = body['ordate']
            orpickup = body['orpickup'] 
            details = body['details']
            
            '''Check if customer already asign to order in specific date'''
            if cus_id != -1: 
                existing_orders = Order.objects.filter(cus_id=cus_id, ordate=ordate)
                if existing_orders.exists():
                    # orderSerializer = OrderSerializer(existing_orders, many=True)
                    return Response({'error': "This customer is already assigned. \nPlease do not duplicate orders or customers. \nYou can either change the customer's name or go to Orders to update."})
            else:
                '''Create customer if customer is not in database'''
                cus = Customer.objects.create(cusname=body['cus_name'])
                cus_id = cus.cusid
            
            '''Retrieve Customer id'''
            customer = Customer.objects.get(cusid=cus_id)
            
            '''Create order and assign customer id'''
            order = Order.objects.create(
                cus_id=customer, ordate=ordate, orpickup=orpickup )
            
            '''Retrieve Order id which is created'''
            orderid = Order.objects.get(pk=order.orid)
            for d in details:
                if d['item_id'] == None and len(d['detailquality']) == 0:
                    continue
                
                '''Retrieve Item id'''  
                itemid = Item.objects.get(pk=d['item_id']) 
                 
                '''Create detail using item id, order id as primary key'''
                detail = Detail.objects.create(
                    or_id=orderid, 
                    item_id=itemid,  
                    detailnote=d['detailnote'],  
                    detailquality=d['detailquality'],  
                    firm_price=itemid.itemprice 
                )
                 
                topping = d['toppings']
                for t in topping: 
                    detail_topping = Detail_Topping.objects.create(
                        detail_id=Detail.objects.get(pk=detail.detailid),
                        top_id=Topping.objects.get(pk=t['top_id']),
                        topprice=t['topprice'],
                        topquality=t['topquality']
                    )
                      
             
            return Response({'success': 'serializer.data'})
        except Exception as e: 
            
            return Response({'error' : f'Something went wrong when Post Order. {e}'})