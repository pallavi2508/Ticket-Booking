import {logout} from '../app.js';
const show_page = {
    template: `
    <div style="background-color: darkgray;  justify-content: center; align-items: center; height: 100vh;">
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
    <h2>List of Shows:</h2>
    </div>
        <!-- Display the list of shows -->
        <div class="card">
        <div class="card-header">
            
        </div>
        <div class="card-body">
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); grid-gap: 20px;">
            <div v-for="show in shows" :key="show.show_id" style="border: 1px solid #ccc; padding: 10px; box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);">
                <h4 style="text-align: center;">{{ show.show_name }}</h4>
                <img
                  :src="'data:image/*;charset=utf-8;base64,' + show.show_image"/>
                <p><strong>Rating:</strong> {{ show.show_rating }}</p>
                <p><strong>Timing:</strong> {{ show.show_timing }}</p>
                <p><strong>Genre:</strong> {{ show.show_genre }}</p>
                <p><strong>Price:</strong> {{ show.show_ticketprice }}</p>
                <button class="btn btn-danger" @click="deleteShow(show.show_id)">Delete</button>
                <router-link :to="'/upd_show/' + show.show_id" class="btn btn-primary">Update</router-link>
            </div>
            </div>
        </div>
        </div>
        <router-link :to="'/addshow/' + vid " class="btn btn-primary"> Add New Show </router-link>
        <router-link :to="'/admin_page/' + currentUseremail" class="btn btn-primary">Back to Admin Page</router-link>
    </div>
    `,
   data() {
    return {
        showData: {
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
   computed: {
    currentUseremail() {
      return this.$store.state.CEmail;
    },
    vid(){
        return this.$route.params.venue_id;
    }
   },
   async mounted() {
    const v_id = this.$route.params.venue_id
    const resshows = await fetch(`api/show/${v_id}`,{
      headers: { 
        'Content-Type': 'application/json', 
        "Authentication-Token": localStorage.getItem("auth-token"),  
      },  
    });  
    const datashows = await resshows.json();  
    console.log(datashows);  
    
    if (resshows.ok) {  
      this.shows = datashows;
      } else {
        alert(datashows.message)
        logout();
      }
    if (!localStorage.getItem('auth-token')) {
      alert("something went wrong");
        logout()
        localStorage.clear();
    }
     },
     methods: {
        async deleteShow(s_id) {
          const confirmDelete = confirm('Are you sure you want to delete this show?');
          if (confirmDelete) {
            const response = await fetch(`/api/showdelete/${s_id}`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                'Authentication-Token': localStorage.getItem('auth-token'),
              },
            });
    
            const data = await response.json();
            if (response.ok) {
              alert('Show deleted successfully.');
            } else {
              alert('Failed to delete show: ' + data.message);
            }
          }
        },
      },
  };
  
  export default show_page;
  
