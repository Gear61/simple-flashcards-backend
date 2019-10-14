import ReactDOM from 'react-dom';
import React from 'react';
import './styles/app.scss';
const element = <h1>Hello, world</h1>;

console.log('aosifdjaosidfjasodf');
// setTimeout allows js to be run after html loads. We could also split the script and put it after the html stuff to have it run after? I feel like this shouldn't be necessary.
setTimeout(() => {
    ReactDOM.render(element, document.body);
});