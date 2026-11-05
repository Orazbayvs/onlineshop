import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'configdrf.settings')
django.setup()

from django.utils.text import slugify
from core.models import Category, Product


def seed_categories_and_products():
    categories_data = {
        'Smartphones': 'Mobile phones and smartphone accessories.',
        'Laptops': 'Portable computers for work, study, and creative tasks.',
        'Audio': 'Headphones, earbuds, and speakers.',
        'Gaming': 'Consoles and gaming equipment.',
        'Accessories': 'Useful accessories for everyday electronics.',
    }
    created_categories = {}
    for name, description in categories_data.items():
        category, _ = Category.objects.get_or_create(
            name=name,
            defaults={'description': description, 'is_active': True},
        )
        if category.description != description or not category.is_active:
            category.description = description
            category.is_active = True
            category.save(update_fields=('description', 'is_active'))
        created_categories[name] = category

    products_data = [
        ('iPhone 15 Pro', 550000, 'Latest flagship smartphone with titanium finish and pro camera system.', 12, 'Smartphones', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEJzVGe_iKg5244vu6tFTix6LYVd-Ikh6VuyzDR0i5YarAqTDfMoExUPuQ&s=10'),
        ('Samsung Galaxy S24', 480000, 'Premium Android smartphone with AI-powered camera and display.', 18, 'Smartphones', 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=800'),
        ('Google Pixel 8 Pro', 410000, 'Smartphone with excellent camera quality and clean Android experience.', 9, 'Smartphones', 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=800'),
        ('MacBook Air M3', 690000, 'Thin and powerful laptop with all-day battery life.', 7, 'Laptops', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=800'),
        ('Dell XPS 13', 640000, 'Business-ready premium ultrabook with sharp display.', 11, 'Laptops', 'https://media.ixbt.com/fit-in/720x512/https://www.ixbt.com/img/r30/00/02/38/80/cover3.jpg'),
        ('ASUS ZenBook 14', 520000, 'Compact laptop for productivity and creative work.', 13, 'Laptops', 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&q=80&w=800'),
        ('Sony WH-1000XM5', 210000, 'Wireless noise-cancelling headphones with exceptional clarity.', 24, 'Audio', 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=800'),
        ('AirPods Pro 2', 170000, 'Premium earbuds with powerful sound and active noise cancellation.', 31, 'Audio', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRSgSNVcNtIY5OId3em1Z5F4dNY2zPiyloZofGTKupxWLbYnsZGdW6_OEQs&s=10'),
        ('JBL Charge 5', 120000, 'Portable speaker with deep bass and long battery life.', 27, 'Audio', 'https://images.unsplash.com/photo-1518444065439-e933c06ce9cd?auto=format&fit=crop&q=80&w=800'),
        ('PlayStation 5', 350000, 'Next-generation gaming console with fast SSD and stunning graphics.', 6, 'Gaming', 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&q=80&w=800'),
        ('Nintendo Switch OLED', 230000, 'Portable hybrid console for gaming at home or on the move.', 14, 'Gaming', 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?auto=format&fit=crop&q=80&w=800'),
        ('Gaming Mouse Pro', 28000, 'Precision mouse with ergonomic design and programmable buttons.', 36, 'Gaming', 'https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&q=80&w=800'),
        ('Apple Watch Ultra 2', 290000, 'A rugged smartwatch built for fitness, adventure and productivity.', 16, 'Accessories', 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=800'),
        ('USB-C Hub', 18000, 'Compact multi-port hub for laptop and desktop setups.', 42, 'Accessories', 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=800'),
        ('4K Smart TV', 510000, 'Crisp visuals and streaming-ready design for your home cinema.', 6, 'Accessories', 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=800'),
    ]

    for name, price, desc, count, cat_name, img in products_data:
        category = created_categories[cat_name]
        sku = f"SHOP-{slugify(name).replace('-', '').upper()[:24]}"
        product, created = Product.objects.get_or_create(
            name=name,
            defaults={
                'sku': sku,
                'price': price,
                'description': desc,
                'stock_qty': count,
                'category': category,
                'image_url': img,
            },
        )
        if not created:
            product.sku = sku
            product.price = price
            product.description = desc
            product.category = category
            product.image_url = img
            product.save(update_fields=('sku', 'price', 'description', 'category', 'image_url'))
    print(f"Synchronized {len(products_data)} products without changing stock.")


def seed():
    seed_categories_and_products()


if __name__ == '__main__':
    seed()
