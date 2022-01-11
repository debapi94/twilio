import React, { useState, useContext } from "react";
import AppStateContext from '../AppStateContext'
import ACTION_TYPE from "../ActionType";



const Chat = () => {
    const [chatData, setChatData] = useState();
    const [state, dispatch] = useContext(AppStateContext);

    const handleSendChat = () => {
        if(state.localDataTrack){
            console.log("user 1 chate sent");
            state.localDataTrack.send(JSON.stringify({file:false, chat:chatData, identity:state.identity}));
        }
        dispatch({type:ACTION_TYPE.ADD_CHAT_MESSAGE, payload:{file:false, chat:chatData, identity:state.identity}});
        setChatData("");
    }

    const handleFileChange = async (e) => {
        if(e.target.files[0]){
            const selectedFile = e.target.files[0];
            console.log(selectedFile);
            let buffer  = await selectedFile.arrayBuffer();
            let str = Buffer.from(buffer).toString('base64');
            state.localDataTrack.send(JSON.stringify({file:true, chat:str, identity:state.identity, name:selectedFile.name, type:selectedFile.type}));
            // state.localDataTrack.send(buffer);
            dispatch({type:ACTION_TYPE.ADD_CHAT_MESSAGE, payload:{file:true, chat:buffer, identity:state.identity}});
        }
    }

    const downloadFile = ({identity, chat, name, type}) => {4
            var bytes = new Uint8Array(Buffer.from(chat, 'base64'));
            const blob = new Blob([bytes.buffer], { type });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = name;
            link.click();
    }

    return (
        <div className="chat">
            <div className="chat-message">
            {state.chats.map(c => c.file ? <div onClick={e => downloadFile(c)}>{c.identity} - {c.name} File received...</div>  : <div>{c.identity} - {c.chat}</div>)}
                {/* {state.chats.map(c => <div>{c.identity ?? state.remoteParticipant.identity.substring(36)} - {c.chat}</div>)} */}
            </div>
            <input type="text" value={chatData} onChange={e => setChatData(e.target.value)}/>
            <button onClick={e => handleSendChat()}>Enter</button>
                <label htmlFor="upload-file" className="upload-label">File</label>
                <input type="file" name="photo" id="upload-file" className="upload-file" 
                onChange={e => handleFileChange(e)}/>
        </div>
    );
}

export default Chat;