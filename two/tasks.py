from worker import celery
from json import dumps
import os
import csv
from models import User,Venue,show as show_model,bookings as bookings_model, Role
from io import StringIO 
from jinja2 import Template
from weasyprint import HTML
from httplib2 import Http
import tempfile
from datetime import datetime
from sqlalchemy import extract
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders


SMPTP_SERVER_HOST = "localhost"
SMPTP_SERVER_PORT = 1025
SENDER_ADDRESS = "abc@gmail.com"
SENDER_PASSWORD = ""

@celery.task
def booking_reminder():
    regularusers = User.query.join(User.roles).filter(Role.name == 'user').all()
    bookings = bookings_model.query.all()
    for user in regularusers:
        book = bookings_model.query.filter_by(user_id=user.id).first()
        if book:
            continue
        else:
            msg = f"Dear {user.username}, Please book tickets for available shows."
            send_msg(msg)
    return "Reminder Sent."




def send_msg(msg):
   
    url = "https://chat.googleapis.com/v1/spaces/AAAA-1EJsB8/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=MuaP8v3I9YmGsi43K2cOOFn1F6-rrtsXht9Abuxe4bE"
    app_message = {
        'text': msg}
    message_headers = {'Content-Type': 'application/json; charset=UTF-8'}
    http_obj = Http()
    response = http_obj.request(
        uri=url,
        method='POST',
        headers=message_headers,
        body=dumps(app_message),
    )
    print(response)

@celery.task(bind=True)
def generate_csv_data(self, email):

    # Get the path to the CSV folder
    csv_folder_path = os.path.join(os.getcwd(), 'csv_files')
    
    if not os.path.exists(csv_folder_path):
        os.makedirs(csv_folder_path)

    # Create the CSV file path
    csv_file_path = os.path.join(csv_folder_path, f'venues_{self.request.id}.csv')


    with open(csv_file_path, 'w', newline='') as csvfile:
        fields = ['Show Id', 'venue Id', 'Show Name','Show Time','Show Rating','Show Genre', 'Show TicketPrice','Bookings']
        show_writer = csv.DictWriter(csvfile, fieldnames=fields)
        show_writer.writeheader()
        user = User.query.filter_by(email=email).first()
        venues = Venue.query.filter_by(vu_id=user.id).all()
        for venue in venues:
            shows = show_model.query.filter_by(su_id=venue.venue_id).all()
        
            for show in shows:

                show_bookings = bookings_model.query.filter_by(show_id = show.show_id).all()
                sum=0
                for ticket in show_bookings:
                    sum += ticket.booking_tickets
                
                show_writer.writerow({
                    'Show Id': show.show_id,
                    'venue Id': show.su_id, 
                    'Show Name': show.show_name,
                    'Show Time': show.show_timing,
                    'Show Rating': show.show_rating,
                    'Show Genre': show.show_genre,
                    'Show TicketPrice': show.show_ticketprice,
                    'Bookings': sum if show_bookings else 0
                })

    return {'csv_file_path': csv_file_path}


def user_report(email):
    user = User.query.filter_by(email=email).first()
    bookings = bookings_model.query.filter_by(user_id=user.id).all()
    
    with open('report.html', 'r') as template_file:
        template_content = template_file.read()
        template = Template(template_content)
    
    # Create a list to store all booking information
    booking_info = []
    
    for booking in bookings:
        show = show_model.query.filter_by(show_id=booking.show_id).first()
        tickets = booking.booking_tickets
        
         # Create a dictionary to store booking details
        booking_data = {
            'show_name': show.show_name,
            'show_time': show.show_timing, 
            'booking_tickets': tickets,
        }
        
        booking_info.append(booking_data)
    report_user = template.render(bookings=booking_info)
    return report_user
    
   
@celery.task
def report(email):
    user_file_html = user_report(email)
    user_file_pdf = HTML(string=user_file_html).write_pdf()
    with tempfile.NamedTemporaryFile(delete=False) as user_file:
        user_file.write(user_file_pdf)
        user_report_file = user_file.name

    return user_report_file


def user_mureport(email):
    cmonth = datetime.now().month
    user = User.query.filter_by(email=email).first()
    bookings = bookings_model.query.filter_by(user_id=user.id).all()
    
    with open('monthu_report.html', 'r') as template_file:
        template_content = template_file.read()
        template = Template(template_content)
    
    # Create a list to store all booking information
    booking_info = []
    
    for booking in bookings:
        show = show_model.query.filter(extract('month', show_model.show_timing) == cmonth, show_model.show_id == booking.show_id).first()
        tickets = booking.booking_tickets
        
         # Create a dictionary to store booking details
        booking_data = {
            'show_name': show.show_name,
            'show_time': show.show_timing, 
            'booking_tickets': tickets,
        }
        
        booking_info.append(booking_data)
    report_user = template.render(bookings=booking_info)
    return report_user
    



def send_email(to_address, subject, message, content="text", attachment_file=None):
    msg = MIMEMultipart()
    msg["From"] = SENDER_ADDRESS
    msg["To"] = to_address
    msg["Subject"] = subject

    if content == "html":
        msg.attach(MIMEText(message, "html"))
    else:
        msg.attach(MIMEText(message, "plain"))

    if attachment_file:
        with open(attachment_file, "rb") as attachment:
            
            part = MIMEBase("application", "octet-stream")
            part.set_payload(attachment.read())
        
        encoders.encode_base64(part)
        
        part.add_header(
            "Content-Disposition", f"attachment; filename= {attachment_file}",
        )
        
        msg.attach(part)

    s = smtplib.SMTP(host=SMPTP_SERVER_HOST, port=SMPTP_SERVER_PORT)
    
    s.login(SENDER_ADDRESS, SENDER_PASSWORD)
    s.send_message(msg)
    s.quit()
    return True


@celery.task
def email_sender():
    regularusers = User.query.join(User.roles).filter(Role.name == 'user').all()
    for user in regularusers:
        
        rhtml = user_mureport(user.email)
        recipient_email = user.email
        recipient_username = user.username if user.username else 'Recipient'
        
        subject = 'Monthly Booking Report'
        message = rhtml.replace('Recipient', recipient_username)

        
        send_email(to_address=recipient_email, subject=subject, message=message, content='html', attachment_file='monthu_report.html')

    return "Email sent."


def admin_mureport(email):
    cmonth = datetime.now().month
    user = User.query.filter_by(email=email).first()
    venues = Venue.query.filter_by(vu_id=user.id).all()

    with open('montha_report.html', 'r') as template_file:
        template_content = template_file.read()
        template = Template(template_content)
    
    # Create a list to store all booking information
    show_info = []

    for venue in venues:
            shows = show_model.query.filter(extract('month', show_model.show_timing) == cmonth, show_model.su_id==venue.venue_id).all()
            for show in shows:

                show_bookings = bookings_model.query.filter_by(show_id = show.show_id).all()
                sum=0
                for ticket in show_bookings:
                    sum += ticket.booking_tickets

                
                show_data = {
                    'venue': venue.venue_name,
                    'show_name': show.show_name,
                    'show_time': show.show_timing, 
                    'show_rating': show.show_rating,
                    'show_ticketprice': show.show_ticketprice,
                    'total_booking': sum
                }
        
                show_info.append(show_data)
    report_admin = template.render(shows=show_info)
    return report_admin


@celery.task
def admin_email_sender():
    admins = User.query.join(User.roles).filter(Role.name == 'admin').all()
    for user in admins:
        
        rhtml = admin_mureport(user.email)
        recipient_email = user.email
        recipient_username = user.username if user.username else 'Recipient'
        
        subject = 'Monthly Admin Report'
        message = rhtml.replace('Recipient', recipient_username)

        
        send_email(to_address=recipient_email, subject=subject, message=message, content='html', attachment_file='montha_report.html')

    return "Email sent."

