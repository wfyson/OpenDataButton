ODB Server
==========

A RESTful API for the Open Data Button.

Written in the Flask microframework for Python.

## Developer install

1. Install virtualenv and create one in this folder 

`$ virtualenv venv`

2. Activate the instance 

`$ source venv/bin/activate`

3. Install requirements 

`$ pip -r requirements.txt`

4. Install sqllite3 and set up the database:

`$ sqlite3 /tmp/opendatabutton.db < server/schema.sql `

5. (Optional) Start a local redis server for caching

6. Start the server 

`$ python manage.py runserver`

7. Open the home page http://localhost:7000

