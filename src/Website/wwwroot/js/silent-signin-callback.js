Oidc.Log.logger = console;
console.log('signin silent callback triggered');
new Oidc.UserManager().signinSilentCallback()
    .catch((err) => {
    console.warn(err);
});