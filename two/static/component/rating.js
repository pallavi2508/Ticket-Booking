const rating = {
    template: `
    <div style="background-color: darkgray;  justify-content: center; align-items: center; height: 100vh;">
        <div class="container">
            <div class="row justify-cintent-center mt-5">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h2>Rating</h2>
                            <label>Rate the show (1 to 5):</label>
                            <input type="range" v-model="rateData.user_rating" min="1" max="5" required>
                            <p>Selected Rating: {{ rateData.user_rating }}</p>
                            <button class="btn btn-primary btn-block" @click.prevent="addrate">Add</button> 
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            rateData: {
                user_rating: 0, 
            }
            
        };
    },
    computed: {
        currentUserId() {
            return this.$store.state.CUserId;
          }
      },
    methods: {
        async addrate() {
            const ratedata = new FormData();
            ratedata.append("user_rating", this.rateData.user_rating);
            const s_id = this.$route.params.show_id;
            const u_id = this.currentUserId;
      
            const response = await fetch(`/api/rating/${s_id}/${u_id}`, {
              method: "POST",
              body: ratedata,
              headers: {
                Authorization: "Bearer " + localStorage.getItem("auth_token"),
              },
              
            });
            const data = await response.json();
            
            if (response.ok) {
                alert(data.message);
              this.$router.push(`/user_account/${this.currentUserId}`)
            } else {
                alert(data.message)
              console.log('Something went wrong.')
            }
          }
    },
};

export default rating;