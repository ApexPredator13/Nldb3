// just some test code to test webpack bundling

const logSomething = () => console.log('something')

const newDiv = document.createElement('div');
if (newDiv) {
    newDiv.innerText = "some text";
    if (document.firstChild) {
        document.firstChild.appendChild(newDiv);
    }
}

const asyncFunction = async () => {
    await Promise.resolve();
}

let x = asyncFunction();