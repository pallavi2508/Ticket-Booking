const store = new Vuex.Store({
  state: {
    CUser: null,
    CUserName: null,
    CUserId: null,
    CEmail: null,
    CRole: [],
  },
  mutations: {
    setCurrentUser(state, user) {
      state.CUser = user;
      state.CUserName = user.username;
      state.CUserId = user.id;
      state.CEmail = user.email;
      state.CRole = user.roles;
    },
  }
});

export default store;