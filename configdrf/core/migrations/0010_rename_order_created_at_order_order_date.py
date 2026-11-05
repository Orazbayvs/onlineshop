from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0009_alter_order_user_alter_orderitem_product_and_more"),
    ]

    operations = [
        migrations.RenameField(
            model_name="order",
            old_name="created_at",
            new_name="order_date",
        ),
    ]
