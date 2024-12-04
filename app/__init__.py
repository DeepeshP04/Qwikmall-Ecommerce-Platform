# import required modules
from flask import Flask
import os
from dotenv import load_dotenv
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import inspect

load_dotenv()
db = SQLAlchemy()

# define function for creating app and blueprints 
def create_app():
    secret_key = os.getenv("FLASK_SECRET_KEY")
    username = os.getenv("MYSQL_USER")
    password = os.getenv("MYSQL_PASSWORD")
    host = os.getenv("MYSQL_HOST")
    database = os.getenv("MYSQL_DATABASE")

    # create flask app
    app = Flask(__name__)
    
    app.config["SQLALCHEMY_DATABASE_URI"] = f"mysql+mysqldb://{username}:{password}@{host}/{database}"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.secret_key = secret_key

    db.init_app(app)
        
    from .views import views
    app.register_blueprint(views)
    
    with app.app_context():
        inspector = inspect(db.engine)
        
        if not inspector.get_table_names():
            db.create_all()
            print("Tables created.")
        else:
            print("Tables already exist.")
        
    # return flask app
    return app