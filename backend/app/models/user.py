from .. import db

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(100), nullable=True)
    role = db.Column(db.String(20), nullable=False, default="user")
    created_at = db.Column(db.DateTime, default=db.func.now())
    updated_at = db.Column(db.DateTime, default=db.func.now(), onupdate=db.func.now())
    addresses = db.relationship('Address', backref='user', lazy=True)
    orders = db.relationship('Order', backref='user', lazy=True)
    cart = db.relationship('Cart', backref='user', lazy=True)
    reviews = db.relationship('Review', backref='user', lazy=True)
    
    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "phone": self.phone,
            "email": self.email
        }