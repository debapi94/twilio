import React, { useContext, useState, useRef } from "react"
import AppStateContext from './AppStateContext'
import ACTION_TYPE from "./ActionType";
import VideoContainer from "./components/VideoContainer";
import { checkIfRoomExists, connectToRoom, getTokenFromTwilio, getLocalVideoTracks } from './Twilio';
import { v4 as uuidv4 } from "uuid";

const Home = () => {
    const trackRefLocal = useRef();
    const [state, dispatch] = useContext(AppStateContext);
    const [roomId, setRoomId] = useState(undefined);
    const [previewApproved, setPreviewApproved] = useState(false);

    const handleStartVideo = () => {
        const new_roomId = uuidv4();
        console.log(new_roomId);
        dispatch({type:ACTION_TYPE.START_VIDEO, payload:{roomId:new_roomId}});
        checkIfRoomExists(new_roomId).then(result => {
            if(!result){
                getTokenFromTwilio('User1').then(token => {
                    connectToRoom(token, new_roomId, false).then(({room, dataTrack}) => {
                        //console.log(room);
                        room.on("participantConnected", (participant) =>
                        {console.log("Patient connected", participant.identity);
                            const tracks = [];
                            participant.on("trackSubscribed", (track) => {
                                //console.log("track", JSON.stringify(track));
                                if(track.kind === "data"){
                                    track.on('message', data => {//console.log(data, typeof data);
                                        // if(typeof data === 'string')
                                        //     dispatch({type:ACTION_TYPE.ADD_CHAT_MESSAGE, payload:{...JSON.parse(data)}});
                                        // else if(typeof data === 'object')
                                        //     dispatch({type:ACTION_TYPE.ADD_CHAT_MESSAGE, payload:{file:true, chat:data, identity:null}});
                                        let chatObj = JSON.parse(data);
                                        //console.log(chatObj);
                                        if(!chatObj.file)
                                            dispatch({type:ACTION_TYPE.ADD_CHAT_MESSAGE, payload:{...JSON.parse(data)}});
                                        else
                                            dispatch({type:ACTION_TYPE.ADD_CHAT_MESSAGE, payload:chatObj});
                                    });
                                }
                                else{
                                  //  console.log("track kind", track.kind);
                                    dispatch({type:ACTION_TYPE.ADD_REMOTE_PARTICIPANT_TRACKS
                                        , payload:{remoteParticipantTrack:track}})
                                }
                              });
                        
                              participant.on("trackUnpublished", (track) => {
                                  console.log(track);
                                dispatch({type:ACTION_TYPE.REMOVE_REMOTE_PARTICIPANT_TRACKS
                                    , payload:{remoteParticipantTrack:track}})
                              });
                              
                            dispatch({type:ACTION_TYPE.REMOTE_PARTICIPANT_CONNECTED
                                , payload:{remoteParticipant:participant, remoteParticipantTracks:tracks}})
                        });
                        room.on("participantDisconnected", (participant) =>{
                            //console.log("Participant disconnected", participant.identity);
                            dispatch({ type:ACTION_TYPE.REMOTE_PARTICIPANT_DISCONNECTED });
                        });
                        dispatch({type:ACTION_TYPE.VIDEO_LOADED, payload:{room, localDataTrack:dataTrack}});
                    })
                });
            }
        });
    }

    const handlePreviewCall = async () => {
        let videoTrack = await getLocalVideoTracks();
        console.log(videoTrack);
        //dispatch({type:ACTION_TYPE.ADD_REMOTE_PARTICIPANT_TRACKS, payload:{preview:true,previewVideoTrack:videoTrack}});

        trackRefLocal.current.appendChild(videoTrack.attach());
    }

    const handleJoinCall = () => {
        if(trackRefLocal.current.children){
            //console.log(trackRefLocal.current.children);
            [...trackRefLocal.current.children].forEach(c => trackRefLocal.current.removeChild(c));
        }

        dispatch({type:ACTION_TYPE.JOIN_CALL});
        checkIfRoomExists(roomId).then(result => {
            if(result){
                getTokenFromTwilio('Patient1').then(token => {
                    connectToRoom(token, roomId, false).then(({room, dataTrack}) => {
                        //console.log(room);
                        room.participants.forEach(participant => {
                            dispatch({type:ACTION_TYPE.REMOTE_PARTICIPANT_CONNECTED
                                , payload:{remoteParticipant:participant, remoteParticipantTracks:[]}});
                            console.log("Host connected", participant.identity);
                            
                            participant.on("trackSubscribed", (track) => {
                                if(track.kind === "data"){
                                    track.on('message', data => {//console.log(data, typeof data);
                                        let chatObj = JSON.parse(data);
                                        //console.log(chatObj);
                                        if(!chatObj.file)
                                            dispatch({type:ACTION_TYPE.ADD_CHAT_MESSAGE, payload:{...JSON.parse(data)}});
                                        else
                                            dispatch({type:ACTION_TYPE.ADD_CHAT_MESSAGE, payload:chatObj});
                                    });
                                }
                                else{
                                  //  console.log("track kind", track.kind);
                                    dispatch({type:ACTION_TYPE.ADD_REMOTE_PARTICIPANT_TRACKS
                                        , payload:{remoteParticipantTrack:track}})
                                }
                                //console.log("track", track);
                                //if(track.track){
                                    // dispatch({type:ACTION_TYPE.ADD_REMOTE_PARTICIPANT_TRACKS
                                    //     , payload:{remoteParticipantTrack:track}})
                                //}
                            });
                        });
                        room.on("participantDisconnected", (participant) =>{
                            //console.log("Participant disconnected", participant.identity);
                            dispatch({ type:ACTION_TYPE.REMOTE_PARTICIPANT_DISCONNECTED });
                        });
                        // room.on("participantConnected", (p) => {
                            // room.participants.values().forEach(participant => {
                                // console.log("Host connected", participant.identity);
                                // console.log("Host connected", participant);
                                // const tracks = [];
                                // participant.on("trackSubscribed", (track) => {
                                //     console.log("track", track);
                                //     if(track.kind === "video"){
                                //         dispatch({type:ACTION_TYPE.ADD_REMOTE_PARTICIPANT_TRACKS
                                //             , payload:{remoteParticipantTrack:track}})
                                //     }
                                //   });
                                // participant.tracks.forEach(publication => {
                                //     console.log("publication", publication);
                                //     console.log("publication isSubscribed", publication.isSubscribed);
                                //     if (publication.isSubscribed) {
                                //       const track = publication.track;
                                //       console.log("track", track);
                                //       tracks.push(track);
                                //     }
                                //   });
                                //   console.log(tracks);
                                //   dispatch({type:ACTION_TYPE.ADD_REMOTE_PARTICIPANT_TRACKS
                                //       , payload:{remoteParticipantTrack:tracks[0]}});
                            // });
                        // });
                        // room.on("participantConnected", (participant) =>
                        // {
                        //     console.log("Host connected", participant.identity);
                        //     const tracks = [];
                        //     participant.tracks.forEach(publication => {
                        //         console.log("publication", publication);
                        //         console.log("publication isSubscribed", publication.isSubscribed);
                        //         if (publication.isSubscribed) {
                        //           const track = publication.track;
                        //           tracks.push(track);
                        //         }
                        //       });
                        //       console.log(tracks);
                        //       dispatch({type:ACTION_TYPE.ADD_REMOTE_PARTICIPANT_TRACKS
                        //           , payload:{remoteParticipantTrack:tracks[0]}})
                        // });
                        dispatch({type:ACTION_TYPE.VIDEO_LOADED, payload:{room, localDataTrack:dataTrack}});
                    })
                });
            }
        });
    }

    return (
        <>
            <div>
                <button onClick={e => handleStartVideo()} disabled={state.startVideo || roomId}>Start call</button>
            </div>
            <div>
                Room id: <input value={roomId} onChange={e => setRoomId(e.target.value)}/>
                &nbsp;(required to join a call)
                <br />
                <button onClick={e => handlePreviewCall()} disabled={!roomId}>Preview</button>
                <button onClick={e => handleJoinCall()} disabled={!roomId}>Join Call</button>
            </div>
            <div>
                <button disabled={state.startVideo}>Schedule a call</button>
            </div>
            <div>
                <div ref={trackRefLocal}></div>
                <button onClick={e => handleJoinCall()} disabled={!roomId}>Approve preview</button>
            </div>
            {state.startVideo && <VideoContainer />}
        </>
    );
}

export default Home;