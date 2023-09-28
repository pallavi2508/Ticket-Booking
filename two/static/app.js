import admin_register from "./component/admin_register.js";
import first from "./component/first.js";
import admin_login from "./component/admin_login.js";
import user_login from "./component/user_login.js";
import user_register from "./component/user_register.js";
import admin_page from "./component/admin_page.js";
import addvenue from "./component/addvenue.js";
import show_page from "./component/show_page.js";
import addshow from "./component/addshow.js";
import store from "./store.js";
import user_page from "./component/user_page.js";
import user_show from "./component/user_show.js";
import user_booking from "./component/user_booking.js";
import user_account from "./component/user_account.js";
import rating from "./component/rating.js";
import search from "./component/search.js";
import upd_show from "./component/upd_show.js";
import upd_venue from "./component/upd_venue.js";



const routes = [
    { path: '/' ,component: first },
    { path:  '/admin_register' , component: admin_register},
    { path: '/admin_login' , component: admin_login},
    { path: '/user_login' , component: user_login},
    { path:  '/user_register' , component: user_register},
    { path: '/admin_page/:email' , component: admin_page},
    { path: '/admin_page/:email/addvenue' , component: addvenue},
    { path: '/show_page/:venue_id' , component: show_page, name:'show_page', props:true},
    { path: '/addshow/:vid' , component: addshow, props:true},
    { path: '/user_page/:email', component: user_page},
    { path: '/user_page/:email/user_show/:venue_id' , component: user_show, props:true},
    { path: '/user_page/:email/user_show/:vid/user_booking/:show_id' , component: user_booking, props:true},
    { path: '/user_account/:id', component: user_account, props:true},
    { path: '/rating/:show_id/:id', component: rating, props:true},
    { path: '/search', component: search},
    { path: '/upd_show/:show_id', component: upd_show, props:true},
    { path: '/upd_venue/:venue_id', component: upd_venue,name: "upd_venue", props:true}
]

const router = new VueRouter({
    routes,
    base:'/',
});



const app = new Vue({
  el: '#app',
  template: '<div><router-view /></div>',
  router,
  store,
  methods: {
    async logout() {
      const res = await fetch('/logout');
      if (res.ok) {
        localStorage.clear();
       
        this.$store.commit('setCurrentUser', {
          id: null,
          username: null,
          email: null,
          roles: []
          });
        this.$router.push('/');
          
      } else {
        console.log('could not log out');
      }
    },
  },

});


export const logout=app.logout;