from .. import db

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    total_price = db.Column(db.DECIMAL(10, 2), nullable=False)
    address_id = db.Column(db.Integer, db.ForeignKey('address.id'), nullable=False)
    status = db.Column(db.String(20), default='Pending')
    payment_method = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.now())
    updated_at = db.Column(db.DateTime, default=db.func.now(), onupdate=db.func.now())
    
    order_items = db.relationship('OrderItem', backref='order', lazy=True)
    
    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "order_date": self.created_at,
            "total_price": self.total_price,
            "address_id": self.address_id,
            "status": self.status,
            "order_items": [item.to_dict() for item in self.order_items]
        }
        
class OrderItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id  =db.Column(db.Integer, db.ForeignKey('order.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.DECIMAL(10, 2))
    
    def to_dict(self):
        return {
            "id": self.id,
            "product_id": self.product_id,
            "quantity": self.quantity,
            "price": self.price
        }