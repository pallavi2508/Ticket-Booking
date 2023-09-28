const first={
    template:`<div id="app" style="display: flex; justify-content: center; align-items: center; height: 100vh;">
    <div >

    <h2>Welcome to the Booking Show Application!</h2>
      <div class="container">
        <div class="row justify-content-center mt-5">
          <div class="col-md-15">
            <div class="card" style="background-color: #f0f0f0; border-color: #333;">
              <div class="form-group" style="color: #333;">
                <h5 class="text-center">Register as Admin</h5>
                <div class="text-center">
                  <router-link to="/admin_register">Go to Admin Register Page</router-link>
                </div>
                <h5 class="text-center">Login as Admin.</h5>
                <div class="text-center">
                  <router-link to="/admin_login">Go to Admin Login Page</router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <p></p>
  
        <div class="row justify-content-center mt-5">
          <div class="col-md-15">
            <div class="card" style="background-color: #f0f0f0; border-color: #333;">
              <div class="form-group" style="color: #333;">
                <h5 class="text-center">Register as User</h5>
                <div class="text-center">
                  <router-link to="/user_register">Go to User Register Page</router-link>
                </div>
                <h5 class="text-center">Login as User.</h5>
                <div class="text-center">
                  <router-link to="/user_login">Go to User Login Page</router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
`
}

export default first