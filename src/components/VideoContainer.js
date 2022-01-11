import React, { useContext, useEffect } from "react"
import ReactDom from "react-dom";
import Chat from './Chat'
import Video from './Video'
import Patient from "./Patient";
import AppStateContext from '../AppStateContext'
import ACTION_TYPE from "../ActionType";

const VideoContainer = () => {
    const [state, dispatch] = useContext(AppStateContext);

    const handleStartStopVideo = (e) => {
        state.room.localParticipant.videoTracks.forEach(publication => {
            if(state.startCamera){
                dispatch({ type: ACTION_TYPE.STOP_CAMERA });
                publication.track.stop();
                publication.unpublish();
            }
            else{
                dispatch({ type: ACTION_TYPE.START_CAMERA });
                publication.track.start();
                publication.publish();
            }
          });
    }

    const handleMuteUnmuteAudio = (e) => {
        state.room.localParticipant.audioTracks.forEach(publication => {
            if(state.muteAudio){
                dispatch({ type: ACTION_TYPE.MUTE_AUDIO });
                publication.track.disable();
            }
            else{
                dispatch({ type: ACTION_TYPE.UNMUTE_AUDIO });
                publication.track.enable();
            }
          });
    }

 

    return ReactDom.createPortal(
        <div className="video-container-overlay">
            <div>
                <button onClick={e => handleStartStopVideo(e)}>{state.startCamera ? 'Stop Video' : 'Start video'}</button>
                <button onClick={e => handleMuteUnmuteAudio(e)}>{state.muteAudio ? 'Unmute audio' : 'Mute audio'}</button>
            </div>
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