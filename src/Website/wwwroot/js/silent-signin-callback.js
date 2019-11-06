Oidc.Log.logger = console;
new Oidc.UserManager().signinSilentCallback()
    .catch((err) => {
    console.warn(err);
});