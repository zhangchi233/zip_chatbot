// TokenContext.js
import React from 'react';

const TokenContext = React.createContext({
    token: null,
    username: null,
    setLoginData: () => {}
});

export default TokenContext;
