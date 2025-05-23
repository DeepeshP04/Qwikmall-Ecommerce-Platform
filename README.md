# Qwikmall-Ecommerce-Platform

A scalable E-commerce platform built with Flask, MySQL, HTML, CSS, and Redis, providing secure user authentication, profile management, and product category browsing.

## Features

- 🛒 User Authentication and Authorization

    - Signup and Login using Phone OTP Verification (Twilio)

    - Secure Session Management with Flask

    - Profile View and Update (name, phone, email)

- 📦 Product and Category Management

    - Browse categories

    - Retrieve top products per category

- ⚡ High Performance and Scalability

    - Redis caching for OTP and session optimization

    - Validation for unique emails, phones, and input data

- 🛡️ Security Best Practices

    - OTP expiry after 5 minutes

    - Input validation

## Tech Stack

* Backend: Flask (Python)

* Database: MySQL (SQLAlchemy ORM)

* Caching: Redis

* Authentication: Twilio API (OTP SMS)

* Migrations: Flask-Migrate

* API Type: RESTful APIs

## Installation Guide

1. Clone the repository

    - git clone [Repo](https://github.com/DeepeshP04/Qwikmall-Ecommerce-Platform.git)   
    - cd Qwikmall-Ecommerce-Platform

2. Setup virtual environment

    - python -m venv venv  
    - venv/Scripts/activate 

3. Install dependencies

    - pip install -r requirements.txt

4. Environment Variables Create .env:

    - SECRET_KEY=your_secret_key  
    - MYSQL_DATABASE_URI=mysql+pymysql://username:password@localhost/db_name  
    - TWILIO_ACCOUNT_SID=your_account_sid  
    - TWILIO_AUTH_TOKEN=your_auth_token  
    - TWILIO_PHONE_NUMBER=your_twilio_phone  

5. Database Migration

    - flask db init  
    - flask db migrate  
    - flask db upgrade  

6. Run the server

    - python run.py