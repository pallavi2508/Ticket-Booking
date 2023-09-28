from flask import Flask,render_template,request,redirect,url_for,flash
from routes import api, cache
from flask_sqlalchemy import SQLAlchemy
from models import *
from security import user_datastore, security
import worker
from tasks import booking_reminder, generate_csv_data, report, email_sender, admin_email_sender
from celery import Celery
from celery.schedules import crontab
from flask import send_file
import base64

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///bookmyshow.db'
app.config['SECRET_KEY'] = "thisissecret"
app.config['SECURITY_PASSWORD_SALT'] = 'salt'
app.config['WTF_CSRF_ENABLED'] = False
app.config['SECURITY_TOKEN_AUTHENTICATION_HADER'] = "Authentication-Token"
app.config['SECURITY_PASSWORD_HASH'] = 'bcrypt'
app.config['SECURITY_ROLE_REQUIRED'] = True
app.config['CELERY_BROKER_URL']="redis://localhost:6379/1"
app.config['CELERY_RESULT_BACKEND']="redis://localhost:6379/2"
app.config['CELERY_TIMEZONE'] = 'Asia/Kolkata'


cache.init_app(app)
api.init_app(app)
db.init_app(app)

security.init_app(app, user_datastore)

celery = worker.celery
celery.conf.update(
    broker_url= app.config['CELERY_BROKER_URL'],
result_backend = app.config['CELERY_RESULT_BACKEND'],
timezone=app.config['CELERY_TIMEZONE']
)

celery.Task = worker.ContextTask
app.app_context().push()

@celery.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    sender.add_periodic_task(
        crontab(hour=12, minute=15),
        booking_reminder.s(),
        name='Bookmyshow'
    )

    sender.add_periodic_task(
        crontab(hour=12, minute=15),
        email_sender.s(),
        name='Bookmyshow_monthlyreport'
    )

    sender.add_periodic_task(
        crontab(hour=12, minute=15),
        admin_email_sender.s(),
        name='Bookmyshow_monthlyreport_admin'
    )


@app.route('/generate-csv/<string:email>', methods=['POST'])
def generate_csv(email):
    # Call the Celery task to generate CSV data
    csv_data = generate_csv_data.delay(email=email)

    csv_result = csv_data.get()
    # Get the path of the CSV file from the task result
    csv_file_path = csv_result['csv_file_path']

    # Send the CSV file as a download to the admin
    return send_file(csv_file_path, as_attachment=True)

@app.route('/report/<string:email>', methods=['POST'])
def report_pdf(email):
    pdf_data = report.delay(email=email)

    pdf_result = pdf_data.get()
    return send_file(pdf_result, as_attachment=True, download_name='abc.pdf', mimetype='application/pdf')



@app.route("/")
def home():
    return render_template('index.html')
            


if __name__ == "__main__":
    ## to create a new database uncomment this 

    # with app.app_context():
    #     db.create_all()
    #     # Create admin role
    #     admin_role = Role(name='admin', description='Administrator Role')

    # # Create user role
    #     user_role = Role(name='user', description='User Role')
    # # Add roles to the database session
    #     db.session.add(admin_role)
    #     db.session.add(user_role)
    #     auser = User.query.all()

    #     if not auser:
    #         admin_user = User(email='abc@example.com', username='abc', password='abc', active=True, fs_uniquifier='abc')
    #         admin_user.roles.append(admin_role)
            
    #         db.session.add(admin_user)
    
    #         db.session.commit()
    app.run(debug=True)

