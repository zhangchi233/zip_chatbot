import React, { Component, useContext } from 'react';
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Paper from "@material-ui/core/Paper";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import './ChatBotPage.css';
import { authenticatedFetch } from './csrfTokenUtility.js';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Link from '@material-ui/core/Link';
import TokenContext from './TokenContext';

import InteractiveBody from './InteractiveBody'

const BASE_API_URL = 'http://127.0.0.1:8000/api/'
export default class ChatBotPage extends Component {
    static contextType = TokenContext;
    constructor(props) {
        super(props);
        this.state = {
            messages: [{text: "LLMbq. Welcome to the Medical Assistant !. Please select the body part you have complaints about", sender: 'bot'}],
            inputMessage: "",
            showModal: true,
            bodyPart: "",
            bodyPartSelected: false,
            nmessages: 0,
        };
    }

    handleInputChange = (event) => {
        this.setState({
            inputMessage: event.target.value
        });
    }

    handleSend = () => {
        const { messages, inputMessage } = this.state;
        const newMessages = [...messages, {text: inputMessage, sender: 'user'}];
        this.setState(({
            messages: newMessages,
            inputMessage: ""
        }));
        const userMessageCount = newMessages.filter(message => message.sender === 'user').length;
        this.setState({ nmessages: userMessageCount });
        console.log(userMessageCount);
        console.log("hello")

        if (inputMessage.trim()) {
            var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
            console.log(tzoffset)
            const currentDateTime = (new Date(Date.now() - tzoffset)).toISOString().replace('T', ' ').replace('Z', '');
            console.log(currentDateTime)

            // Send the input message to the Django backend
            authenticatedFetch("/api/openai", {
                method: "POST",
                headers: {
                    'Authorization': `Token ${this.context.token}`
                },
                body: JSON.stringify({ message: inputMessage, starttime: currentDateTime, nmessages: userMessageCount })
            })
            .then(response => response.json())
            .then(data => {
                this.setState(prevState => ({
                    messages: [...prevState.messages, {text: data.response, sender: 'bot'}],
        
                }));
            });
        }
    }
    handleShowBody = () => {
        this.setState({ showModal: true });
    }
    handleClose = () => {
        this.setState({ showModal: false });
    }
    handleDownloadReport = () => {
        window.open('/api/download_report', '_blank');  // Opens a new window or tab to download the report
    }

    handleClearChat = () => {
        this.setState({ messages: [] });
    }
    handleKeyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();  // prevent new line
            this.handleSend();
        }
    }
        handleLogout = () => {
            // Make a request to the Django backend to logout
            authenticatedFetch("/api/logout", { 
                method: "POST",
                headers: {
                    'Authorization': `Token ${this.context.token}`
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    // Delete the token from local storage (assuming you saved it there upon login)
                    // localStorage.removeItem('authToken');
                    this.context.setLoginData(null, null);
        
                    // Redirect to the login page
                    this.props.history.push("/login");
                } else {
                    console.error('Logout failed:', data.message);
                }
            });
        }
    
    handleBodyPartClick = (part) => {
            this.setState({ 
                bodyPart: part, 
                inputMessage: `I have complaint in my ${part}`, 
                bodyPartSelected: true 
            });

    }
    handleClearSelection = () => {
        this.setState({ bodyPartSelected: false, bodyPart: "", inputMessage: "" });
    }

    getUserMessageCount = (messagesArray = this.state.messages) => {
        return messagesArray.filter(message => message.sender === 'user').length;
    }
    
    componentDidUpdate(prevProps, prevState) {
        // Check if the modal was closed and a body part was previously selected
        if (prevState.showModal && !this.state.showModal && this.state.bodyPartSelected) {
            this.handleSend();
            this.setState({
                bodyPartSelected: false // Reset the flag after sending the message
            });
        }
    }

    componentDidMount()  {
        console.log(this.context.token, this.context.username)
        console.log(this.state.nmessages)
        // Fetch the last 10 interactions for the user
        const username = this.context.username;
        if (!this.context.token || !this.context.username) {
            this.props.history.push("/login");
            return;
        }
        
        this.state.nmessages = this.getUserMessageCount();
        if (username) {
            // this.fetchUserInteractions(username);
        }
    }
    fetchUserInteractions = (username) => {
        authenticatedFetch(`api/interactions?username=${username}&limit=10`, {
            method: "GET",
            headers: {
                'Authorization': `Token ${this.context.token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            // Assuming the API returns the interactions as a list (adjust according to your backend response)
            this.setState({ messages: data });
        })
        .catch(error => {
            console.error("Error fetching user interactions:", error);
        });
    };
    
    render() {
        const { messages, inputMessage } = this.state;

        return (
            <>
            <Grid container spacing={3} direction="column" alignItems="center" justify="center" style={{ minHeight: '100vh' }}>
                
                {/* Only Logout Link here */}
                <div style={{ width: '90%', display: 'flex', justifyContent: 'flex-end' }}>
                    <Link href="#" onClick={this.handleLogout} style={{ color: 'blue', textDecoration: 'none', margin: '10px' }}>
                        Logout
                    </Link>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '50%' }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        
                    </Typography>
                    <Button className="body-button" variant="contained" color="primary" onClick={this.handleShowBody}>
                        Show Anatomy
                    </Button>
                    <Button className="body-button" variant="contained" color="primary" onClick={this.handleDownloadReport}>
                        Download Report
                    </Button>

                    <Button className="body-button" variant="contained" color="primary" onClick={this.handleClearChat}>
                        Clear Chat
                    </Button>
                </div>
            
                <Paper className="chat-container" style={{ height: '75%', width: '90%', overflowY: 'auto', marginBottom: '20px' }}>
                    <List>
                        {messages.map((message, index) => (
                            <ListItem className={`message ${message.sender}`} key={index}>
                                <ListItemText primary={message.text} secondary={message.sender === 'user' ? 'Patient' : 'LLMbq'} />
                            </ListItem>
                        ))}
                    </List>
                </Paper>
                <Grid className="input-container" container direction="row" alignItems="center" justify="center" spacing={2} style={{ width: '80%', position: 'fixed', bottom: '10px', background: '#fff' }}>
                    <Grid item xs={9}>
                        <TextField className="input-field"
                            fullWidth
                            variant="outlined"
                            value={inputMessage}
                            onChange={this.handleInputChange}
                            onKeyDown={this.handleKeyDown}
                            placeholder="Type your message..."
                            style={{ backgroundColor: '#f0f0f0' }}
                        />
                    </Grid>
                    <Grid item xs={3} direction='row'>
                        <Button className="send-button" variant="contained" color="primary" fullWidth onClick={this.handleSend}>
                            Send
                        </Button>
                        
                    </Grid>        
                </Grid>
            </Grid>
            <Modal
                    aria-labelledby="interactive-body-modal"
                    open={this.state.showModal}
                    onClose={this.handleClose}
                    closeAfterTransition
                    BackdropComponent={Backdrop}
                    BackdropProps={{
                        timeout: 500,
                    }}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Fade in={this.state.showModal}>
                        <div style={{ outline: 'none', backgroundColor: 'white', padding: '20px', borderRadius: '10px' }}>
                        <InteractiveBody  onPartClick={this.handleBodyPartClick} onClearSelection={this.handleClearSelection} />
                        </div>
                    </Fade>
            </Modal>
        </>

        );
    }
}