import React from 'react';
import ReactDOM from 'react-dom';

const ComingSoon = () => (
    <div style={{ textAlign: 'center' }}>
        <br />
        <h1>Totem Crowdloan is coming soon.</h1>
        <h3>Stay tuned!</h3>
        <p>Check out our <a href="https://totem.live">testnet app</a>.</p>
        <p>Join us on <a href="https://discord.gg/Vx7qbgn">Discord</a> and <a href="https://t.me/totemchat">Telegram</a></p>
        <p>For more information visit <a href="https://totemaccounting.com">our website.</a></p>
    </div>
)
ReactDOM.render(
    <ComingSoon />,
    document.getElementById('root'),
)