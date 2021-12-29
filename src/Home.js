import React, { useContext, useState } from "react"
import AppStateContext from './AppStateContext'
import ACTION_TYPE from "./ActionType";
import VideoContainer from "./components/VideoContainer";
import { checkIfRoomExists, connectToRoom, getTokenFromTwilio } from './Twilio';
import { v4 as uuidv4 } from "uuid";

const Home = () => {
    const [state, dispatch] = useContext(AppStateContext);
    const [roomId, setRoomId] = useState(undefined);

    const handleStartVideo = () => {
        const new_roomId = uuidv4();
        console.log(new_roomId);
        dispatch({type:ACTION_TYPE.START_VIDEO, payload:{roomId:new_roomId}});
        checkIfRoomExists(new_roomId).then(result => {
            if(!result){
                getTokenFromTwilio('User1').then(token => {
                    connectToRoom(token, new_roomId, false).then(room => {
                        console.log(room);
                        room.on("participantConnected", (participant) =>
                        {console.log("Patient connected", participant.identity);
                            const tracks = [];
                            participant.on("trackSubscribed", (track) => {
                                console.log("track", track);
                                if(track.kind === "video"){
                                    dispatch({type:ACTION_TYPE.ADD_REMOTE_PARTICIPANT_TRACKS
                                        , payload:{remoteParticipantTrack:track}})
                                }
                              });
                        
                              participant.on("trackUnpublished", (track) => {
                                dispatch({type:ACTION_TYPE.REMOVE_REMOTE_PARTICIPANT_TRACKS
                                    , payload:{remoteParticipantTrack:track}})
                              });
                              
                            dispatch({type:ACTION_TYPE.REMOTE_PARTICIPANT_CONNECTED
                                , payload:{remoteParticipant:participant, remoteParticipantTracks:tracks}})
                        });
                        dispatch({type:ACTION_TYPE.VIDEO_LOADED, payload:{room}});
                    })
                });
            }
        });
    }

    const handleJoinCall = () => {
        dispatch({type:ACTION_TYPE.JOIN_CALL});
        checkIfRoomExists(roomId).then(result => {
            if(result){
                getTokenFromTwilio('Patient1').then(token => {
                    connectToRoom(token, roomId, false).then(room => {
                        console.log(room);
                        room.participants.forEach(participant => {
                            dispatch({type:ACTION_TYPE.REMOTE_PARTICIPANT_CONNECTED
                                , payload:{remoteParticipant:participant, remoteParticipantTracks:[]}});
                            console.log("Host connected", participant.identity);
                            
                            participant.on("trackSubscribed", (track) => {
                                console.log("track", track);
                                if(track.kind === "video"){
                                    dispatch({type:ACTION_TYPE.ADD_REMOTE_PARTICIPANT_TRACKS
                                        , payload:{remoteParticipantTrack:track}})
                                }
                            });
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
                        dispatch({type:ACTION_TYPE.VIDEO_LOADED, payload:{room}});
                    })
                });
            }
        });
    }

    return (
        <>
            <div>
                <button onClick={e => handleStartVideo()} disabled={state.startVideo}>Start call</button>
            </div>
            <div>
                Room id: <input value={roomId} onChange={e => setRoomId(e.target.value)}/>
                &nbsp;(required to join a call)
                <br />
                <button onClick={e => handleJoinCall()} disabled={!roomId}>Join call</button>
            </div>
            <div>
                <button disabled={state.startVideo}>Schedule a call</button>
            </div>
            {state.startVideo && <VideoContainer />}
        </>
    );
}

export default Home;