const admin_register = {
  template: `
  <div id='app' style="background-color: darkgray; display: flex; justify-content: center; align-items: center; height: 100vh;">
  <div class="container">
  <div class="row justify-content-center mt-5">
  <div class="col-md-6">
  <div class="card" style="background-color: #f0f0f0; border-color: #333;">
  <div class="card-header">
      <form>
        <h2 class="text-center">Admin Registration</h2>
        <div class="form-group">
          <label>Email:</label>
          <input class="form-control" type="email" name="email" v-model="data_form.email" required>
        </div>
        <div class="form-group">
          <label>Username:</label>
          <input class="form-control" type="text" name="name" v-model="data_form.username" required>
        </div>
        <div class="form-group">
          <label>Password:</label>
          <input class="form-control" type="password" name="password" v-model="data_form.password" required>
        </div>
        <button class="btn btn-primary btn-block" @click.prevent="adminRegister">Register</button>
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
    data_form: {
      username: '',
      useremail: '',
      password: ''
    }
  }
},
  methods: {
    async adminRegister() {
      const response = await fetch('/api/admin_register', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.data_form)
        })
        const data = await response.json()
        alert(data.message)
        if(response.ok){          
          this.$router.push('/')
        }
        else{
          console.log('could not register')
        }
  }
}
};

export default admin_register;
