import store from '../store.js';
const search = {
  template: `
  <div style="background-color: darkgray; display: flex; justify-content: center; align-items: center; height: 100vh;">
  <div class="search-container">
  <h2>Search Page</h2>
  <div class="search-card">
    <div>
      <label for="search_text">Search:</label>
      <input type="text" v-model="searchText">
      <button class="btn btn-primary" @click.prevent="search">Search</button>
    </div>
    <!-- Display the search results -->
    <div v-if="venues.length > 0">
      <h3>Venues:</h3>
      <ul>
        <li v-for="venue in venues" :key="venue.venue_id">
        Venue: 
        <router-link :to="'/user_page/' + cemail + '/user_show/' + venue.venue_id ">
         {{ venue.venue_name }} 
          </router-link>
           Location: {{ venue.venue_location }}
        </li>
      </ul>
    </div>
    <div v-else>
      <p>Venues: No venues found.</p>
    </div>

    <div v-if="shows.length > 0">
      <h3>Shows:</h3>
      <ul>
        <li v-for="show in shows" :key="show.show_id">
        <router-link :to="'/user_page/' + cemail + '/user_show/' + show.su_id + '/user_booking/' + show.show_id" >
              {{ show.show_name }}
            </router-link>
            Rating: {{ show.show_rating }} - Action: {{ show.show_genre }}
        </li>
      </ul>
    </div>
    <div v-else>
      <p>Shows: No shows found.</p>
    </div>
  </div>
  <router-link :to="'/user_page/' + cemail" class="btn btn-primary">Back to User Page</router-link>
</div>  
</div>
`,
  data() {
    return {
      searchText: "",
      venues: [],
      shows: [],
      
    };
  },
  computed: {
    cemail() {
      return this.$store.state.CEmail;
  },
    vid() {
      return this.$route.params.venue_id;
    }
  },
  methods: {
    async search() {
      const response = await fetch(`/api/search?q=${this.searchText}`, {
        method: "GET",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("auth_token"),
        },
      });
      const data = await response.json();
      console.log(data);
      if (response.ok) {
        this.venues = data.venues;
        this.shows = data.shows;
      } else {
        console.log("Error fetching search results.");
      }
      
    },
  },
};

export default search;


