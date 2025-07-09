from app.models import Order, Product, Address, OrderItem, db

class OrderService:
    @staticmethod
    def create_order(user_id, items):
        if not items:
            return {"success": False, "message": "No items provided."}, 400
        address = Address.query.filter_by(user_id=user_id).first()
        if not address:
            return {"success": False, "message": "No address found for user."}, 400
        order_items = []
        total_price = 0
        for item in items:
            product = Product.query.filter_by(id=item.get("product_id")).first()
            if not product:
                return {"success": False, "message": f"Product {item['product_id']} not found"}, 404
            quantity = item["quantity"]
            item_total = float(product.price) * quantity
            total_price += item_total
            order_items.append(OrderItem(
                product_id=product.id,
                quantity=quantity,
                price=product.price,
                total_price=item_total
            ))
        new_order = Order(
            user_id=user_id,
            address_id=address.id,
            total_price=total_price
        )
        db.session.add(new_order)
        db.session.commit()
        for item in order_items:
            item.order_id = new_order.id
            db.session.add(item)
        db.session.commit()
        return {"success": True, "message": "Order created successfully", "order": new_order.to_dict()}, 201 

    @staticmethod
    def list_user_orders(user_id):
        orders = Order.query.filter_by(user_id=user_id).all()
        if not orders:
            return {"success": False, "message": "No orders found."}, 404
        return {"success": True, "orders": [order.to_dict() for order in orders]}, 200

    @staticmethod
    def get_order_details(user_id, order_id):
        order = Order.query.filter_by(user_id=user_id, id=order_id).first()
        if not order:
            return {"success": False, "message": "Order not found."}, 404
        return {"success": True, "order": order.to_dict()}, 200 