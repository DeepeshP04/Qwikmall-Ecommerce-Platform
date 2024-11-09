# import required modules
from flask import Flask

# define function for creating app and blueprints 
def create_app():
    # create flask app
    app = Flask(__name__)
    
    # return flask app
    return app