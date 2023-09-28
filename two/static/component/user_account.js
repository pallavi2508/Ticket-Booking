import store from '../store.js';
import {logout} from '../app.js';
const user_account = {
    template : `
    <div style="background-color: darkgray;  justify-content: center; align-items: center; height: 100vh;">
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
        <h3>List of Shows:</h3>
        <button style="margin-left: 75%" @click.prevent="logout" class="btn btn-danger">Logout</button>
    </div>
        <div class="card">
        <div class="card-header">
        
        <div class="card-body">
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); grid-gap: 20px;">
            <div v-for="booking in bookings" :key="bookings.booking_id" style="border: 1px solid #ccc; padding: 10px; box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);">
                <h4>{{ booking.show.show_name }} - {{ booking.booking_tickets }}</h4>
                
                <div v-if="booking.user_rating === 0">
                    <router-link :to="'/rating/' + booking.show.show_id + '/' +  currentUserId" class="btn btn-primary">Rate</router-link>
                </div>
                <div v-else>
                    <h6> Rating: {{ booking.user_rating }}</h6>
                    <button class="btn btn-danger" @click.prevent="deleterate(booking.show.show_id, currentUserId)">Unrate</button>
                </div>
            </div>
            </div>
        </div>
        </div>
       
    </div>
    <router-link :to="'/user_page/' + currentUseremail" class="btn btn-primary">Back to User Page</router-link>
    </div>
</div>
    `,
    
    data() {
        return {
            bookingData: {
                booking_id: '',
                booking_tickets: 0,
                user_rating: 0
            },
            bookings: [],
        };
       },
       computed: {
        currentUserId() {
            return this.$store.state.CUserId;
        },
        currentUseremail() {
            return this.$store.state.CEmail;
        }
       },
       async mounted() {
        const email = this.$route.params.email;
        const resbook = await fetch(`api/user_account/${this.currentUserId}`,{
            headers: {
                "Content-Type": "application/json",
                "Authentication-Token": localStorage.getItem("auth-token"),
              },   
        });  
        const databook = await resbook.json();  
        console.log(databook);  
        if (resbook.ok) {  
          this.bookings = databook;
          console.log(this.bookings)
          }
        else {
            alert(databook.message)
            this.$router.push(`/user_page/${this.currentUseremail}`)
        }
        if (!localStorage.getItem('auth-token')) {
            alert("something went wrong");
              this.$router.push('/')
              localStorage.clear();
          }
         },
         methods: {
            logout() {
                logout();
                this.$router.push('/')
              },
            async deleterate(s_id,u_id) {
                const response = await fetch(`api/rating/${s_id}/${u_id}`, {
                    method: 'DELETE',
                    headers: {
                          "Authentication-Token": localStorage.getItem("auth-token"),
                        },
                      });
                    
                    if (response.ok) {
                        alert('Rating deleted successfully.');
                        
                      } else {
                        const data = await response.json();
                        alert('Failed to delete rating: ' + data.message);
                      }          
         },
        },
        
  };
  
  export default user_account;
  

