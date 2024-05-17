from django.urls import path
from .views import GetALLCustomer,GetAllCategory, GetAllItem, GetAllTopping, GetAllToppingWithoutSub,GetAllOrder, GetAllDetail, GetListDateOrder, GetTotalDetail, GetTotalPriceByDate, UpdateOrder, PostOrder, UpdateCategory, UpdateItem, UpdateTopping

urlpatterns = [
    path('getallcustomer', GetALLCustomer.as_view()), 
    path('getallcategory', GetAllCategory.as_view()),
    path('updatecategory', UpdateCategory.as_view()),
    path('getallitem', GetAllItem.as_view()),
    path('updateitem', UpdateItem.as_view()),
    path('getalltopping', GetAllTopping.as_view()),
    path('getalltoppingwithoutsub', GetAllToppingWithoutSub.as_view()),
    path('updatetopping', UpdateTopping.as_view()),
    path('getallorder', GetAllOrder.as_view()),
    path('getallorderbydate/<str:date>/', GetAllOrder.as_view()),
    path('getalldetail', GetAllDetail.as_view()), 
    path('getlistdateorder', GetListDateOrder.as_view()),
    path("gettotaldetail/<str:date>", GetTotalDetail.as_view()),
    path("gettotalpricebydate/<str:date>", GetTotalPriceByDate.as_view()),
    path("updateorder", UpdateOrder.as_view()),
    path("postorder", PostOrder.as_view()),
]
 