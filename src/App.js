import React, { useReducer, useEffect } from 'react';
import './App.css';
import Home from './Home';
import AppStateContext from './AppStateContext'
import ACTION_TYPE from './ActionType'


const initialState = {initial:true, startVideo: false, videoLoading:false, chats:[],  remoteParticipantTracks:[], preview:false};

function reducer(state, action) {
  switch (action.type) {
    case ACTION_TYPE.START_VIDEO:
      return { ...state, startVideo:true, videoLoading:true, startCamera:true, muteAudio:false, roomId:action.payload.roomId};
    case ACTION_TYPE.JOIN_CALL:
      return { ...state, startVideo:true, videoLoading:true};
    case ACTION_TYPE.VIDEO_LOADED:
      //const remoteParticipant = action.payload.room.remoteParticipant;
      const {room, localDataTrack} = action.payload;
      return { ...state, initial:false, videoLoading:false, room, identity:room.localParticipant.identity.substring(36), localDataTrack};
    case ACTION_TYPE.ADD_REMOTE_PARTICIPANT_TRACKS:
      //console.log(action.payload.remoteParticipantTrack);
      return { ...state, remoteParticipantTracks:[...state.remoteParticipantTracks, action.payload.remoteParticipantTrack]};
    case ACTION_TYPE.REMOVE_REMOTE_PARTICIPANT_TRACKS:
      return { ...state, remoteParticipantTracks:state.remoteParticipantTracks.filter(r => r !== action.payload.remoteParticipantTracks)};
    case ACTION_TYPE.CLOSE_VIDEO:
      return { ...state, startVideo:false};
    case ACTION_TYPE.REMOTE_PARTICIPANT_CONNECTED:
      return { ...state, remoteParticipant:action.payload.remoteParticipant};
    case ACTION_TYPE.REMOTE_PARTICIPANT_DISCONNECTED:
      return { ...state, remoteParticipant:null, remoteParticipantTracks:[]};
    case ACTION_TYPE.START_CAMERA:
      return { ...state, startCamera:true};
    case ACTION_TYPE.STOP_CAMERA:
      return { ...state, startCamera:false};
    case ACTION_TYPE.MUTE_AUDIO:
      return { ...state, muteAudio:true};
    case ACTION_TYPE.UNMUTE_AUDIO:
      return { ...state, muteAudio:false};
    case ACTION_TYPE.ADD_CHAT_MESSAGE:
      return { ...state, chats:[...state.chats, action.payload]};
    case ACTION_TYPE.PREVIEW_LOCAL_TRACK:
      return { ...state, preview:action.payload.preview, previewVideoTrack:action.payload.previewVideoTrack};
    default:
      throw new Error();
  }
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

     useEffect(() => {

      // window.onbeforeunload = function(event) {
      //     const e = event || window.event;
      //     console.log(e);
      //     e.preventDefault();
      //     e.returnValue = '';
      // };

      window.onunload = function(e){
        state.room.disconnect();
        return true;
      }
      
      return () => {
        //window.onbeforeunload = null;
        window.onunload = null;
      }
    });

  return (
    <AppStateContext.Provider value={[state, dispatch]}>
      <Home />
    </AppStateContext.Provider>
  );
}

export default App;
