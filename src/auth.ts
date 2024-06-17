/**
 * This represents some generic auth provider API, like Firebase.
 */
const fakeAuthProvider = {
  isAuthenticated: false,
  signin(callback: VoidFunction) {
    fakeAuthProvider.isAuthenticated = true;
    // setTimeout(callback, 100); // fake async
    callback();
  },
  signout(callback: VoidFunction) {
    fakeAuthProvider.isAuthenticated = false;
    callback();
  },
};

export { fakeAuthProvider };
