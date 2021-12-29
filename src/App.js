import React, { useState, useContext, useReducer } from 'react';
import './App.css';
import Home from './Home';
import AppStateContext from './AppStateContext'
import ACTION_TYPE from './ActionType'


const initialState = {startVideo: false, videoLoading:false};

function reducer(state, action) {
  switch (action.type) {
    case ACTION_TYPE.START_VIDEO:
      return { ...state, startVideo:true, videoLoading:true, roomId:action.payload.roomId};
    case ACTION_TYPE.JOIN_CALL:
      return { ...state, startVideo:true, videoLoading:true};
    case ACTION_TYPE.VIDEO_LOADED:
      console.log(state);
      //const remoteParticipant = action.payload.room.remoteParticipant;
      return { ...state, videoLoading:false
        , room:action.payload.room, remoteParticipantTracks:action.payload.remoteParticipantTracks};
    case ACTION_TYPE.ADD_REMOTE_PARTICIPANT_TRACKS:
      console.log(state);
      if(!state.remoteParticipantTracks)
        return { ...state, remoteParticipantTracks:[action.payload.remoteParticipantTrack]};
      
        return { ...state, remoteParticipantTracks:[...state.remoteParticipantTracks, action.payload.remoteParticipantTrack]};
    case ACTION_TYPE.REMOVE_REMOTE_PARTICIPANT_TRACKS:
      return { ...state, remoteParticipantTracks:state.remoteParticipantTracks.filter(r => r != action.payload.remoteParticipantTracks)};
    case ACTION_TYPE.CLOSE_VIDEO:
      return { ...state, startVideo:false};
    case ACTION_TYPE.REMOTE_PARTICIPANT_CONNECTED:
      console.log(state);
      return { ...state, remoteParticipant:action.payload.remoteParticipant};
    default:
      throw new Error();
  }
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <AppStateContext.Provider value={[state, dispatch]}>
      <Home />
    </AppStateContext.Provider>
  );
}

export default App;
