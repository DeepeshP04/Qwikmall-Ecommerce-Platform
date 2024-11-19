# import required modules
from flask import Flask
import os
from dotenv import load_dotenv

load_dotenv()

secret_key = os.getenv("FLASK_SECRET_KEY")

# define function for creating app and blueprints 
def create_app():
    # create flask app
    app = Flask(__name__)
    
    app.secret_key = secret_key
    
    from .views import views
    app.register_blueprint(views)
    
    # return flask app
    return app