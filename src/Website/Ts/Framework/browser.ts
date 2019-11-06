const removeHashAndQuerystring = () => {
    history.replaceState(null, document.title, window.location.href.split("?")[0]);
    history.replaceState(null, document.title, window.location.pathname + window.location.search);
}

const getHashFromUrl = () => window.location.hash.substr(1);

export {
    removeHashAndQuerystring,
    getHashFromUrl
}