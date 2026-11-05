from django.contrib import admin
from .models import User, Order, OrderItem, Category, Payment, Product

# Register your models here.

class UserAdmin(admin.ModelAdmin):
    list_display = ("email", "role", "is_staff", "is_active")
    exclude = ("password",)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "order_date", "status", "total_amount")
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ("order", "product", "quantity", "unit_price")
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "is_active")
    search_fields = ['name']
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "sku", "price", "stock_qty")
    search_fields = ['name']
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("order", "amount", "method", "status", "paid_at")

admin.site.register(User, UserAdmin)
admin.site.register(Order, OrderAdmin)
admin.site.register(OrderItem, OrderItemAdmin)
admin.site.register(Category, CategoryAdmin)
admin.site.register(Product, ProductAdmin)
admin.site.register(Payment, PaymentAdmin)