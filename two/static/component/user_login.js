const user_login = {
  template: `
  <div id='app' >
  <div class="container">
  <div class="row justify-content-center mt-5">
  <div class="col-md-6">
  <div class="card" style="background-color: #f0f0f0; border-color: #333;">
  <div class="card-header">
  <form>
    <h2 class="text-center">User Login</h2>
    <div class="form-group">
      <label>Email:</label>
      <input class="form-control" type="email" name="email" v-model="data_name.email" required>
    </div>
    <div class="form-group">
      <label>Password:</label>
      <input class="form-control" type="password" name="password" v-model="data_name.password" required>
    </div>
    
    <center><button class="btn btn-primary btn-block" @click.prevent="userLogin">Login</button></center>
  </form>
  </div>
  <router-link to="/" class="btn btn-primary">Back to Welcome Page</router-link>
  </div>
  </div>
  </div>
  </div>
  </div>
  `,
  data() {
    return {
      data_name: {
        email: '',
        password: ''
      },
      error: ''
    };
  },
  methods: {
    async userLogin() {
      const response = await fetch('/login?include_auth_token', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.data_name)
      });
      const data = await response.json();
      console.log(data)
      this.login;
      if(response.ok) {
        localStorage.setItem('auth-token', data.response.user.authentication_token);
        
        this.$router.push(`/user_page/${this.data_name.email}`)
      } else {
        alert(data.message)
      }
      
    }
  
  }
};
  
  export default user_login;
  