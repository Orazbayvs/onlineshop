from django.urls import path

from .views import (
    CategoryDetail,
    CategoryList,
    CategoryProducts,
    CurrentUser,
    OrderDetail,
    ProductDetail,
    ProductStock,
    ProductsList,
    SalesReport,
    UserList,
    UserOrders,
    UserRegister,
)

urlpatterns = [
    path('categories/', CategoryList.as_view()),
    path('categories/<int:id>/', CategoryDetail.as_view()),
    path('categories/<int:id>/products/', CategoryProducts.as_view()),
    path('products/', ProductsList.as_view()),
    path('products/<int:id>/', ProductDetail.as_view()),
    path('products/<int:id>/stock/', ProductStock.as_view()),
    path('users/', UserList.as_view()),
    path('registration/', UserRegister.as_view()),
    path('orders/', UserOrders.as_view()),
    path('orders/<int:id>/', OrderDetail.as_view()),
    path('reports/sales/', SalesReport.as_view()),
    path('me/', CurrentUser.as_view()),
]
