# import required modules
from flask import Flask

# define function for creating app and blueprints 
def create_app():
    # create flask app
    app = Flask(__name__)
    
    from .views import views
    app.register_blueprint(views)
    
    # return flask app
    return app