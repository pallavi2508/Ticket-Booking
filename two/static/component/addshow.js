import store from '../store.js';
const addshow = {
    template: `
    <div id='app' style="background-color: darkgray; display: flex; justify-content: center; align-items: center; height: 100vh;">
        <div class="container">
            <div class="row justify-content-center mt-5">
                <div class="col-md-6">
                    <div class="card" style="background-color: #f0f0f0; border-color: #333;">
                        <div class="card-header">
                            <form>
                            <h2 class="text-center">Create a new Show</h2>
                            <div class="form-group">
                                <label>Show Name:</label>
                                <input type="text" name="show_name" v-model="showData.show_name" required>
                            </div>
                            <div class="form-group">
                                <label>Timing:</label>
                                <input type="datetime-local" name="show_timing" v-model="showData.show_timing" required>
                            </div>
                            <div class="form-group">
                                <label>Genre:</label>
                                <input type="text" name="show_tags" v-model="showData.show_genre" required>
                            </div>
                            <div class="form-group">
                                <label>Price:</label>
                                <input type="number" name="show_ticketprice" v-model="showData.show_ticketprice" min="0" required>
                            </div>
                            <div class="form-group">
                                <label>Show Image:</label>
                                <input type="file" name="show_image" v-on:change="onFilechange" required>
                            </div>
                            <button class="btn btn-primary btn-block" @click.prevent="addShow">Add Show</button>
                            </form>
                        </div>
                        <router-link :to="'/show_page/' + vid" class="btn btn-primary">Back to Show Page</router-link>
                    </div>
                </div>
            </div>
        </div>
      </div>
    `,
   data() {
    return {
        showData: {
            su_id: 0,
            show_name: '',
            show_timing: '',
            show_genre: '',
            show_ticketprice: 0,
            show_image: null
        },
        shows: [],
    };
   },
   computed: {
    currentUserEmail() {
      return this.$store.state.CEmail;
    },
    vid() {
      return this.$route.params.vid;
  }
  },

   methods: {
    onFilechange(event) {
      console.log(event);
      this.showData.show_image = event.target.files[0];
    },
    async addShow() {
      const time = this.showData.show_timing
      if (new Date(time).getTime() < new Date().getTime())
      { alert('Enter that Date which is not passed!')
    return ; }
      const showdata = new FormData();
      showdata.append("show_name", this.showData.show_name);
      showdata.append("show_timing", this.showData.show_timing);
      showdata.append("show_genre", this.showData.show_genre);
      showdata.append("show_ticketprice", this.showData.show_ticketprice);
      showdata.append("show_image", this.showData.show_image);
      const v_id = this.$route.params.vid;
      const response = await fetch(`/api/show/${v_id}`, {
        method: "POST",
        body: showdata,
        headers: {
          Authorization: "Bearer " + localStorage.getItem("auth_token"),
        },
        
      });
      const data = await response.json();
      
      if (response.ok) {
        alert('Show added successfully!');
        this.$router.push(`/admin_page/${this.currentUserEmail}`)
      } else {
        console.log('wrong')
        alert(data.message);
      }
    }
  },
  };
  
  export default addshow;