from app import create_app

# call create_app function
app = create_app()

if __name__ == "__main__":
    # run flask server
    app.run(debug=True)
