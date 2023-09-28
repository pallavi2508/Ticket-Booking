import {logout} from '../app.js';
import store from '../store.js';
const user_page = {
    template: `
    <div style="background-color: darkgray;  justify-content: center; align-items: center; height: 100vh;">
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
    <h2>Welcome {{ userData.username }} to User Page</h2>
    <div style="display: flex; align-items: center;">
      <router-link :to="'/user_account/' + currentUserId" class="btn btn-primary">Account</router-link>
      <button @click.prevent="logout" class="btn btn-danger">Logout</button>
      <router-link to="/search" class="btn btn-primary">Search</router-link>
    </div>
  </div>
      <div v-if="venues.length > 0">
      <!-- Display the list of venues -->
        <div class="card">
          <div class="card-header" style="display: flex; align-items: center; justify-content: center;">
            <h3>List of Venues</h3>
          </div>
          <div class="card-body">
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); grid-gap: 20px;">
              <div v-for="venue in venues" :key="venue.venue_id" style="border: 1px solid #ccc; padding: 10px; box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);">
                <h4 style="text-align: center;">{{ venue.venue_name }}</h4>
                <p><strong>Location:</strong> {{ venue.venue_location }}</p>
                <router-link :to="'/user_page/' + cemail + '/user_show/' + venue.venue_id " class="btn btn-primary"> View Shows </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else>
        <p>No venues found.</p>
      </div>
      <button class="btn btn-primary" @click="userreport">Download PDF file</button> 
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
        },
        venues: [],
      };
      },
      computed: {
        cemail(){
          return this.$store.state.CEmail;
        },
        currentUserId() {
          return this.$store.state.CUserId;
      },
      
        },
      methods: {
        logout() {
          logout();
          // this.$router.push('/')
        },
      
      async viewShows() {
          const response = await fetch(`/api/show_page/${venue_id}`, {
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': localStorage.getItem('auth-token'),
            },
          });
          
          if (response.ok) {
            const showsData = await response.json();
            console.log(showsData);
          } else {
            console.log('Failed to fetch shows for the selected shows');
          }
        },
        async userreport() {
          try {
            const response = await fetch(`/report/${this.cemail}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              responseType: 'blob' 
            });
            if (response.ok) {
              const pdfBlob = await response.blob();
              const pdfUrl = URL.createObjectURL(pdfBlob);
              const a = document.createElement('a');
              a.href = pdfUrl;
              a.download = `${this.currentUserId}_data.pdf`; 
              a.click(); 
              alert('PDF download started.');
            } else {
              alert('Failed download');
            }
          } catch (error) {
            console.error(error);
            alert('Failed download');
          }
        
        },
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
          this.$router.push("/");
          localStorage.clear();
        }
 
        if (!localStorage.getItem('auth-token')) {
          alert("something went wrong");
            this.$router.push('/')
            localStorage.clear();
        } 
        
////////////////////////////////////////////////
        const responseVenues = await fetch(`/api/user_page/${email}/venue`);
        const dataVenues = await responseVenues.json();
        if (responseVenues.ok) {
            this.venues = dataVenues;
        } else {
          alert(dataVenues.message)
          logout();
            console.log('Failed to fetch venues');
            }
          }
};

export default user_page;



