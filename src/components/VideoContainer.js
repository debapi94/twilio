import React, { useContext } from "react"
import ReactDom from "react-dom";
import Chat from './Chat'
import Video from './Video'
import Patient from "./Patient";
import AppStateContext from '../AppStateContext'

const VideoContainer = () => {
    const [state, dispatch] = useContext(AppStateContext);

    return ReactDom.createPortal(
        <div className="video-container-overlay">
            <div className="video-container">
                {state.videoLoading && <div className="video-loader">Loading...</div>}
                <Patient />
                <Video />
                <Chat />
            </div>
        </div>
    , document.querySelector('#twilio-video'));
}

export default VideoContainer;