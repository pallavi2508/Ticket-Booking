import store from '../store.js';
const user_booking = {
    template: `
    <div id='app' style="background-color: darkgray;  justify-content: center; align-items: center; height: 100vh;">
    <div class="container">
    <table class="table">
      <tbody>
        <tr>
          <th>Show Name:</th>
          <td>{{ showD.show_name }}</td>
        </tr>
        <tr>
          <th>Venue Name:</th>
          <td>{{ venueData.venue_name }}</td>
        </tr>
        <tr>
          <th>Venue Location:</th>
          <td>{{ venueData.venue_location }}</td>
        </tr>
        <tr>
          <th>Show Timing:</th>
          <td>{{ showD.show_timing }}</td>
        </tr>
        <tr>
          <th>Show Price:</th>
          <td>{{ showD.show_ticketprice }}</td>
        </tr>
      </tbody>
    </table>
    <div v-if="(!showD.show_timing || new Date(showD.show_timing) >= new Date())">
        <div class="row justify-content-center mt-5">
            <div class="col-md-6">
                <div class="card" style="background-color: #f0f0f0; border-color: #333; ">
                    <div class="card-header">
                        <form>
                        <h2 class="text-center">Book Tickets</h2>
                        <div class="form-group">
                            <label>Tickets:</label>
                            <input type="number" name="booking_tickets" v-model="bookingData.booking_tickets" min="1" required>
                        </div>
                        <div class="form-group">
                            <label>Price per Ticket:</label>
                            <input type="number" v-model="showD.show_ticketprice" disabled>
                        </div>
                        <div class="form-group">
                            <label>Total Price:</label>
                            <input type="number" :value="calculateTotalPrice" disabled>
                        </div>
                        <div v-if="showD.available_tickets !== 0">
                          <button class="btn btn-primary btn-block" @click.prevent="booked">Book</button>
                        </div>
                        <div v-else>
                          <h4> Houseful </h4>
                        </div>
                        </form>
                        <router-link :to="'/user_page/' + currentUserEmail + '/user_show/' + vid" class="btn btn-primary w-100" >Back to Show Page</router-link>  

                    </div>
                </div>
            </div>
        </div>
      </div>
      <div v-else>
        <h3> Booking Closed!! </h3>
      </div>
    </div>
    
  </div>
    `,
   data() {
    return {
        showData: {
           
        },
        venueData: {
            venue_name: ''
        },
        bookingData: {
            booking_tickets: 0
        },
        showD: {
            show_name: '',
            show_timing: '',
            show_tags: '',
            show_ticketprice: 0,
            available_tickets: 0
        },
        bookings: []
    };
   },
   computed: {
    currentUserEmail() {
      return this.$store.state.CEmail;
    },
    currentUserId() {
        return this.$store.state.CUserId;
      },
    calculateTotalPrice() {
        return this.bookingData.booking_tickets * this.showD.show_ticketprice;
      },
    vid() {
        return this.$route.params.vid;
      }
  },
  async mounted() {
    const email = this.$route.params.email; 
    const s_id = this.$route.params.show_id
    const resbook = await fetch(`api/singleshow/${s_id}`,{
        headers: {
            "Content-Type": "application/json",
            "Authentication-Token": localStorage.getItem("auth-token"),
          }, 
    });  
    const databook = await resbook.json();  
  
    console.log(databook);  
    if (resbook.ok) {  
      this.showD = databook;
      }
    else {
        alert(resbook.message)
    }
    if (!localStorage.getItem('auth-token')) {
      alert("something went wrong");
        this.$router.push('/')
        localStorage.clear();
    } 
    const v_id  = this.$route.params.vid;
    const res = await fetch(`api/singlevenue/${v_id}`,{
        headers: {
            "Content-Type": "application/json",
            "Authentication-Token": localStorage.getItem("auth-token"),
          }, 
            });
            const vdata = await res.json();
            if (res.ok) {
                this.venueData = vdata;
            }
            else {
                alert(res.message)
            }
     },

   methods: {
    async booked() {
      const bookdata = new FormData();
      if (this.bookingData.booking_tickets === 0) {
        alert('Please enter a value greater then 0')
        return ;
      }
      if (this.bookingData.booking_tickets > this.showD.available_tickets) {
        alert(`Please enter a smaller value as only ${this.showD.available_tickets} are left`)
        return ;
      }
      bookdata.append("booking_tickets", this.bookingData.booking_tickets);
      const s_id = this.$route.params.show_id;

      const response = await fetch(`/api/booking/${s_id}`, {
        method: "POST",
        body: bookdata,
        headers: {
          Authorization: "Bearer " + localStorage.getItem("auth_token"),
        },
        
      });
      const data = await response.json();
      alert(data.message);
      if (response.ok) {
        alert('Boooked successfully!');
        this.$router.push(`/user_account/${this.currentUserId}`)
      } else {
        console.log('wrong')
      }
    }
  },

  };
  
  export default user_booking;