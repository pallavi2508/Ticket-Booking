
import {logout} from '../app.js';
import store from '../store.js';
const admin_page = {
    template: `
    <div style="background-color: darkgray;  justify-content: center; align-items: center; height: 100vh;">
      <h2>Welcome {{ userData.username }} Admin Page</h2>
      <div style="display: flex; justify-content: flex-end;">
        <button @click.prevent="logout" type="i" class="btn btn-primary">Logout</button>
      </div>
      
        <!-- Display the list of venues -->
        <div class="card">
          <div class="card-header">
            <h3>List of Venues</h3>
          </div>
          <div class="card-body">
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); grid-gap: 20px;">
              <div v-for="venue in venues" :key="venue.venue_id" style="border: 1px solid #ccc; padding: 10px; box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);">
                <h4 style="text-align: center;">{{ venue.venue_name }}</h4>
                <p><strong>Location:</strong> {{ venue.venue_location }}</p>
                <p><strong>Capacity:</strong> {{ venue.venue_capacity }}</p>
                <router-link :to="{ name: 'show_page', params: { venue_id: venue.venue_id } }" class="btn btn-primary"> Shows </router-link>
                <button @click.prevent="deleteVenue(venue.venue_id)" class="btn btn-danger">Delete</button>
                <router-link :to="{ name: 'upd_venue', params: { venue_id: venue.venue_id } }" class="btn btn-primary"> Update </router-link>
              </div>
            </div>
          </div>
        </div>
        <button class="btn btn-primary" @click.prevent="generateVenueCSV"> Admin csv file </button>

        <router-link :to="'/admin_page/' + cemail + '/addvenue'" type="button" class="btn btn-primary" >
      Add New Venue
      </router-link>
      
    </div>
    `
    ,
    data() {
      return {
        userData: {
          id: '',
          email: '',
          username: '',
          roles: [],
        },
        venueData: {
          venue_id: '',
          venue_name: '',
          venue_location: '',
          venue_capacity: 0,
        },
        venues: [], 
      };
      },
      computed: {
        cemail(){
          return this.$store.state.CEmail;
        },
        cuserid(){
          return this.$store.state.CUserId;
        },
        currentUserId() {
          return this.$store.state.CUserId;
      },
      cusername(){
        return this.$store.state.CUserName;
      },
      vid(){
        return this.$route.params.venue_id;
    }
      },
      methods: {
        logout() {
          logout();
          
          this.$router.push('/')
        },
      
        async deleteVenue(v_id) {
          const confirmDelete = confirm('Are you sure you want to delete this venue?');
          if (confirmDelete) {
            
            const response = await fetch(`api/venuedelete/${v_id}`, {
              method: 'delete',
              headers: {
                'Content-Type': 'application/json',
                "Authentication-Token": localStorage.getItem("auth-token"),
              },
            });
          
            if (response.ok) {
              alert('Venue deleted successfully.');
              this.fetchVenues();
            } else {
              const data = await response.json();
              alert('Failed to delete venue: ' + data.message);
            }
          }
        },
        async fetchVenues() {
          const resvenues = await fetch(`api/venue/${this.cuserid}`, {
            headers: {
              'Content-Type': 'application/json',
              "Authentication-Token": localStorage.getItem("auth-token"),
            },
          });
          const datavenues = await resvenues.json();
          console.log(datavenues);
          
          if (resvenues.ok) {
            this.venues = datavenues;
          } 
        },
        async generateVenueCSV() {
          try {
            const response = await fetch(`/generate-csv/${this.cemail}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              responseType: 'blob' 
            });
            if (response.ok) {
              const csvBlob = await response.blob(); 
              const csvUrl = URL.createObjectURL(csvBlob); 
              const a = document.createElement('a');
              a.href = csvUrl;
              a.download = `${this.cusername}_data.csv`; 
              a.click(); 
              alert('CSV export job started');
            } else {
              alert('Failed to start CSV export job');
            }
          } catch (error) {
            console.error(error);
            alert('Failed to start CSV export job');
          }
        
        }
        
      },
      async mounted() {
        const email = this.$route.params.email; 
        const resuser = await fetch(`api/user_details/${email}`, {
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": localStorage.getItem("auth-token"),
          },
        });
        const datauser = await resuser.json();
        console.log(datauser);
        if (resuser.ok) {
          this.userData = datauser;
          this.$store.commit('setCurrentUser', {
          id: datauser.id,
          username: datauser.username,
          email: datauser.email,
          roles: datauser.roles
          });
          console.log('Done');
        } else if (resuser.status == 401) {
          this.success = false;
          this.error = datauser.response.error;
        } else {
          this.success = false;
          this.error = datauser.message;
          alert("something went wrong");
          logout()
          localStorage.clear();
        }
        if (!localStorage.getItem('auth-token')) {
          alert("something went wrong");
            logout()
            localStorage.clear();
        }
////////////////////////////////////////////////
        const resvenues = await fetch(`api/venue/${this.cuserid}`,{
          headers: { 
            'Content-Type': 'application/json',   
            "Authentication-Token": localStorage.getItem("auth-token"),
          },  
        });  
        const datavenues = await resvenues.json();  
        console.log(datavenues);  
        if (resvenues.ok) {  
          this.venues = datavenues;
          }
          else {
            
            alert(datavenues.message)
            logout()
          }
         },
         
};

export default admin_page;



