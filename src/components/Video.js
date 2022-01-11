import React, { useContext, useRef, useEffect } from "react"
import AppStateContext from '../AppStateContext'

const Video = () => {
    const trackRefRemote = useRef();
    const trackRefLocal = useRef();
    const [state] = useContext(AppStateContext);

    //const l = state.room?.localParticipant;
    
  
    useEffect(() => {
        if(state.room){
            const remoteVideoTrack = [...state.room.localParticipant.videoTracks.values()][0];
            //console.log(remoteVideoTrack);
            const child = remoteVideoTrack.track.attach();
            trackRefRemote.current.classList.add(remoteVideoTrack.kind);
            trackRefRemote.current.appendChild(child);
        }
    }, [state.room]);
  
    useEffect(() => {
        // if(state.remoteParticipantTracks && state.remoteParticipant.videoTracks){
        //     const remoteVideoTrack = [...state.remoteParticipant.videoTracks.values()][0];
        //     console.log(JSON.stringify(remoteVideoTrack));
        //     console.log(remoteVideoTrack);
        //     //console.log(state);
        //     if(remoteVideoTrack && remoteVideoTrack.track){
        //         console.log(trackRefLocal.current);
        //         console.log(trackRefLocal.current.child);
        //         const child2 = remoteVideoTrack.track.attach();
        //         trackRefLocal.current.classList.add(remoteVideoTrack.kind);
        //         if(trackRefLocal.current.children && trackRefLocal.current.children[0]){
        //             trackRefLocal.current.removeChild(trackRefLocal.current.children[0]);
        //         }
        //         trackRefLocal.current.appendChild(child2);
        //     }
        // }
        console.log(state.remoteParticipantTracks);
        if(trackRefLocal.current.children){
            //console.log(trackRefLocal.current.children);
            [...trackRefLocal.current.children].forEach(c => trackRefLocal.current.removeChild(c));
        }
        if(state.remoteParticipantTracks){
            state.remoteParticipantTracks.forEach(t => {
                //console.log(JSON.stringify(t));
                if(t.kind === "video"){
                    const remoteVideoTrack = [...state.remoteParticipant.videoTracks.values()][0];
                    trackRefLocal.current.appendChild(remoteVideoTrack.track.attach());
                }
                if(t.kind === "audio"){
                    const remoteAudioTrack = [...state.remoteParticipant.audioTracks.values()][0];
                    //trackRefLocal.current.appendChild(remoteAudioTrack.track.attach());
                }
            });
        }
    }, [state.remoteParticipantTracks?.length]);


    return (
        <div>
            <div ref={trackRefRemote}></div>
            <div ref={trackRefLocal}></div>
        </div>
    );
}

export default Video;