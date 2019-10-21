import ReactDOM from 'react-dom';
import React from 'react';
import './styles/app.scss';
import App from './components/App';

// setTimeout allows js to be run after html loads. We could also split the script and put it after the html stuff to have it run after? I feel like this shouldn't be necessary.
setTimeout(() => {
    ReactDOM.render(<App />, document.getElementById('root'));
});