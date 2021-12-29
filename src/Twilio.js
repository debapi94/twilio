import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import {
  connect,
  LocalAudioTrack,
  LocalDataTrack,
  LocalVideoTrack,
} from "twilio-video";

const audioConstraints = {
  video: false,
  audio: true,
};

const videoConstraints = {
  audio: true,
  video: {
    width: 640,
    height: 480,
  },
};

export const getTokenFromTwilio = async (identity) => {
  const randomId = uuidv4();

  const response = await axios.get(
    `https://cm2-twilio-video-poc-5184-dev.twil.io/token-service?identity=${randomId}${identity}`
  );

  const data = response.data;

  return data.accessToken;
};

export const connectToRoom = async (
  accessToken,
  roomId = "test-room",
  onlyWithAudio
) => {
  const constraints = onlyWithAudio ? audioConstraints : videoConstraints;

  return navigator.mediaDevices
    .getUserMedia(constraints)
    .then(async (stream) => {
      let tracks;

      // create data track for messages
      const audioTrack = new LocalAudioTrack(stream.getAudioTracks()[0]);

      let videoTrack;

      if (!onlyWithAudio) {
        videoTrack = new LocalVideoTrack(stream.getVideoTracks()[0]);
        tracks = [audioTrack, videoTrack];
      } else {
        tracks = [audioTrack];
      }

      const room = await connect(accessToken, {
        name: roomId,
        tracks,
      });
      console.log("succesfully connected with twilio room");
      //console.log(room);
      return room;
      //store.dispatch(setShowOverlay(false));
    })
    .catch((err) => {
      console.log(
        "Error occurred when trying to get an access to local devices"
      );
      console.log(err);
    });
};

export const checkIfRoomExists = async (roomId) => {
  const response = await axios.get(
    `https://cm2-twilio-video-poc-5184-dev.twil.io/room-exists?roomId=${roomId}`
  );

  return response.data.roomExists;
};
