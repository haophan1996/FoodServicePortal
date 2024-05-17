from django.db import models

# Create your models here.


class Customer(models.Model):
    cusid = models.AutoField(primary_key=True)
    cusname = models.CharField(max_length=255, verbose_name='Name / Nickname')
    cusphone = models.IntegerField(null=True, verbose_name='Phone number')
    cusnote = models.TextField(null=True, verbose_name='Note')

    class Meta:
        managed = False
        db_table = 'customer'
        
    def __str__(self):
        return self.cusname

class Category(models.Model):
    cagid = models.AutoField(primary_key=True)
    cagname = models.CharField(max_length=255)
    
    class Meta:
        managed = False
        db_table = 'category'
        
    def __str__(self) -> str:
        return self.cagname

class Item(models.Model):
    itemid = models.AutoField(primary_key=True)
    cag_id = models.ForeignKey(Category, db_column='cag_id',verbose_name='Category',on_delete=models.PROTECT)
    itemname = models.CharField(max_length=255, verbose_name='Name')
    itemprice = models.DecimalField(max_digits=5,decimal_places=2,verbose_name='Price')
    itemnote = models.TextField()
    
    class Meta:
        managed = False
        db_table = 'item'
        
    def __str__(self) -> str:
        return self.itemname
    
class Topping(models.Model):
    topid = models.AutoField(primary_key=True)
    cag_id = models.ForeignKey(Category, db_column='cag_id',verbose_name='Category',on_delete=models.PROTECT)
    topname = models.CharField(max_length=255, verbose_name='Topping')
    topprice = models.DecimalField(max_digits=5, decimal_places=2, verbose_name='Price')
    
    class Meta:
        managed = False
        db_table = 'topping'
        
    def __str__(self) -> str:
        return self.topname
    
class Order(models.Model):
    orid = models.AutoField(primary_key=True)
    cus_id = models.ForeignKey(Customer, db_column='cus_id',null=True, on_delete=models.SET_NULL)
    ordate = models.DateField()
    orpickup = models.CharField(max_length=50)
    orextraprice = models.DecimalField(max_digits=5,decimal_places=2)
    ispickup = models.BooleanField(default=False)
    
    class Meta:
        managed = False
        db_table = 'orders'
        
    def __str__(self) -> str:
        return f"{str(self.cus_id)}"


class Detail(models.Model):
    detailid = models.AutoField(primary_key=True, verbose_name='#')
    or_id = models.ForeignKey(Order, db_column='or_id', verbose_name='Customer Name',on_delete=models.CASCADE)
    item_id = models.ForeignKey(Item, db_column='item_id', verbose_name='Item Name', on_delete=models.PROTECT) 
    detailnote = models.TextField()
    detailquality = models.IntegerField(verbose_name='Quanlity')
    firm_price = models.DecimalField(max_digits=5,decimal_places=2)
    
    class Meta:
        managed = False
        db_table = 'detail'
        
    def __str__(self) -> str:
        return f"{str(self.or_id)} "
    
class Detail_Topping(models.Model):
    detailtopid = models.AutoField(primary_key=True, verbose_name='#')
    detail_id = models.ForeignKey(Detail, db_column='detail_id',on_delete=models.CASCADE)
    top_id = models.ForeignKey(Topping,db_column='top_id', on_delete=models.PROTECT)
    topprice = models.DecimalField(max_digits=5,decimal_places=2)
    topquality = models.IntegerField(verbose_name='Quanlity')
    
    class Meta:
        managed = False
        db_table = 'detail_topping'
        
    def __str__(self) -> str:
        return f"{str(self.detail_id)} "