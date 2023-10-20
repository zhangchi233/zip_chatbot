import React, { Component } from "react";
import "./InteractiveBody.css";
import { Button } from "@material-ui/core";
export default class InteractiveBody extends Component {
    state = {
        hoveredPart: null,
        clickedPart: null,
        currentImage: 'front'
      };
    
      handleMouseEnter = (part) => {
        this.setState({ hoveredPart: part });
      };
    
      handleMouseLeave = () => {
        this.setState({ hoveredPart: null });
      };
      
      switchImage = () => {
        this.setState(prevState => ({
            currentImage: prevState.currentImage === 'front' ? 'back' : 'front'
        }));
      }
    clearSelection = () => {
      this.setState({ clickedPart: null });
      this.props.onClearSelection();
     }
      handleClick = (part) => {
        this.setState({ clickedPart: part }, () => {
            if (this.props.onPartClick) {
                this.props.onPartClick(part);
            }
        });
    };   
    render() {
        const { hoveredPart, clickedPart, currentImage } = this.state;
        return (
            <div>
              {currentImage === 'front' ? (
        <svg
            className="front"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            width="100%"
            x="0"
            y="0"
            version="1.1"
            viewBox="0 0 304 560"
        >
        <image
            width="304"
            height="560"
            x="-0.073"
            y="-0.85"
            xlinkHref="data:image/png;base64,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"
            pointerEvents="none"
            
      ></image>
            {/* Chest */}
            <path
            fill= {hoveredPart === "Chest"? "#ff0000" : "none"}
            d="M121.356 112.08c3.278 4.024 26.515 5.229 49.094 4.958 11.289-.136 22.3-.683 30.454-1.496 4.069-.406 7.378-.872 9.661-1.386 1.125-.254 1.918-.495 2.448-.747.239-.114.309-.159.373-.225.013-.013-.035.293-.09.414l.577-1.259.409.095c.394.091.927.357 1.124.633.152.215.309.554.419.874.206.597.399 1.478.566 2.519.329 2.058.609 4.999.839 8.488.458 6.965.728 16.256.825 25.529.097 9.273.021 18.558-.214 25.518-.117 3.484-.276 6.41-.472 8.457-.099 1.032-.213 1.885-.337 2.465a4.53 4.53 0 01-.244.818c-.056.125-.17.316-.269.424-.141.156-.557.32-.832.382l-94.118.702-.278-.296c-2.951-3.141-3.762-22.69-3.567-41.045.097-9.179.41-18.153.776-24.745.184-3.299.382-6.021.573-7.873.097-.932.196-1.68.292-2.164.051-.259.122-.527.193-.692.054-.124.222-.383.384-.503.138-.102.518-.224.731-.202.201.021.558.262.683.357z"
            onMouseEnter={() => this.handleMouseEnter("Chest")}
            onMouseLeave={this.handleMouseLeave}
            onClick={() => this.handleClick("Chest")}
            >
                {hoveredPart === "Chest" && ( <title> Chest </title> )}
            </path>
            {/* Belly */}
            <path
             fill= {hoveredPart === "Belly"? "#ff0000" : "none"}
            d="M212.79 186.851l.094 1.997c-.002.22-.031.934-.256 2.184-.337 1.873-.605 4.547-.808 7.805-.405 6.53-.528 15.229-.363 23.952.166 8.722.618 17.414 1.367 23.937.373 3.253.81 5.908 1.321 7.769.251.913.485 1.54.742 1.978.218.372.081.411.094.291l-.209 2h-95.324l3.948-2a2.853 2.853 0 01-.427.158c.049-.058.081-.118.165-.321.184-.452.356-1.107.534-2.03.361-1.876.674-4.552.938-7.812.53-6.532.849-15.236.936-23.961.088-8.726-.058-17.43-.457-23.962-.199-3.26-.458-5.936-.782-7.811-.159-.923-.318-1.577-.493-2.027-.078-.202-.108-.258-.153-.314-.003-.003.295.094.438.167l-3.936-2z"
            onMouseEnter={() => this.handleMouseEnter("Belly")}
            onMouseLeave={this.handleMouseLeave}
            onClick={() => this.handleClick("Belly")}
            >
                {hoveredPart === "Belly" && ( <title> Belly </title> )}
            </path>
            {/* Lower body or Genitals*/}
            <path
            fill= {hoveredPart === "Genitals"? "#ff0000" : "none"}
            d="M121.298 259.861c30.762-.466 61.519-1.398 92.285-1.398.015 29.876 12.476 47.037 4.194 65.019-13.675.007-31.09.699-43.345.699-2.574 0 .699-14.479.699-18.177 0 3.685-11.017 0-13.283 0-.004 7.13.699 8.642.699 16.08-25.397-.045-35.09.888-44.744-.7-3.269-2.683 4.09-61.615 3.495-61.523z"
            onMouseEnter={() => this.handleMouseEnter("Genitals")}
            onMouseLeave={this.handleMouseLeave}
            onClick={() => this.handleClick("Genitals")}
            >
                 {hoveredPart === "Genitals" && ( <title> Genitals </title> )}
            </path>
            {/* Left Foot */}
            <path
            fill= {hoveredPart === "Left Foot"? "#ff0000" : "none"}
            d="M142.847 506.272c.762.318-3.86 19.183-5.122 20.407-1.898 1.841-3.383 4.601-4.937 6.933-1.828 2.742-6.163 10.155-5.778 10.925.108.215 28.448 2.069 29.835 1.996 6.403-.336 3.864-15.813 3.256-16.808-1.253-2.052-2.704-22.637-3.256-23.741-.557-1.114-13.523-.187-13.998.288z"
            onMouseEnter={() => this.handleMouseEnter("Left Foot")}
            onMouseLeave={this.handleMouseLeave}
            onClick={() => this.handleClick("Left Foot")}
            >
                 {hoveredPart === "Left Foot" && ( <title> Left Foot </title> )}
            </path>
            {/* Left Leg */}
            <path
            fill= {hoveredPart === "Left Leg"? "#ff0000" : "none"}
            d="M119.9 321.385c14.415 0 28.926 1.398 43.346 1.398 1.111 23.667.145 36.659-2.097 51.735-10.787 27.266-2.927 48.882 2.097 62.222 3.028 8.04-1.178 19.845-3.496 25.169.321 25.028-2.063 35.324-2.097 43.346-4.145 2.072-9.177.699-13.983.699-10.478-51.775-17.384-52.869-13.283-82.497.951-6.868 4.508-21.671 5.593-27.965.788-4.573-27.772-49.934-16.08-74.107z"
            onMouseEnter={() => this.handleMouseEnter("Left Leg")}
            onMouseLeave={this.handleMouseLeave}
            onClick={() => this.handleClick("Left Leg")}
            >
                {hoveredPart === "Left Leg" && ( <title> Left Leg </title> )}
            </path>
            {/* Right Leg */}
            <path
            style={{
                WebkitTransformBox: "fill-box",
                MsTransformBox: "fill-box",
                transformBox: "fill-box",
                WebkitTransformOrigin: "50% 50%",
                MsTransformOrigin: "50% 50%",
                transformOrigin: "50% 50%",
            }}
            fill= {hoveredPart === "Right Leg"? "#ff0000" : "none"}
            d="M176.01 509.148c14.415 0 28.926-1.398 43.346-1.398 1.111-23.667.145-36.659-2.097-51.735-10.787-27.266-2.927-48.882 2.097-62.222 3.028-8.04-1.178-19.845-3.496-25.169.321-25.028-2.063-35.324-2.097-43.346-4.145-2.072-9.177-.699-13.983-.699-10.478 51.775-17.384 52.869-13.283 82.497.951 6.868 3.738 21.854 5.593 27.965 1.215 4.003-20.642 46.467-16.08 74.107z"
            transform="rotate(180 -1.094 0)"
            onMouseEnter={() => this.handleMouseEnter("Right Leg")}
            onMouseLeave={this.handleMouseLeave}
            onClick={() => this.handleClick("Right Leg")}
            >
                {hoveredPart === "Right Leg" && ( <title> Right Leg </title> )}
            </path>
            {/* Left Arm */}
            <path
            fill= {hoveredPart === "Left Arm"? "#ff0000" : "none"}
            d="M117.803 113.045c-5.834-3.103-22.249 9.164-25.169 17.478-4.611 29.214-4.124 34.47-2.796 38.452 1.317 3.953 1.356 6.463 0 11.885-18.095 83.202-13.274 91.892-11.885 92.984 11.067 6.173 13.162 3.738 12.584 0 21.366-42.669 15.278-50.46 21.673-57.328 4.138-4.444-.595-14.192 2.097-19.576 5.333-10.667-.464-17.949 4.894-28.665-2.893-38.279-1.405-53.245-1.398-55.23z"
            onMouseEnter={() => this.handleMouseEnter("Left Arm")}
            onMouseLeave={this.handleMouseLeave}
            onClick={() => this.handleClick("Left Arm")}
            >
                {hoveredPart === "Left Arm" && ( <title> Left Arm </title> )}
            </path>
            {/* Right Arm */}
            <path
            style={{
                WebkitTransformBox: "fill-box",
                MsTransformBox: "fill-box",
                transformBox: "fill-box",
                WebkitTransformOrigin: "50% 50%",
                MsTransformOrigin: "50% 50%",
                transformOrigin: "50% 50%",
            }}
            fill= {hoveredPart === "Right Arm"? "#ff0000" : "none"}
            d="M262.289 274.784c-5.834 3.103-25.745-7.766-28.665-16.08-4.611-29.214-4.124-34.47-2.796-38.452 1.317-3.953 1.356-6.463 0-11.885-18.095-83.202-13.274-91.892-11.885-92.984 11.067-6.173 13.162-3.738 12.584 0 21.366 42.669 15.278 50.46 21.673 57.328 4.138 4.444-.595 14.192 2.097 19.576 5.333 10.667-.464 17.949 4.894 28.665-2.893 38.279 2.091 51.847 2.098 53.832z"
            transform="rotate(180 -1.049 .674)"
            onMouseEnter={() => this.handleMouseEnter("Right Arm")}
            onMouseLeave={this.handleMouseLeave}
            onClick={() => this.handleClick("Right Arm")}
            >
                {hoveredPart === "Right Arm" && ( <title> Right Arm </title> )}
            </path>
            {/* Left Hand */}
            <path
            fill= {hoveredPart === "Left Hand"? "#ff0000" : "none"}
            d="M73.71 274.59c6.492-.579 12.474 3.598 16.469 3.628.905 52.681-19.779 50.217-23.412 46.662-5.524-5.406-9.538-28.914-2.797-35.655-2.134-.001-9.254 9.483-12.956 5.781 14.058-11.241 6.539-10.652 11.425-15.081 3.414-3.775 10.98-4.599 11.271-5.335z"
            onMouseEnter={() => this.handleMouseEnter("Left Hand")}
            onMouseLeave={this.handleMouseLeave}
            onClick={() => this.handleClick("Left Hand")}
            >
                {hoveredPart === "Left Hand" && ( <title> Left Hand </title> )}
            </path>
            {/* Right Hand */}
            <path
            style={{
                WebkitTransformBox: "fill-box",
                MsTransformBox: "fill-box",
                transformBox: "fill-box",
                WebkitTransformOrigin: "50% 50%",
                MsTransformOrigin: "50% 50%",
                transformOrigin: "50% 50%",
            }}
            fill= {hoveredPart === "Right Hand"? "#ff0000" : "none"}
            d="M268.701 325.312c6.492.579 12.474-3.598 16.469-3.628.905-52.681-19.779-50.217-23.412-46.662-5.524 5.406-9.538 28.914-2.797 35.655-2.134.001-9.254-9.483-12.956-5.781 14.058 11.241 6.539 10.652 11.425 15.081 3.414 3.775 10.98 4.599 11.271 5.335z"
            transform="rotate(180 0 0)"
            onMouseEnter={() => this.handleMouseEnter("Right Hand")}
            onMouseLeave={this.handleMouseLeave}
            onClick={() => this.handleClick("Right Hand")}
            >
                {hoveredPart === "Right Hand" && ( <title> Right Hand </title> )}
            </path>
            {/* Head */}
            <path
            fill= {hoveredPart === "Head"? "#ff0000" : "none"}
            d="M140.413 61.516c9.698 13.06 8.271 15.583 8.523 16.392 7.109 15.595 15.713 12.159 17.267 12.677 1.969.656 4.689.387 6.338-.437 12.652-7.298 13.544-7.527 13.878-8.196 4.503-13.531 6.078-15.585 6.885-16.392 1.763-4.073 1.939-6.226 2.514-8.524.667-2.669-1.563-4.252-2.295-6.448-2.989-11.517-3.354-17.163-5.136-22.511-4.208-7.431-7.933-8.637-9.836-9.399-26.083 1.826-26.419 5.215-28.303 7.759-5.257 21.443-4.969 22.884-5.246 23.714-10.154 6.719-4.643 10.889-4.589 11.365z"
            onMouseEnter={() => this.handleMouseEnter("Head")}
            onMouseLeave={this.handleMouseLeave}
            onClick={() => this.handleClick("Head")}
            >
                {hoveredPart === "Head" && ( <title> Head </title> )}
            </path>
            {/* Neck */}
            <path
            fill= {hoveredPart === "Neck"? "#ff0000" : "none"}
            d="M210.074 112.521c-10.652-3.612-14.268-4.978-17.914-7.409-4.921-3.281-4.99-8.986-7.519-14.043-1.652-4.741-.988-5.853-1.548-6.413-6.456 3.626-9.141 4.41-11.832 5.307-18.944-1.734-18.773-5.208-19.143-5.216.594 2.374.178 6.989-.76 8.865-1.724 5.769-2.919 7.053-3.539 8.293-15.305 9.098-17.572 8.948-18.798 10.173 7.657 8.167 27.535 4.229 28.64 5.308.765.747 2.445.111 3.538.111 2.822 0 5.938.306 8.514-.553 2.399-.8 6.086.221 8.515.221 7.653 0 15.66.453 22.778-1.327 9.04-2.364 8.762-3.012 9.068-3.317z"
            onMouseEnter={() => this.handleMouseEnter("Neck")}
            onMouseLeave={this.handleMouseLeave}
            onClick={() => this.handleClick("Neck")}
            >
                {hoveredPart === "Neck" && ( <title> Neck </title> )}
            </path>
            {/* Right Foot */}
            <path
            style={{
                WebkitTransformBox: "fill-box",
                MsTransformBox: "fill-box",
                transformBox: "fill-box",
                WebkitTransformOrigin: "50% 50%",
                MsTransformOrigin: "50% 50%",
                transformOrigin: "50% 50%",
            }}
            fill= {hoveredPart === "Right Foot"? "#ff0000" : "none"}
            d="M192.906 548.68c.762-.318-3.86-19.183-5.122-20.407-1.898-1.841-3.383-4.601-4.937-6.933-1.828-2.742-6.043-10.106-5.778-10.925.119-.368 33.356.049 34.604 2.074 3.364 5.459-.905 11.743-1.513 12.738-1.253 2.052-2.704 22.637-3.256 23.741-.557 1.114-13.523.187-13.998-.288z"
            transform="rotate(180 -.898 -.939)"
            onMouseEnter={() => this.handleMouseEnter("Right Foot")}
            onMouseLeave={this.handleMouseLeave}
            onClick={() => this.handleClick("Right Foot")}
            >
                {hoveredPart === "Right Foot" && ( <title> Right Foot </title> )}
            </path>

        </svg> ) :
        (
        <svg
            className="front"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            width="100%"
            x="0"
            y="0"
            version="1.1"
            viewBox="0 0 304 560"
        >
        <image width="304" height="560" x="7.051" y="2.796"
            xlinkHref="data:image/png;base64,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"
            pointerEvents="none"
            
      ></image>
            {/* Upper Back */}
            <path
            fill= {hoveredPart === "Upper Back"? "#ff0000" : "none"}
            d="M121.356 112.08c3.278 4.024 26.515 5.229 49.094 4.958 11.289-.136 22.3-.683 30.454-1.496 4.069-.406 7.378-.872 9.661-1.386 1.125-.254 1.918-.495 2.448-.747.239-.114.309-.159.373-.225.013-.013-.035.293-.09.414l.577-1.259.409.095c.394.091.927.357 1.124.633.152.215.309.554.419.874.206.597.399 1.478.566 2.519.329 2.058.609 4.999.839 8.488.458 6.965.728 16.256.825 25.529.097 9.273.021 18.558-.214 25.518-.117 3.484-.276 6.41-.472 8.457-.099 1.032-.213 1.885-.337 2.465a4.53 4.53 0 01-.244.818c-.056.125-.17.316-.269.424-.141.156-.557.32-.832.382l-94.118.702-.278-.296c-2.951-3.141-3.762-22.69-3.567-41.045.097-9.179.41-18.153.776-24.745.184-3.299.382-6.021.573-7.873.097-.932.196-1.68.292-2.164.051-.259.122-.527.193-.692.054-.124.222-.383.384-.503.138-.102.518-.224.731-.202.201.021.558.262.683.357z"
            onMouseEnter={() => this.handleMouseEnter("Upper Back")}
            onMouseLeave={this.handleMouseLeave}
            onClick={() => this.handleClick("Upper Back")}
            >
                {hoveredPart === "Upper Back" && ( <title> Upper Back </title> )}
            </path>
            {/* Lower Back */}
            <path
             fill= {hoveredPart === "Lower Back"? "#ff0000" : "none"}
            d="M212.79 186.851l.094 1.997c-.002.22-.031.934-.256 2.184-.337 1.873-.605 4.547-.808 7.805-.405 6.53-.528 15.229-.363 23.952.166 8.722.618 17.414 1.367 23.937.373 3.253.81 5.908 1.321 7.769.251.913.485 1.54.742 1.978.218.372.081.411.094.291l-.209 2h-95.324l3.948-2a2.853 2.853 0 01-.427.158c.049-.058.081-.118.165-.321.184-.452.356-1.107.534-2.03.361-1.876.674-4.552.938-7.812.53-6.532.849-15.236.936-23.961.088-8.726-.058-17.43-.457-23.962-.199-3.26-.458-5.936-.782-7.811-.159-.923-.318-1.577-.493-2.027-.078-.202-.108-.258-.153-.314-.003-.003.295.094.438.167l-3.936-2z"
            onMouseEnter={() => this.handleMouseEnter("Lower Back")}
            onMouseLeave={this.handleMouseLeave}
            onClick={() => this.handleClick("Lower Back")}
            >
                {hoveredPart === "Lower Back" && ( <title> Lower Back </title> )}
            </path>
            {/* Buttocks*/}
            <path
            fill= {hoveredPart === "Buttocks"? "#ff0000" : "none"}
            d="M121.298 259.861c30.762-.466 61.519-1.398 92.285-1.398.015 29.876 12.476 47.037 4.194 65.019-13.675.007-31.09.699-43.345.699-2.574 0 .699-14.479.699-18.177 0 3.685-11.017 0-13.283 0-.004 7.13.699 8.642.699 16.08-25.397-.045-35.09.888-44.744-.7-3.269-2.683 4.09-61.615 3.495-61.523z"
            onMouseEnter={() => this.handleMouseEnter("Buttocks")}
            onMouseLeave={this.handleMouseLeave}
            onClick={() => this.handleClick("Buttocks")}
            >
                 {hoveredPart === "Buttocks" && ( <title> Buttocks </title> )}
            </path>
            {/* Left Foot */}
            <path
            fill= {hoveredPart === "Left Foot"? "#ff0000" : "none"}
            d="M142.847 506.272c.762.318-3.86 19.183-5.122 20.407-1.898 1.841-3.383 4.601-4.937 6.933-1.828 2.742-6.163 10.155-5.778 10.925.108.215 28.448 2.069 29.835 1.996 6.403-.336 3.864-15.813 3.256-16.808-1.253-2.052-2.704-22.637-3.256-23.741-.557-1.114-13.523-.187-13.998.288z"
            onMouseEnter={() => this.handleMouseEnter("Left Foot")}
            onMouseLeave={this.handleMouseLeave}
            onClick={() => this.handleClick("Left Foot")}
            >
                 {hoveredPart === "Left Foot" && ( <title> Left Foot </title> )}
            </path>
            {/* Left Leg */}
            <path
            fill= {hoveredPart === "Left Leg"? "#ff0000" : "none"}
            d="M119.9 321.385c14.415 0 28.926 1.398 43.346 1.398 1.111 23.667.145 36.659-2.097 51.735-10.787 27.266-2.927 48.882 2.097 62.222 3.028 8.04-1.178 19.845-3.496 25.169.321 25.028-2.063 35.324-2.097 43.346-4.145 2.072-9.177.699-13.983.699-10.478-51.775-17.384-52.869-13.283-82.497.951-6.868 4.508-21.671 5.593-27.965.788-4.573-27.772-49.934-16.08-74.107z"
            onMouseEnter={() => this.handleMouseEnter("Left Leg")}
            onMouseLeave={this.handleMouseLeave}
            onClick={() => this.handleClick("Left Leg")}
            >
                {hoveredPart === "Left Leg" && ( <title> Left Leg </title> )}
            </path>
            {/* Right Leg */}
            <path
            style={{
                WebkitTransformBox: "fill-box",
                MsTransformBox: "fill-box",
                transformBox: "fill-box",
                WebkitTransformOrigin: "50% 50%",
                MsTransformOrigin: "50% 50%",
                transformOrigin: "50% 50%",
            }}
            fill= {hoveredPart === "Right Leg"? "#ff0000" : "none"}
            d="M176.01 509.148c14.415 0 28.926-1.398 43.346-1.398 1.111-23.667.145-36.659-2.097-51.735-10.787-27.266-2.927-48.882 2.097-62.222 3.028-8.04-1.178-19.845-3.496-25.169.321-25.028-2.063-35.324-2.097-43.346-4.145-2.072-9.177-.699-13.983-.699-10.478 51.775-17.384 52.869-13.283 82.497.951 6.868 3.738 21.854 5.593 27.965 1.215 4.003-20.642 46.467-16.08 74.107z"
            transform="rotate(180 -1.094 0)"
            onMouseEnter={() => this.handleMouseEnter("Right Leg")}
            onMouseLeave={this.handleMouseLeave}
            onClick={() => this.handleClick("Right Leg")}
            >
                {hoveredPart === "Right Leg" && ( <title> Right Leg </title> )}
            </path>
            {/* Left Arm */}
            <path
            fill= {hoveredPart === "Left Arm"? "#ff0000" : "none"}
            d="M117.803 113.045c-5.834-3.103-22.249 9.164-25.169 17.478-4.611 29.214-4.124 34.47-2.796 38.452 1.317 3.953 1.356 6.463 0 11.885-18.095 83.202-13.274 91.892-11.885 92.984 11.067 6.173 13.162 3.738 12.584 0 21.366-42.669 15.278-50.46 21.673-57.328 4.138-4.444-.595-14.192 2.097-19.576 5.333-10.667-.464-17.949 4.894-28.665-2.893-38.279-1.405-53.245-1.398-55.23z"
            onMouseEnter={() => this.handleMouseEnter("Left Arm")}
            onMouseLeave={this.handleMouseLeave}
            onClick={() => this.handleClick("Left Arm")}
            >
                {hoveredPart === "Left Arm" && ( <title> Left Arm </title> )}
            </path>
            {/* Right Arm */}
            <path
            style={{
                WebkitTransformBox: "fill-box",
                MsTransformBox: "fill-box",
                transformBox: "fill-box",
                WebkitTransformOrigin: "50% 50%",
                MsTransformOrigin: "50% 50%",
                transformOrigin: "50% 50%",
            }}
            fill= {hoveredPart === "Right Arm"? "#ff0000" : "none"}
            d="M262.289 274.784c-5.834 3.103-25.745-7.766-28.665-16.08-4.611-29.214-4.124-34.47-2.796-38.452 1.317-3.953 1.356-6.463 0-11.885-18.095-83.202-13.274-91.892-11.885-92.984 11.067-6.173 13.162-3.738 12.584 0 21.366 42.669 15.278 50.46 21.673 57.328 4.138 4.444-.595 14.192 2.097 19.576 5.333 10.667-.464 17.949 4.894 28.665-2.893 38.279 2.091 51.847 2.098 53.832z"
            transform="rotate(180 -1.049 .674)"
            onMouseEnter={() => this.handleMouseEnter("Right Arm")}
            onMouseLeave={this.handleMouseLeave}
            onClick={() => this.handleClick("Right Arm")}
            >
                {hoveredPart === "Right Arm" && ( <title> Right Arm </title> )}
            </path>
            {/* Left Hand */}
            <path
            fill= {hoveredPart === "Left Hand"? "#ff0000" : "none"}
            d="M73.71 274.59c6.492-.579 12.474 3.598 16.469 3.628.905 52.681-19.779 50.217-23.412 46.662-5.524-5.406-9.538-28.914-2.797-35.655-2.134-.001-9.254 9.483-12.956 5.781 14.058-11.241 6.539-10.652 11.425-15.081 3.414-3.775 10.98-4.599 11.271-5.335z"
            onMouseEnter={() => this.handleMouseEnter("Left Hand")}
            onMouseLeave={this.handleMouseLeave}
            onClick={() => this.handleClick("Left Hand")}
            >
                {hoveredPart === "Left Hand" && ( <title> Left Hand </title> )}
            </path>
            {/* Right Hand */}
            <path
            style={{
                WebkitTransformBox: "fill-box",
                MsTransformBox: "fill-box",
                transformBox: "fill-box",
                WebkitTransformOrigin: "50% 50%",
                MsTransformOrigin: "50% 50%",
                transformOrigin: "50% 50%",
            }}
            fill= {hoveredPart === "Right Hand"? "#ff0000" : "none"}
            d="M268.701 325.312c6.492.579 12.474-3.598 16.469-3.628.905-52.681-19.779-50.217-23.412-46.662-5.524 5.406-9.538 28.914-2.797 35.655-2.134.001-9.254-9.483-12.956-5.781 14.058 11.241 6.539 10.652 11.425 15.081 3.414 3.775 10.98 4.599 11.271 5.335z"
            transform="rotate(180 0 0)"
            onMouseEnter={() => this.handleMouseEnter("Right Hand")}
            onMouseLeave={this.handleMouseLeave}
            onClick={() => this.handleClick("Right Hand")}
            >
                {hoveredPart === "Right Hand" && ( <title> Right Hand </title> )}
            </path>
            {/* Head */}
            <path
            fill= {hoveredPart === "Head"? "#ff0000" : "none"}
            d="M140.413 61.516c9.698 13.06 8.271 15.583 8.523 16.392 7.109 15.595 15.713 12.159 17.267 12.677 1.969.656 4.689.387 6.338-.437 12.652-7.298 13.544-7.527 13.878-8.196 4.503-13.531 6.078-15.585 6.885-16.392 1.763-4.073 1.939-6.226 2.514-8.524.667-2.669-1.563-4.252-2.295-6.448-2.989-11.517-3.354-17.163-5.136-22.511-4.208-7.431-7.933-8.637-9.836-9.399-26.083 1.826-26.419 5.215-28.303 7.759-5.257 21.443-4.969 22.884-5.246 23.714-10.154 6.719-4.643 10.889-4.589 11.365z"
            onMouseEnter={() => this.handleMouseEnter("Head")}
            onMouseLeave={this.handleMouseLeave}
            onClick={() => this.handleClick("Head")}
            >
                {hoveredPart === "Head" && ( <title> Head </title> )}
            </path>
            {/* Back Neck */}
            <path
            fill= {hoveredPart === "Back Neck"? "#ff0000" : "none"}
            d="M210.074 112.521c-10.652-3.612-14.268-4.978-17.914-7.409-4.921-3.281-4.99-8.986-7.519-14.043-1.652-4.741-.988-5.853-1.548-6.413-6.456 3.626-9.141 4.41-11.832 5.307-18.944-1.734-18.773-5.208-19.143-5.216.594 2.374.178 6.989-.76 8.865-1.724 5.769-2.919 7.053-3.539 8.293-15.305 9.098-17.572 8.948-18.798 10.173 7.657 8.167 27.535 4.229 28.64 5.308.765.747 2.445.111 3.538.111 2.822 0 5.938.306 8.514-.553 2.399-.8 6.086.221 8.515.221 7.653 0 15.66.453 22.778-1.327 9.04-2.364 8.762-3.012 9.068-3.317z"
            onMouseEnter={() => this.handleMouseEnter("Back Neck")}
            onMouseLeave={this.handleMouseLeave}
            onClick={() => this.handleClick("Back Neck")}
            >
                {hoveredPart === "Back Neck" && ( <title> Back Neck </title> )}
            </path>
            {/* Right Foot */}
            <path
            style={{
                WebkitTransformBox: "fill-box",
                MsTransformBox: "fill-box",
                transformBox: "fill-box",
                WebkitTransformOrigin: "50% 50%",
                MsTransformOrigin: "50% 50%",
                transformOrigin: "50% 50%",
            }}
            fill= {hoveredPart === "Right Foot"? "#ff0000" : "none"}
            d="M192.906 548.68c.762-.318-3.86-19.183-5.122-20.407-1.898-1.841-3.383-4.601-4.937-6.933-1.828-2.742-6.043-10.106-5.778-10.925.119-.368 33.356.049 34.604 2.074 3.364 5.459-.905 11.743-1.513 12.738-1.253 2.052-2.704 22.637-3.256 23.741-.557 1.114-13.523.187-13.998-.288z"
            transform="rotate(180 -.898 -.939)"
            onMouseEnter={() => this.handleMouseEnter("Right Foot")}
            onMouseLeave={this.handleMouseLeave}
            onClick={() => this.handleClick("Right Foot")}
            >
                {hoveredPart === "Right Foot" && ( <title> Right Foot </title> )}
            </path>

        </svg>
        )}
                
        {clickedPart && (
          <div>
            <h3> I have pain in my {clickedPart}</h3>
          </div>
        )}
        <div className="buttonContainer">
            <Button variant="contained" onClick={this.switchImage}>
                Switch Image
            </Button>
            <Button variant="contained" onClick={this.clearSelection}>
                Clear Selection
            </Button>
         </div>
        </div>
        );
    }
}




