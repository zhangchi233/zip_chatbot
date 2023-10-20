import React, { Component } from 'react';
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";
import { Link } from "react-router-dom";
import TokenContext from './TokenContext'; // Import the context
import './LoginPage.css';
import { authenticatedFetch } from './csrfTokenUtility';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';  // This component is part of @material-ui/lab

const BASE_API_URL = 'http://127.0.0.1:8000/api'

export default class LoginPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            csrfToken: null,
            token: null,
            snackbar: {
                open: false,
                message: '',
            },
        };
        
    }

    handleInputChange = (event) => {
        const { name, value } = event.target;
        this.setState({
            [name]: value
        });
    }

    handleSubmit = (event) => {
        event.preventDefault();
        
        // Construct the form data
        const formData = {
            username: this.state.username, // Assuming the 'email' field is used as 'username' in Django's User model
            password: this.state.password
        };
    
        // Send a POST request to the Django server
        authenticatedFetch('http://127.0.0.1:8000/api/login', {
            method: 'POST',
            body: JSON.stringify(formData),
        })
        .then(response => {
            if (response.headers.get('Content-Type') === 'application/json') {
                return response.json();
            } else {
                throw new Error("Server response wasn't JSON");
            }
        })
        
        .then(data => {
            if (data.token) {
                console.log("Successfully logged in!");
                this.setLoginData(data.token, this.state.username);
                this.props.history.push("/chatbot");
            } else {
                this.setState({
                    snackbar: {
                        open: true,
                        message: data.error || "Login failed.",
                    },
                });
            }
        })
        .catch(error => {
            console.error("There was an error logging in:", error);
            this.setState({
                snackbar: {
                    open: true,
                    message: error.message || "There was an error logging in. Please try again.",
                },
            });
        });
        
    }
    setLoginData = (token, username) => {
        this.setState({ token, username });
    };

    render() {
        return (
            <>
            <TokenContext.Provider value={{ 
            token: this.state.token, 
            username: this.state.username, 
            setLoginData: this.setLoginData 
        }}>
            <Link to="/register" className="signupLink">New User? Sign Up</Link>
            <Grid container spacing={3} direction="column" alignItems="center" justify="center" style={{ minHeight: '100vh' }} className='rightAlignGrid'>
                <Typography variant="h4" component="h1" gutterBottom>
                    Welcome Back!
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Login to continue
                </Typography>
                <FormControl component="fieldset" style={{ width: '300px', marginBottom: '15px' }}>
                    <TextField label="Username" type="username" name="username" value={this.state.username} onChange={this.handleInputChange} fullWidth />
                    <TextField label="Password" type="password" name="password" value={this.state.password} onChange={this.handleInputChange} fullWidth style={{ marginTop: '10px' }} />
                </FormControl>
                <Button variant="contained" color="primary" onClick={this.handleSubmit} >
                    LOGIN
                </Button>
                <Link to="/forgot-password" style={{ marginTop: '15px' }}>Forget Password?</Link>
            </Grid>
            </TokenContext.Provider>
                <Snackbar 
                open={this.state.snackbar.open}
                autoHideDuration={6000}
                onClose={this.handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <Alert onClose={this.handleSnackbarClose} severity="error">
                    {this.state.snackbar.message}
                </Alert>
             </Snackbar>
            </>
        );
    }
}

