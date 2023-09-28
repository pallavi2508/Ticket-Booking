from flask_restful import Api, Resource, fields, marshal,marshal_with
from flask_security import auth_required, current_user , hash_password,login_required,roles_required
from models import db, User as user_model, Role, Venue as venue_model, show as show_model, bookings as book_model
from datetime import datetime
import base64
from base64 import b64encode


from security import user_datastore
from flask import abort,request

from flask_caching import Cache
import redis
import os
from time import perf_counter_ns

redis_url = "redis://localhost:6379/3"
redis_client = redis.from_url(redis_url)
cache = Cache(config={"CACHE_TYPE": "redis", "CACHE_REDIS_CLIENT": redis_client})

api = Api(prefix="/api")

#user resource field
urf = {
    "id": fields.Integer(),
    "roles": fields.List(fields.String),
    "email": fields.String,
    "username" : fields.String,
    "password": fields.String,
}

vrf = {
    "venue_id": fields.Integer(),
    "venue_name": fields.String,
    "venue_location": fields.String,
    "venue_capacity": fields.Integer()
}

srf = {
    "su_id":fields.Integer(),
    "show_id": fields.Integer(),
    "show_name": fields.String,
    "show_timing": fields.String,
    "show_rating": fields.Float(),
    "show_genre": fields.String,
    "show_ticketprice": fields.Integer(),
    "available_tickets": fields.Integer(),
    "show_image": fields.Raw()
}

brf = {
    "booking_id":fields.Integer(),
    "booking_tickets":fields.Integer(),
    "user_rating": fields.Integer(),
    "show": fields.Nested(srf)
}

class User(Resource):
    @auth_required()
    def get(self, email):
        user = user_model.query.filter_by(email=email).first()
        if user:
            return marshal(user, urf)
            
        else:
            abort(404, "Not Found")
            
    def post(self):
        email = request.json.get('email')
        password = request.json.get('password')
        username = request.json.get('username')

        if email and password and username:
            users = user_model.query.all()
            if users:
                user = user_model.query.filter_by(email=email).first()
                if user:
                    abort(400, "Email already there")
            user = user_model(email=email)
            user.password = password
            user = user_datastore.create_user(username=username, email=email, password=hash_password(password))

            if '/admin_register' in request.path:
                admin_role = user_datastore.find_role('admin')
                user_datastore.add_role_to_user(user, admin_role)
            else:
                user_role = user_datastore.find_role('user')
                user_datastore.add_role_to_user(user, user_role)

            db.session.commit()

            return { 'message': 'registered successfully!'},200
        else:
            abort(400, "Email, password, and username are necessary")


class AdminPage(Resource):
   
    def get(self, email):
        if not current_user.has_role('admin'):
            print(current_user.username)
            abort(403, 'Not Allowed')
        else:
            if email != current_user.email :
                abort(403, 'Not Allowed')
            user = user_model.query.filter_by(email=email).first()
            if not user:
                abort(404, 'Not Found')

        return user
    
class UserPage(Resource):
    @cache.cached(timeout=20, key_prefix='user_page')
    def get(self, email):
        if not current_user.has_role('user'):
            abort(403, 'Not Allowed')
        else:
            if email != current_user.email :
                abort(403, 'Not Allowed')
            user = user_model.query.filter_by(email=email).first()
            if not user:
                abort(404, 'Not Found')

        return user

class VenueManagement(Resource):
    @auth_required()
    @cache.cached(timeout=20, key_prefix='admin_page')
    def get(self, id):
        if not current_user.id == id:
            abort(403, "Not Allowed")
        if not current_user.has_role('admin'):
            print(current_user.username)
            abort(403, "Not Allowed")
        user = user_model.query.filter_by(id=id).first()

        if user:
            start = perf_counter_ns()
            venue = venue_model.query.filter_by(vu_id=id).all()
            venue_dictionaries = []
            for v in venue:
                venue_dictionary = marshal(v, vrf)
                venue_dictionaries.append(venue_dictionary)
            stop = perf_counter_ns()
            print(stop-start)
            return venue_dictionaries
            
        else:
            abort(404, "Not Found")

    @auth_required()
    def post(self, id):
        if not current_user.has_role('admin'):
            abort(403, "Not Allowed")
        user = user_model.query.filter_by(id=id).first()
        if user:
            venue_name = request.form.get("venue_name")
            venue_location = request.form.get("venue_location")
            venue_capacity = request.form.get("venue_capacity")
            if venue_name and venue_capacity and venue_location:
                new_venue = venue_model(vu_id=id, venue_name=venue_name, venue_location=venue_location, venue_capacity=venue_capacity)
                db.session.add(new_venue)
                db.session.commit()
                cache.delete('admin_page')
                return {"message": "Added Successfully."}, 200
            else:
                return {"message": "Data not given."}, 404
        else:
            return {"message": "User id not given."}, 404
        
    @auth_required()
    def delete(self, vid):
        if not current_user.has_role('admin'):
            abort(403, "Not Allowed")
        venue = venue_model.query.filter_by(venue_id=vid).first()
        if venue:
            shows = show_model.query.filter_by(su_id=venue.venue_id).all()
            for show in shows:
                db.session.delete(show)

            db.session.delete(venue)
            db.session.commit()
            return {"message": "Venue and associated shows deleted successfully."}, 200
        else:
            abort(404, "Venue not found")


class singleVenue(Resource):
    @auth_required()
    def get(self, venue_id):
            venue = venue_model.query.filter_by(venue_id=venue_id).first()
            venue_dictionary = marshal(venue, vrf)
            return venue_dictionary
    
    @auth_required()
    def put(self, venue_id):
        if not current_user.has_role('admin'):
            abort(403, "Not Allowed")
        venue = venue_model.query.filter_by(venue_id=venue_id).first()
        if venue:
            venue_name = request.form.get("venue_name")
            venue_location = request.form.get("venue_location")
            venue_capacity = request.form.get("venue_capacity")
            if venue_name and venue_capacity and venue_location:
                venue.venue_name=venue_name
                venue.venue_location=venue_location
                venue.venue_capacity=venue_capacity
                
                db.session.commit()
                cache.delete('admin_page')
                return {"message": "Updated Successfully."}, 200
            else:
                return {"message": "Data not given."}, 404
        else:
            return {"message": "User id not given."}, 404
        

class ShowManagement(Resource):
    @auth_required()
    def get(self, id):
        
        venue = venue_model.query.filter_by(venue_id=id).first()
        if not current_user.id == venue.vu_id:
            abort(403, "Not Allowed")
        if venue:
            show = show_model.query.filter_by(su_id=venue.venue_id).all()
            show_dictionaries = []
            for s in show:
                show_dictionary = marshal(s, srf)
                encoded_image = base64.b64encode(show_dictionary["show_image"]).decode()
                show_dictionary["show_image"] = encoded_image
                show_dictionaries.append(show_dictionary)
            return show_dictionaries
            
        else:
            abort(404, "Not Found")
        
    @auth_required()
    def post(self, id):
        if not current_user.has_role('admin'):
            abort(403, "Not Allowed")
        venue = venue_model.query.filter_by(venue_id=id).first()
        if venue:
            show_name = request.form.get("show_name")
            show_timing = request.form.get("show_timing")
            show_timing = datetime.strptime(show_timing, '%Y-%m-%dT%H:%M')
            show_genre = request.form.get("show_genre")
            show_ticketprice = request.form.get("show_ticketprice")
            show_image = request.files.get("show_image")
            if show_name and show_timing and show_genre and show_ticketprice and show_image:
                show_image_binary = show_image.read()
                new_show= show_model(su_id=id, show_name=show_name, show_timing=show_timing, show_genre=show_genre, show_ticketprice=show_ticketprice, available_tickets=venue.venue_capacity, show_image=show_image_binary)
                db.session.add(new_show)
                db.session.commit()
                return {"message": "Added Successfully."}, 200
            else:
                return {"message": "Data not given."}, 404
            
    @auth_required()
    def delete(self, show_id):
        if not current_user.has_role('admin'):
            abort(403, "Not Allowed")
        show = show_model.query.filter_by(show_id=show_id).first()
        if show:
            db.session.delete(show)
            db.session.commit()
            return {"message": "Show deleted successfully."}, 200
        else:
            abort(404, "Show not found")


class SingleShow(Resource):
    @auth_required()
    def get(self, show_id):
        show = show_model.query.filter_by(show_id=show_id).first()
        if show:
            show_dictionary = marshal(show, srf)
            encoded_image = base64.b64encode(show_dictionary["show_image"]).decode()
            show_dictionary["show_image"] = encoded_image
            return show_dictionary
    
    @auth_required()
    def put(self, show_id):
        if not current_user.has_role('admin'):
            abort(403, "Not Allowed")
        show = show_model.query.filter_by(show_id=show_id).first()
        if show:
            show_name = request.form.get("show_name")
            show_timing = request.form.get("show_timing")
            show_timing = datetime.strptime(show_timing, '%Y-%m-%d %H:%M:%S')
            show_genre = request.form.get("show_genre")
            show_ticketprice = request.form.get("show_ticketprice")
            show_image = request.files.get("show_image")
            
            if show_name and show_timing and show_genre and show_ticketprice:
                show.show_name = show_name
                show.show_timing = show_timing
                show.show_genre = show_genre
                show.show_ticketprice = show_ticketprice
                if show_image:
                    show_image_binary = show_image.read()
                    show.show_image = show_image_binary
                
                db.session.commit()
                return {"message": "Show updated successfully."}, 200
            else:
                return {"message": "Invalid data provided."}, 400
        else:
            return {"message": "Show not found."}, 404

class UserVenue(Resource):
    @auth_required()
    def get(self, email):
        if not current_user.email == email:
            abort(403, "Not Allowed")
        if not current_user.has_role('user'):
            abort(403, "Not Allowed")
        venue = venue_model.query.all()
        if not venue:
            return {'message': 'Venue not found'}, 404
        
        venue_dictionaries = []
        for v in venue:
            venue_dictionary = marshal(v, vrf)
            venue_dictionaries.append(venue_dictionary)
        return venue_dictionaries


class UserShow(Resource):
    @auth_required()
    def get(self, id, email):

        show = show_model.query.filter_by(su_id=id).all()
        if not show:
            return {'message': 'Show not found'}, 404
            
        show_dictionaries = []
        for s in show:
            show_dictionary = marshal(s, srf)
            encoded_image = base64.b64encode(show_dictionary["show_image"]).decode()
            show_dictionary["show_image"] = encoded_image
            show_dictionaries.append(show_dictionary)
        return show_dictionaries
            
class ShowBooking(Resource):
    @auth_required()
    def get(self, id):
       user = user_model.query.filter_by(id=id).first()
       if user:
            booking = book_model.query.filter_by(user_id=user.id).all()
            book_dictionaries = []
            for b in booking:
                book_dictionary = marshal(b, brf)
                book_dictionaries.append(book_dictionary)
            return book_dictionaries
       else:
            abort(404, "Not Found")

    @auth_required()    
    def post(self, id):
        if not current_user.has_role('user'):
            abort(403, "Not Allowed")
        booking_tickets = request.form.get('booking_tickets')
        user = user_model.query.filter_by(id=current_user.id).first()
        show = show_model.query.filter_by(show_id=id).first()
        book = book_model.query.filter_by(show_id=id, user_id=current_user.id).first()
        if user and show:
            if book:
                if book.user_rating > 0:
                    new_booking = book_model(booking_tickets=booking_tickets, user_id=user.id, show_id=show.show_id, user_rating=book.user_rating)
                    db.session.add(new_booking)
                    db.session.commit()
            else:
                new_booking = book_model(booking_tickets=booking_tickets, user_id=user.id, show_id=show.show_id)
                db.session.add(new_booking)
                db.session.commit()
            show.available_tickets = show.available_tickets - int(booking_tickets)
            db.session.commit()
            return {"message": "Booked Successfully."}, 200
        else:
            return {'message': 'User or Show not found'}, 404
        

class Rating(Resource):
    @auth_required()
    def get(self, show_id, user_id):
        rate = book_model.query.filter_by(show_id=show_id, user_id=user_id).first()
        if rate:
            return rate.user_rating

    @auth_required()
    def post(self, show_id, user_id):
        user_rating = request.form.get('user_rating')
        rate = book_model.query.filter_by(show_id=show_id, user_id=user_id).first()
        print(rate)
        show = show_model.query.filter_by(show_id = show_id).first()
        user = user_model.query.filter_by(id = user_id).first()
        book = book_model.query.filter_by(show_id=show_id, user_id=user_id).all()
        if rate:
            if user_rating and 1 <= int(user_rating) <= 5:
                for r in book:
                    r.user_rating = user_rating
                    print(r.user_rating)
                    db.session.commit()
                    if show.show_rating == 0:
                        show.show_rating = r.user_rating
                
                average=(show.show_rating + int(r.user_rating))/2
                show.show_rating=average
                db.session.commit()
                return {"message": "Rating added successfully."}, 200
            else:
                return {"message": "Invalid rating. Please provide a rating between 1 and 5."}, 400
        else:
            return {'message': 'Booking not found'}, 404

    @auth_required()    
    def delete(self, show_id, user_id):
        rate = book_model.query.filter_by(show_id=show_id, user_id=user_id).all()
        show = show_model.query.filter_by(show_id=show_id).first()

        if rate and show:
            for r in rate:
                db.session.delete(r)
            db.session.commit()

            # Recalculate show_rating
            all_ratings = book_model.query.filter_by(show_id=show_id).all()
            total_ratings = sum(r.user_rating for r in all_ratings)
            total_users = len(all_ratings)

            if total_users > 0:
                new_show_rating = total_ratings / total_users
                show.show_rating = new_show_rating
            else:
                show.show_rating = 0

            db.session.commit()

            return {'message': 'Rating deleted successfully.'}, 200
        else:
            return {'message': 'Rating not found.'}, 404



class UserAccount(Resource):
    @auth_required()
    def get(self, id):
        
        books = book_model.query.filter_by(user_id=id).all()
        if not books:
            return {'message': 'Show not Book yet!'}, 404
        book_dictionaries = []
        
        for book in books:
            book_dictionary = []
            show = show_model.query.filter_by(show_id=book.show_id).first()
            show_dictionary = marshal(show, srf)
            encoded_image = base64.b64encode(show_dictionary["show_image"]).decode()
            show_dictionary["show_image"] = encoded_image
            book_dictionary = marshal(book, brf)
            book_dictionary['show'] = show_dictionary
            book_dictionaries.append(book_dictionary)
        return book_dictionaries

    
class Search(Resource):
    @auth_required()
    def get(self):
        search_text = request.args.get('q')
        
        venues = venue_model.query.filter(
            (venue_model.venue_name.like(f'%{search_text}%')) |
            (venue_model.venue_location.like(f'%{search_text}%'))).all()
        
        shows = show_model.query.filter(
            (show_model.show_name.like(f'%{search_text}%')) |
            (show_model.show_genre.like(f'%{search_text}%')) |
            (show_model.show_rating.like(f'%{search_text}%'))).all()
        
        venue_dictionaries = [marshal(venue, vrf) for venue in venues]
        show_dictionaries = []
        for s in shows:
            show_dictionary = marshal(s, srf)
            encoded_image = base64.b64encode(show_dictionary["show_image"]).decode()
            show_dictionary["show_image"] = encoded_image
            show_dictionaries.append(show_dictionary)
        
        return {"venues": venue_dictionaries, "shows": show_dictionaries}, 200

api.add_resource(User, '/admin_register', '/user_register', '/user_details/<string:email>')
api.add_resource(AdminPage, '/admin_page/<string:email>')
api.add_resource(UserPage, '/user_page/<string:email>')
api.add_resource(VenueManagement, '/venue/<int:id>', '/venue', '/venuedelete/<int:vid>')
api.add_resource(ShowManagement, '/show', '/show/<int:id>', '/user_show', '/showdelete/<int:show_id>')
api.add_resource(UserVenue, '/user_page/<string:email>/venue')
api.add_resource(UserShow, '/user_page/<string:email>/venue/<int:id>')
api.add_resource(SingleShow, '/singleshow/<int:show_id>')
api.add_resource(singleVenue, '/singlevenue/<int:venue_id>')
api.add_resource(ShowBooking, '/booking/<int:id>')
api.add_resource(UserAccount, '/user_account/<int:id>')
api.add_resource(Rating, '/rating/<int:show_id>/<int:user_id>')
api.add_resource(Search, '/search')