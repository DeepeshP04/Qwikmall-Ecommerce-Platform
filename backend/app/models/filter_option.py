from .. import db

class FilterOption(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filter_id = db.Column(db.Integer, db.ForeignKey('category_filter.id'), nullable=False)
    value = db.Column(db.String(200), nullable=False)
    
    def to_dict(self):
            return {
                "id": self.id,
                "filter_id": self.filter_id,
                "value": self.value
            }