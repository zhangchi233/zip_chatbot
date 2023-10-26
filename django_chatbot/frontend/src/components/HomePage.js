import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch, Link, Redirect } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Container } from "@mui/material";
import { makeStyles } from "@mui/styles";
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import ChatBotPage from './ChatBotPage';
import InteractiveBody from "./InteractiveBody";
import UploadImagePage from "./UploadImagePage";
import TokenContext from './TokenContext';
import './HomePage.css';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundImage: `url('../../static/images/medical_records1.jpg')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    minHeight: '100vh',
  },
  title: {
    flexGrow: 1,
    fontFamily: '"StylishFontName", sans-serif', 
  },
}));

export default function HomePage() {
    const classes = useStyles();
    const [state, setState] = React.useState({
        token: null,
        username: null,
    });

    const setLoginData = (token, username) => {
        setState({ token, username });
    };

    return (
        <TokenContext.Provider value={{
            token: state.token,
            username: state.username,
            setLoginData: setLoginData
        }}>
        
            <Router>
            <Switch>
            <Route path="/imageui" component={InteractiveBody} />
            <Route path="/chatbot" component={ChatBotPage} />
            <Route path="/upload" component={UploadImagePage} />
            <Route>
            <div className={classes.root}>
            <AppBar position="sticky">
                <Toolbar>
                    
                    
                    <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}> {/* Added Link component */}
                        <Typography variant="h6" className={classes.title}>
                            LLMbq
                        </Typography>
                    </Link>
                    <div className="button-container">
                        <Link to="/login" className="appbar-link">
                            <Button color="inherit" className="appbar-button">Login</Button>
                        </Link>
                        <Link to="/register" className="appbar-link">
                            <Button color="inherit" className="appbar-button">Register</Button>
                        </Link>
                    </div>
                </Toolbar>
            
            </AppBar>
                <Container>
                    <div className="overlay-content"> {/* Wrap your content with this div */}
                        <Switch>
                            <Route exact path="/">
                                <Typography variant="h4" align="center" style={{ marginTop: '20px' }}>
                                    Welcome to the LLMbq platform!
                                </Typography>
                            </Route>
                            <Route path="/login" component={LoginPage} />
                            
                            <Route path="/register" component={RegisterPage} />
                            
                        </Switch>
                    </div>
                </Container>
                </div>
                </Route>
                </Switch>
            </Router>
        
        </TokenContext.Provider>
    );
}
