from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Time
from datetime import datetime
from flask_security import UserMixin, RoleMixin
import pytz

db = SQLAlchemy()
ist = pytz.timezone('Asia/Kolkata')
role_users = db.Table('role_users',
                      db.Column('user_id', db.Integer(),
                                db.ForeignKey('user.id')),
                      db.Column('role_id', db.Integer(),
                                db.ForeignKey('role.id')))

class User(db.Model, UserMixin):
    __tablename__='user'
    id=db.Column(db.Integer, autoincrement=True, primary_key=True)
    email=db.Column(db.String, unique=True)
    username=db.Column(db.String)
    password=db.Column(db.String(200))
    active=db.Column(db.Boolean())
    roles = db.relationship('Role', secondary=role_users,
                            backref=db.backref('users', lazy='dynamic'))
    fs_uniquifier = db.Column(db.String, unique=True, nullable=False)

class Role(db.Model, RoleMixin):
    __tablename__='role'
    id=db.Column(db.Integer, autoincrement=True, primary_key=True)
    name=db.Column(db.String(50), unique=True)
    description=db.Column(db.String(300))

class Venue(db.Model):
    _tablename_='venue'
    vu_id=db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    venue_id=db.Column(db.Integer, autoincrement=True, primary_key=True)
    venue_name=db.Column(db.String, unique=True)
    venue_location=db.Column(db.String)
    venue_capacity=db.Column(db.Integer)
    
class show(db.Model):
    _tablename_='show'
    su_id=db.Column(db.Integer, db.ForeignKey("venue.venue_id"), nullable=False)
    show_id=db.Column(db.Integer, autoincrement=True, primary_key=True)
    show_name=db.Column(db.String)
    show_timing=db.Column(db.DateTime)
    show_rating=db.Column(db.Float, default=0)
    show_genre=db.Column(db.String)
    show_ticketprice=db.Column(db.Integer)
    available_tickets=db.Column(db.Integer, nullable=True)
    show_image = db.Column(db.BLOB, nullable=False)
    bookings = db.relationship("bookings", backref="show", cascade="all, delete")

class bookings(db.Model):
    _tablename_="bookings"
    booking_id=db.Column(db.Integer, autoincrement=True, primary_key=True)
    booking_tickets=db.Column(db.Integer, default=0)
    user_id=db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    show_id=db.Column(db.Integer, db.ForeignKey("show.show_id"), nullable=False)
    user_rating=db.Column(db.Integer, default=0)
