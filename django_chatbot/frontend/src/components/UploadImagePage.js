import axios from 'axios';
import React, { Component } from 'react';
import { authenticatedFetch } from './csrfTokenUtility';
import TokenContext from './TokenContext';
import { TextField, Button } from '@mui/material';
import './UploadImagePage.css';

export default class UploadImagePage extends Component {
    static contextType = TokenContext;
    constructor(props) {
        super(props);
        this.state = {
            selectedFile: null,
            reportText: '',
        };
    }
	// On file select (from the pop up)
	onFileChange = event => {
		this.setState({ selectedFile: event.target.files[0] });
	};
    handleTextFieldChange = (event) => {
        this.setState({ reportText: event.target.value });
    };
	onFileUpload = () => {
        const file = this.uploadInput.files[0];
        if (!file) {
            alert("Please select a file to upload.");
            return;
        }
        const username = localStorage.getItem('authUsername');
        const token = localStorage.getItem('authToken');
        const formData = new FormData();
        formData.append('images', file);
        formData.append('username', username);
        formData.append('report', this.state.reportText);

        authenticatedFetch('/api/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${token}`,
            },
            body: formData,
        }).then(response => {
            console.log(response);
        }).catch(error => {
            console.log(error);
        })
	};


	render() {

		return (
			<div className="upload-container">
                <h1 className='heading'>Upload File</h1>
                <div className="file-input-container">
                    <input type="file" ref={ref => this.uploadInput = ref} onChange={this.onFileChange} />
                </div>
                <div className="textfield-container">
                    <TextField
                        className='textfield'
                        id="outlined-basic"
                        label="Report"
                        variant="outlined"
                        fullWidth
                        value={this.state.reportText}
                        onChange={this.handleTextFieldChange}
                    />
                </div>
                    <Button className="upload-button" variant="contained" color="primary" onClick={this.onFileUpload}>
                        Upload!
                    </Button>
            </div>
		);
	}
}

