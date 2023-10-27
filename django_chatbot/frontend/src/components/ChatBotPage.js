import React, { Component, useContext } from 'react';
import TokenContext from './TokenContext';
import './ChatBotPage.css';
import { authenticatedFetch } from './csrfTokenUtility.js';
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Link from '@mui/material/Link';
import UploadImagePage from './UploadImagePage';
import { AppBar, Toolbar, Container, Alert } from "@mui/material";
import { makeStyles } from "@mui/styles";
import Snackbar from '@mui/material/Snackbar';
import styles from './ChatStyles.module.css';

import InteractiveBody from './InteractiveBody'

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
            UploadImage: false,
            snackbar: {
                open: false,
                message: '',
                severity: '',
            },
            chattimeout: false,
            loadingMessage: false,

        };
    }
    handleInputChange = (event) => {
        this.setState({
            inputMessage: event.target.value
        });
    }
    getCurrentDateTime = () => {
        var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
        // console.log(tzoffset)
        const currentDateTime = (new Date(Date.now() - tzoffset)).toISOString().replace('T', ' ').replace('Z', '');
        // console.log(currentDateTime)
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
        this.setState({ 
            loadingMessage: true 
        });
        const TIMEOUT_DURATION = 10000; // 10 seconds, for instance
        let didTimeOut = false;

        const timeout = setTimeout(() => {
            didTimeOut = true;
            newMessages[newMessages.length - 1].secondary = ' - timed out'; // Update the last message to indicate the timeout
            this.saveMessagesLocally(newMessages);  // Save the messages to local storage
            this.setState({
                snackbar: {
                    open: true,
                    message: 'OpenAI request timed out. Try again.',
                    severity: 'warning',
                },
                chattimeout: true,
                loadingMessage: false,
            });
        }, TIMEOUT_DURATION);

        const currentDateTime = this.getCurrentDateTime();
        const { starttime, messages, nmessages, inputMessage } = this.state;
        let chatstarttime = starttime;
        const newMessages = [...messages, {text: inputMessage, sender: 'user', time: currentDateTime}];
        const userMessageCount = newMessages.filter(message => message.sender === 'user').length;
        if(userMessageCount === 1) {
            chatstarttime = this.getCurrentDateTime();
            localStorage.setItem('starttime', chatstarttime);
            console.log("setting new starttime", chatstarttime)
        }
        this.setState({
            messages: newMessages,
            inputMessage: "",
            starttime: chatstarttime,

        }, () => { // Using callback form of setState to ensure we have the latest state
            this.saveMessagesLocally(newMessages);
        });
        // Count the number of messages sent by the user
        // console.log(starttime, chatstarttime);
        console.log("message count", userMessageCount);
        // console.log("hello")
        if (inputMessage.trim()) {
            // Send the input message to the Django backend
            authenticatedFetch("/api/openai", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${this.context.token}`
                },
                body: JSON.stringify({ message: inputMessage, starttime: chatstarttime, nmessages: userMessageCount })
            })
            .then(response => {
                clearTimeout(timeout); // clear the timeout
                if (!didTimeOut) {
                    return response.json();
                } else {
                    // Don't process if it already timed out
                    throw new Error('Request timed out.');
                }
            }
            )
            .then(data => {
                const botTime = this.getCurrentDateTime();
                this.setState(prevState => ({
                    messages: [...prevState.messages, { text: data.response, sender: 'bot', time: botTime }],
                    finishConversation: data.conversation,
                    nmessages: userMessageCount,
                    chattimeout: false,
                    loadingMessage: false,
                    snackbar: {
                        open: true,
                        message: 'New Message',
                        severity: 'info',
                    },
                }), () => {
                    this.saveMessagesLocally(this.state.messages);  // Save the messages to local storage
                });
                console.log("finish conversation:", data.conversation)
            });
        }
    }
    handleShowBody = () => {
        this.setState({ showModal: true });
    }
    handleClose = () => {
        this.setState({ showModal: false, UploadImage: false });
    }
    handleDownloadReport = () => {
        if (!this.state.finishConversation) {
            this.setState({
                snackbar: {
                    open: true,
                    message: 'Please finish the conversation first.',
                    severity: 'info',
                },
            });
            return;
        }
        const username = encodeURIComponent(this.context.username);  // Ensure the username is URL encoded to handle any special characters
        window.open(`api/download_report?username=${username}&starttime=${this.state.starttime}`, '_blank');
    }

    handleClearChat = () => {
        localStorage.removeItem('starttime');
        localStorage.removeItem('messages');
        localStorage.removeItem('finishConversation');
        const newMessage = {text: `LLMbq. Welcome to the Medical Assistant ${this.context.username}!. Please select the body part you have complaints about`, sender: 'bot', time: this.getCurrentDateTime()}
        const newMessages = [newMessage];
        this.setState(({
            messages: newMessages,
            nmessages: 0,
            starttime: null,
            finishConversation: false
        }));
    }
    handleKeyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();  // prevent new line
            this.handleSend();
        }
    }
    handleUploadImage = () => {
        this.setState({ UploadImage: true });
    }
    
    handleLogout = () => {
        // Make a request to the Django backend to logout
        authenticatedFetch("/api/logout", { 
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${this.context.token}`,
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

        if(prevState.finishConversation !== this.state.finishConversation ) {
            localStorage.setItem('finishConversation', this.state.finishConversation);
        }
        if (prevState.showModal && !this.state.showModal && this.state.bodyPartSelected) {
            this.handleSend();
            this.setState({
                bodyPartSelected: false // Reset the flag after sending the message
            });
        }
    }
    componentDidMount()  {
        const token = localStorage.getItem('authToken');
        const username = localStorage.getItem('authUsername'); 
        const storedFinishConversation = localStorage.getItem('finishConversation');
        console.log("Token, username", token, username)
        this.context.setLoginData(token, username);
        if (!token || !username) {
            this.props.history.push("/login");
            return;
        }
        // to load messages when refreshing
        const { messages, inputMessage, starttime } = this.state;
        const storedMessages = this.getMessagesFromLocalStorage();
        // to load starttime when refreshing
        const chatstarttime = localStorage.getItem('starttime');
        console.log("retrieving starttime", chatstarttime)
        if(storedMessages.length === 0) {
            const newMessage = {text: `LLMbq. Welcome to the Medical Assistant ${username}!. Please select the body part you have complaints about`, sender: 'bot', time: this.getCurrentDateTime()}
            const newMessages = [...messages, newMessage];
            this.setState(({
                messages: newMessages,
                finishConversation: storedFinishConversation === 'true' ? true : false,
                loadingMessage: loadingMessage === 'true' ? true : false,
            }));
        } else {
            this.setState({ 
                messages: storedMessages,
                starttime: chatstarttime,
                finishConversation: storedFinishConversation === 'true' ? true : false,
                loadingMessage: false
             });
        }

    }
    handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        this.setState({
            snackbar: {
                open: false,
                message: '',

            },
        });
    }
    render() {
        const { messages, inputMessage, chattimeout, loadingMessage } = this.state;

        return (
            <>
            <div className="chatbot-header">
            <Grid container spacing={3} direction="column" alignItems="center" justifyContent="center" style={{ minHeight: '100vh' }}>
                {/* Only Logout Link here */}
                <div style={{ width: '90%', display: 'flex', justifyContent: 'flex-end' }}>
                    <Link href="#" className="body-Link" variant="contained" color="primary" onClick={this.handleShowBody} style={{ color: 'blue', textDecoration: 'none', margin: '10px' }}>
                        Show Anatomy
                    </Link>
                    {/* {this.state.finishConversation ? 
                    <Link href="#" className="report-Link" variant="contained" color="primary" onClick={this.handleDownloadReport} style={{ color: 'blue', textDecoration: 'none', margin: '10px' }}>
                        Download Report
                    </Link> 
                    : null} */}
                    <Link href="#" className="report-Link" variant="contained" color="primary" onClick={this.handleDownloadReport} style={{ color: 'blue', textDecoration: 'none', margin: '10px' }}>
                        Download Report
                    </Link> 
                    <Link href="#" className="image-Link" variant="contained" color="primary" onClick={this.handleUploadImage} style={{ color: 'blue', textDecoration: 'none', margin: '10px' }}>
                        Upload Image 
                    </Link>
                    <Link href="#" className="clear-Link" variant="contained" color="primary" onClick={this.handleClearChat} style={{ color: 'blue', textDecoration: 'none', margin: '10px' }}>
                        Clear Chat
                    </Link>
                    <Link href="#" onClick={this.handleLogout} style={{ color: 'blue', textDecoration: 'none', margin: '10px' }}>
                        Logout
                    </Link>
                    
                </div>
                <Paper className="chat-container" style={{ height: '75%', width: '90%', overflowY: 'auto', marginBottom: '20px' }}>
                <List>
                    {messages.map((message, index) => (
                        <ListItem className={`message ${message.sender}`} key={index}>
                            <ListItemText primary={message.text} 
                                          secondary={`${message.sender === 'user' ? 'Patient' : 'LLMbq'} - ${this.formatDateTime(message.time)}${message.secondary ? message.secondary : ''}`} 
                            />
                        </ListItem>
                    ))}
                    {loadingMessage && 
                        <div className={styles.half + ' ' + styles.light}>
                            <div className={styles.typing}>
                                <span className={styles.circle + ' ' + styles.scaling}></span>
                                <span className={styles.circle + ' ' + styles.scaling}></span>
                                <span className={styles.circle + ' ' + styles.scaling}></span>
                            </div>
                        </div>
                    }
                </List>
                 </Paper>
                <Grid className="input-container" container direction="row" alignItems="center" justifyContent="center" spacing={2} style={{ width: '80%', position: 'fixed', bottom: '10px', background: '#fff' }}>
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
                    <Grid item xs={3}>
                        <Button className="send-button" variant="contained" color="primary" fullWidth onClick={this.handleSend}>
                            Send
                        </Button>
                        
                    </Grid>        
                </Grid>
            </Grid>
            </div>
            <Modal
                    className='interactive-body-modal'
                    aria-labelledby="interactive-body-modal"
                    open={this.state.showModal}
                    onClose={this.handleClose}
                    closeAfterTransition
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
            <Modal
                    className='upload-image-modal'
                    aria-labelledby="upload-image-modal"
                    open={this.state.UploadImage}
                    onClose={this.handleClose}
                >
                    <Fade in={this.state.UploadImage}>
                        <div style={{ outline: 'none', backgroundColor: 'white', padding: '10px', borderRadius: '10px' }}>
                        <UploadImagePage />
                        </div>
                    </Fade>
            </Modal>
            <Snackbar 
                className='snackbar'
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