import React, { useContext, useRef, useEffect, useState } from "react"
import AppStateContext from '../AppStateContext'

const Video = () => {
    const trackRefRemote = useRef();
    const trackRefLocal = useRef();
    const [state, dispatch] = useContext(AppStateContext);
    const [localVideoTrack, setLocalVideoTrack] = useState(null);

    const l = state.room?.localParticipant;
    
  
    useEffect(() => {
        if(state.room){
            const remoteVideoTrack = [...state.room.localParticipant.videoTracks.values()][0];
            console.log(remoteVideoTrack);
            const child = remoteVideoTrack.track.attach();
            trackRefRemote.current.classList.add(remoteVideoTrack.kind);
            trackRefRemote.current.appendChild(child);
        }
    }, [l]);
  
    useEffect(() => {
        if(state.remoteParticipantTracks){
            const remoteVideoTrack = [...state.remoteParticipant.videoTracks.values()][0];
            console.log(JSON.stringify(remoteVideoTrack));
            console.log(remoteVideoTrack);
            console.log(state);
            if(remoteVideoTrack){
                const child2 = remoteVideoTrack.track.attach();
                trackRefLocal.current.classList.add(remoteVideoTrack.kind);
                trackRefLocal.current.appendChild(child2);
            }
        }
    }, [state.remoteParticipantTracks]);


    return (
        <div>
            <div ref={trackRefRemote}></div>
            <div ref={trackRefLocal}></div>
        </div>
    );
}

export default Video;