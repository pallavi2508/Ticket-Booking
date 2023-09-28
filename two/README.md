
Instructions for running the application

Navigate to the root folder of the application.

Open two separate terminals and execute the following commands in each:

redis-server
./MailHog_linux_amd64
Navigate to the backend folder and open three separate terminals. Execute the following commands in each:

python app.py
celery -A app.celery worker -l info
celery -A app.celery beat --max-interval 2 -l info
Navigate to the frontend folder.
