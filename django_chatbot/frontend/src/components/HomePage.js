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
{/* <div className="mission-image">
{/* <img src="/path-to-your-image.jpg" alt="Your Mission" />
</div> */}  
// import React, { Component } from "react";
// import { BrowserRouter as Router, Route, Switch, Link } from "react-router-dom";
// import LoginPage from './LoginPage';
// import RegisterPage from './RegisterPage';
// import TokenContext from './TokenContext';
// import InteractiveBody from "./InteractiveBody";
// import './HomePage.css'; // assuming you will style it with this CSS file

// export default class HomePage extends Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             token: null,
//             username: null,
//             setLoginData: () => {}, 
//             }
//         }
//         setLoginData = (token, username) => {
//             this.setState({ token, username });
//         };

//     render() {
//         return (
//             <TokenContext.Provider value={{
//                 token: this.state.token,
//                 username: this.state.username,
//                 setLoginData: this.setLoginData
//             }}>
//                 <Router>
//                     <div className="container">
//                         <div className="header">
//                             <h1 className="logo">logo</h1>
//                             <nav>
//                                 <Link to="/login">Login</Link>
//                                 <Link to="/register">Register</Link>
//                             </nav>
//                         </div>
//                         <div className="mission-section">
//                             <div className="mission-content">
//                                 <h2>Our Mission</h2>
//                                 <p>
//                                     {/* You can place your text here */}
//                                     We're building value and opportunity by investing in ...
//                                 </p>
//                                 <Link to="/more-info" className="view-more">VIEW MORE</Link>
//                             </div>
                            
//                         </div>
//                         <div className="footer">
//                             <h3>The Future is Here</h3>
//                             <p>
//                                 Lorem ipsum dolor sit amet, consectetur ...
//                             </p>
//                         </div>
//                     </div>
//                     <Switch>
//                         <Route path="/login" component={LoginPage} />
//                         <Route path="/register" component={RegisterPage} />
//                         <Route path="/register" component={RegisterPage} />
//                         <Route path="/imageui" component={InteractiveBody} />
//                     </Switch>
//                 </Router>
//             </TokenContext.Provider>
//         );
//     }
// }
