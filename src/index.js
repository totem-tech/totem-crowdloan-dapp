import React from 'react';
import ReactDOM from 'react-dom';

const App = () => <div>
    This is react app with webpack
</div>
ReactDOM.render(
    <App />,
    document.getElementById('root'),
);


const test = () => {
    require('web3-utils')
}