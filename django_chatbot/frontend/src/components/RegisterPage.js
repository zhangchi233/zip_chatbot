import React, { Component } from 'react';
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import { Link } from "react-router-dom";
import TokenContext from './TokenContext'; // Import the context
import './RegisterPage.css';
import { Snackbar, Alert } from '@mui/material';
import { authenticatedFetch } from './csrfTokenUtility';
const BASE_API_URL = 'http://127.0.0.1:8000/api'


export default class RegisterPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: "",
            email: "",
            password1: "",
            password2: "",
            token: null,
            snackbar: {
                open: false,
                message: '',
                severity: '',
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
            username: this.state.username, 
            email: this.state.email,
            password1: this.state.password1,
            password2: this.state.password2,
        };
    
        // Send a POST request to the Django server
        authenticatedFetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        })
        .then(response => {
            return response.json().then(data => {
                if (!response.ok) {
                    // Handle potential errors that come with an unsuccessful response status
                    let errMsg = data.error_message || `Status Code: ${response.status}`;
                    throw new Error(errMsg);
                }
                return data;
            });
        })
        .then(data => {
            if (data.message && data.message === "User created successfully") {
                console.log("Successfully registered!");
                this.setState({ 
                    snackbar: {
                        open: true,
                        message: 'Successfully registered!',
                        severity: 'success',
                    },
                });
                
                // Redirect to the Login Page
                this.props.history.push("/login");
            }
        })
        .catch(error => {

            console.error("There was an error during registration:", error);
            this.setState({ 
                snackbar: {
                    open: true,
                    message: error.message || 'There was an error during registration. Please try again.',
                    severity: 'error',
                },
         });
        });

    }

    render() {
        return (
            <>
            <TokenContext.Provider value={this.state.token}>
            
                <Grid container spacing={6} direction="column" alignItems="center" justifyContent="center" style={{ minHeight: '100vh' }} className='rightAlignGrid'>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Welcome!
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        Register as a new user
                    </Typography>
                    <FormControl component="fieldset" style={{ width: '300px', marginBottom: '15px' }}>
                        <TextField label="Username" type="username" name="username" value={this.state.username} onChange={this.handleInputChange} fullWidth />
                        <TextField label="E-mail" type="email" name="email" value={this.state.email} onChange={this.handleInputChange} fullWidth style={{ marginTop: '10px' }} />
                        <TextField label="password1" type="password" name="password1" value={this.state.password1} onChange={this.handleInputChange} fullWidth style={{ marginTop: '10px' }}/>
                        <TextField label="Password2" type="password" name="password2" value={this.state.password2} onChange={this.handleInputChange} fullWidth style={{ marginTop: '10px' }} />
                    </FormControl>
                    <Button variant="contained" color="primary" onClick={this.handleSubmit} >
                        Create Account
                    </Button>
                    <Link to="/login" className="loginlink">Already have an account? Log in</Link>
                </Grid>
            </TokenContext.Provider>
            <Snackbar 
                open={this.state.snackbar.open}
                autoHideDuration={6000}
                onClose={this.handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                >
                <Alert onClose={this.handleSnackbarClose} severity={this.state.snackbar.severity}>
                    {this.state.snackbar.message}
                </Alert>
             </Snackbar>
            </>
        );
    }
}
