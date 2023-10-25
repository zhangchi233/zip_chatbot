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
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

import InteractiveBody from './InteractiveBody'

const BASE_API_URL = 'http://127.0.0.1:8000/api/'
export default class ChatBotPage extends Component {
    static contextType = TokenContext;
    constructor(props) {
        super(props);
        this.state = {
            messages: [],
            inputMessage: "",
            showModal: true,
            bodyPart: "",
            bodyPartSelected: false,
            nmessages: 0, // Number of messages sent by the user
            finishConversation: false,
            starttime: null,
        };
    }
    handleInputChange = (event) => {
        this.setState({
            inputMessage: event.target.value
        });
    }
    getCurrentDateTime = () => {
        var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
        console.log(tzoffset)
        const currentDateTime = (new Date(Date.now() - tzoffset)).toISOString().replace('T', ' ').replace('Z', '');
        console.log(currentDateTime)
        return currentDateTime;
    }
    formatDateTime = (datetime) => {
        const date = new Date(datetime);
        const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        return formattedDate;
    }
    saveMessagesLocally = (messages) => {
        // Save the messages to local storage

        localStorage.setItem('messages', JSON.stringify(messages));
    }
    getMessagesFromLocalStorage = () => {
        const storedMessages = localStorage.getItem('messages');
        return storedMessages ? JSON.parse(storedMessages) : [];
    }
    handleSend = () => {
        const currentDateTime = this.getCurrentDateTime();
        const { starttime, messages, nmessages, inputMessage } = this.state;
        let chatstarttime = starttime;
        if(nmessages === 0) {
            chatstarttime = this.getCurrentDateTime();
        }
        const newMessages = [...messages, {text: inputMessage, sender: 'user', time: currentDateTime}];
        const userMessageCount = newMessages.filter(message => message.sender === 'user').length;
        this.setState({
            messages: newMessages,
            inputMessage: "",
            starttime: chatstarttime,
            nmessages: userMessageCount
        }, () => { // Using callback form of setState to ensure we have the latest state
            this.saveMessagesLocally(this.state.messages);
        });
        // Count the number of messages sent by the user
        console.log(starttime, chatstarttime);
        console.log(userMessageCount);
        console.log("hello")

        if (inputMessage.trim()) {
            

            // Send the input message to the Django backend
            authenticatedFetch("/api/openai", {
                method: "POST",
                headers: {
                    'Authorization': `Token ${this.context.token}`
                },
                body: JSON.stringify({ message: inputMessage, starttime: chatstarttime, nmessages: userMessageCount })
            })
            .then(response => response.json())
            .then(data => {
                const botTime = this.getCurrentDateTime();
                this.setState(prevState => ({
                    messages: [...prevState.messages, { text: data.response, sender: 'bot', time: botTime }],
                    finishConversation: data.conversation
                }), () => {
                    this.saveMessagesLocally(this.state.messages);  // Save the messages to local storage
                });
                console.log(data.conversation)
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
        const username = encodeURIComponent(this.context.username);  // Ensure the username is URL encoded to handle any special characters
        const starttime = this.state.starttime;

        if (this.conversation === true) {
            window.open(`../download_report?username=${username}&starttime=${starttime}`, '_blank');}
        else{
            // please complete the conversation
            alert("Please complete the conversation and give more details about your helath condition");}
    }
    handleUploadReport = () => {
        // redirect to upload report page
        if (this.conversation === true) {
            var url = `/upload?username=${username}&starttime=${starttime}`;
            // redirect to upload report page
            window.location.href = url;
        }
        else{
            // please complete the conversation
            alert("Please complete the conversation and give more details about your helath condition");}

    }
    handleClearChat = () => {
        this.setState({ messages: [], nmessages: 0, starttime: null }); // Clear the messages array
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
                localStorage.clear();
    
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
        
        console.log(this.state.nmessages)
        // Fetch the last 10 interactions for the user
        const token = localStorage.getItem('authToken');
        const username = localStorage.getItem('authUsername'); 
        console.log(token, username)
        this.context.setLoginData(token, username);
        if (!token || !username) {
            this.props.history.push("/login");
            return;
        }
        // this.state.nmessages = this.getUserMessageCount();
        const { messages, inputMessage } = this.state;
        const storedMessages = this.getMessagesFromLocalStorage();
        if(storedMessages.length === 0) {
            const newMessage = {text: `LLMbq. Welcome to the Medical Assistant ${username}!. Please select the body part you have complaints about`, sender: 'bot', time: this.getCurrentDateTime()}
            const newMessages = [...messages, newMessage];
            this.setState(({
                messages: newMessages,
                inputMessage: ""
            }));
        } else {
            this.setState({ messages: storedMessages });
        }
        
        
    }
    // fetchUserInteractions = (username) => {
    //     authenticatedFetch(`api/interactions?username=${username}&limit=10`, {
    //         method: "GET",
    //         headers: {
    //             'Authorization': `Token ${this.context.token}`
    //         }
    //     })
    //     .then(response => response.json())
    //     .then(data => {
    //         // Assuming the API returns the interactions as a list (adjust according to your backend response)
    //         this.setState({ messages: data });
    //     })
    //     .catch(error => {
    //         console.error("Error fetching user interactions:", error);
    //     });
    // };
    
    render() {
        const { messages, inputMessage } = this.state;

        return (
            <>
            <Grid container spacing={3} direction="column" alignItems="center" justify="center" style={{ minHeight: '100vh' }}>
                
                {/* Only Logout Link here */}
                <div style={{ width: '90%', display: 'flex', justifyContent: 'flex-end' }}>
                    {/* <Button className="body-button" variant="contained" color="primary" onClick={this.handleShowBody}>
                        Show Anatomy
                    </Button>
                    <Button className="body-button" variant="contained" color="primary" onClick={this.handleDownloadReport}>
                        Download Report
                    </Button>

                    <Button className="body-button" variant="contained" color="primary" onClick={this.handleClearChat}>
                        Clear Chat
                    </Button> */}
                    <Link href="#" className="body-Link" variant="contained" color="primary" onClick={this.handleShowBody} style={{ color: 'blue', textDecoration: 'none', margin: '10px' }}>
                        Show Anatomy
                    </Link>
                    <Link href="#" className="body-Link" variant="contained" color="primary" onClick={this.handleDownloadReport} style={{ color: 'blue', textDecoration: 'none', margin: '10px' }}>
                        Download Report asdfa
                    </Link>
                    <Link href="#" className="body-Link" variant="contained" color="primary" onClick={this.handleUploadReport} style={{ color: 'blue', textDecoration: 'none', margin: '10px' }}>
                        Upload Report
                    </Link>

                    <Link href="#" className="body-Link" variant="contained" color="primary" onClick={this.handleClearChat} style={{ color: 'blue', textDecoration: 'none', margin: '10px' }}>
                        Clear Chat
                    </Link>
                    <Link href="#" onClick={this.handleLogout} style={{ color: 'blue', textDecoration: 'none', margin: '10px' }}>
                        Logout
                    </Link>
                    
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '50%' }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        
                    </Typography>
                    
                </div>
            
                <Paper className="chat-container" style={{ height: '75%', width: '90%', overflowY: 'auto', marginBottom: '20px' }}>
                    <List>
                        {messages.map((message, index) => (
                            <ListItem className={`message ${message.sender}`} key={index}>
                                <ListItemText primary={message.text} secondary={`${message.sender === 'user' ? 'Patient' : 'LLMbq'} - ${this.formatDateTime(message.time)}`} />
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