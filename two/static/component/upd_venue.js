const upd_venue = {
    template: `
    <div id='app' style="background-color: darkgray; display: flex; justify-content: center; align-items: center; height: 100vh;">
  <div class="container">
  <div class="row justify-content-center mt-5">
  <div class="col-md-6">
  <div class="card" style="background-color: #f0f0f0; border-color: #333;">
  <div class="card-header">
          
          <form>
          <h3 class="text-center">Update Venue</h3>
            <div class="form-group">
              <label>Venue Name:</label>
              <input class="form-control" type="text" name="venue_name" v-model="venueData.venue_name" required>
            </div>
            <div class="form-group">
              <label>Venue Location:</label>
              <input class="form-control" type="text" name="venue_location" v-model="venueData.venue_location" required>
            </div>
            <div class="form-group">
              <label>Venue Capacity:</label>
              <input class="form-control" type="number" name="venue_capacity" v-model="venueData.venue_capacity" required>
            </div>
          <button class="btn btn-primary btn-block" @click.prevent="update">Update</button>
          </form> 
          </div>
          <router-link :to="'/admin_page/' + cemail" class="btn btn-primary">Back to Admin Page</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
    `,
    data() {
      return {
        venueData: {
          venue_name: '',
          venue_location: '',
          venue_capacity: 0,
        },
      };
      },
      computed: {
        cemail(){
          return this.$store.state.CEmail;
        },
        cuserid(){
          return this.$store.state.CUserId;
        }
      },
      async mounted() {
        const v_id = this.$route.params.venue_id;
        const resvenue = await fetch(`api/singlevenue/${v_id}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
          const datavenue = await resvenue.json();  
          console.log(datavenue);  
          if (resvenue.ok) {  
            this.venueData = datavenue;
            }
      },

      methods: {

        async update() {
          const venuedata = new FormData();
          venuedata.append("venue_name", this.venueData.venue_name);
          venuedata.append("venue_location", this.venueData.venue_location);
          venuedata.append("venue_capacity", this.venueData.venue_capacity);
          const v_id = this.$route.params.venue_id;
          const response = await fetch(`/api/singlevenue/${v_id}`, {
            method: "PUT",
            body: venuedata,
            headers: {
              Authorization: "Bearer " + localStorage.getItem("auth_token"),
            },
            
          });
          const data = await response.json();
          console.log(data.message);
          if (response.ok) {
            alert('Venue updated successfully!');
            this.$router.push(`/admin_page/${this.cemail}`)
          } else {
            console.log('wrong')
          }
        }
      },
};

  
  export default upd_venue;