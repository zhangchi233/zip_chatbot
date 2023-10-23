import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch, Link, Redirect } from "react-router-dom";
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import ChatBotPage from './ChatBotPage';
import InteractiveBody from "./InteractiveBody";
import TokenContext from './TokenContext';

export default class HomePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            token: null,
            username: null,
            setLoginData: () => {}, 
        }
    }
    setLoginData = (token, username) => {
        this.setState({ token, username });
    };
    render() {
        return (
            <TokenContext.Provider value={{
                token: this.state.token,
                username: this.state.username,
                setLoginData: this.setLoginData
            }}>
            <Router>
                <Switch>
                <Route exact path="/"> <p>This is the home page</p> </Route>
                    <Route path="/login" component={LoginPage} />
                    <Route path="/chatbot" component={ChatBotPage} />
                    <Route path="/register" component={RegisterPage} />
                    <Route path="/imageui" component={InteractiveBody} />
                </Switch>
            </Router>
            </TokenContext.Provider>
        );
    }
}