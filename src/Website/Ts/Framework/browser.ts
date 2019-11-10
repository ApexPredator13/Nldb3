const removeHashAndQuerystring = () => {
    history.replaceState(null, document.title, window.location.href.split("?")[0]);
    history.replaceState(null, document.title, window.location.pathname + window.location.search);
}

const getHashFromUrl = () => window.location.hash.substr(1);

const getLastCharactersOfUrl = (numberOfCharacters: number) => {
    return window.location.href.substring(window.location.href.length - numberOfCharacters);
}

export {
    removeHashAndQuerystring,
    getHashFromUrl,
    getLastCharactersOfUrl
}