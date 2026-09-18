from .. import db

class CategoryFilter(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=db.func.now())
    
    def to_dict(self):
            return {
                "id": self.id,
                "caegory_id": self.category_id,
                "name": self.name,
                "type": self.type,
                "created_at": self.created_at
            }