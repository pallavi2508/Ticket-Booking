import {logout} from '../app.js';
const user_show = {
    template: `
    <div style="background-color: darkgray;  justify-content: center; align-items: center; height: 100vh;">
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
        <h2>Venue Name: {{ venue.venue_name }}</h2>
        <button  @click.prevent="logout" class="btn btn-danger">Logout</button>
    </div>
        <div class="card">
            <div class="card-header">
                
                <p>Location: {{ venue.venue_location }}</p>
                <p>Capacity: {{ venue.venue_capacity }}</p>
                
            </div>
            <div class="card-body">
                <h3>List of Shows : </h3>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); grid-gap: 20px;">
                    <div v-for="show in shows" :key="show.show_id" style="border: 1px solid #ccc; padding: 10px; box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);">
                        <h4 style="text-align: center;">{{ show.show_name }}</h4>
                        <img
                  :src="'data:image/*;charset=utf-8;base64,' + show.show_image"/>
                        <p><strong>Rating:</strong> {{ show.show_rating }}</p>
                        <p><strong>Timing:</strong> {{ show.show_timing }}</p>
                        <p><strong>Genre:</strong> {{ show.show_genre }}</p>
                        <p><strong>Price:</strong> {{ show.show_ticketprice }}</p>
                        <router-link :to="'/user_page/' + cemail + '/user_show/' + vid + '/user_booking/' + show.show_id" class="btn btn-primary"> Show Booking </router-link>
                    </div>
                    
                </div>
            </div>
        </div> 
        <router-link :to="'/user_page/' + cemail" class="btn btn-primary">Back to User Page</router-link>  
    </div>
    
    `,
   data() {
    return {
        venue: {
            venue_id: 0,
            venue_name: '',
            venue_location: '',
            venue_capacity: 0
        },
        showData: {
            su_id: 0,
            show_id: 0,
            show_name: '',
            show_rating: 0,
            show_timing: '',
            show_genre: '',
            show_ticketprice: 0,
            show_image: null
        },
        shows: [],
    };
   },
   methods: {
    logout() {
      logout();
      this.$router.push('/')
    }
  },
   computed: {
    cemail(){
        return this.$store.state.CEmail;
      },
    vid(){
        return this.$route.params.venue_id;
    },
    
   },
   async mounted() {
    const email = this.$route.params.email; 
    const v_id = this.$route.params.venue_id
    const resshows = await fetch(`api/user_page/${email}/venue/${v_id}`,{
      headers: { 
        'Content-Type': 'application/json', 
        "Authentication-Token": localStorage.getItem("auth-token"),  
      },  
    });  
    const datashows = await resshows.json();  
    console.log(datashows);  
    const cemail = this.$store.state.CEmail;
    if (resshows.ok) {  
      this.shows = datashows;
      }
    if (!localStorage.getItem('auth-token')) {
        alert("something went wrong");
          logout();
          localStorage.clear();
          
      } else if ( !cemail ) {
        alert("something went wrong");
        logout()
        localStorage.clear();
      }
    const vid = this.$route.params.venue_id;
    const resvenue = await fetch(`api/singlevenue/${vid}` , {
        headers: { 
            'Content-Type': 'application/json',   
          },
    });
    const datavenue = await resvenue.json();
    console.log(datavenue);  
    if (resvenue.ok) {  
      this.venue = datavenue;
      console.log(this.venue);  
      }
    }
  };
  
  
  export default user_show;
  
