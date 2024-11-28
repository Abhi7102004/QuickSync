import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useSocket } from "./SocketContext";

const WebRTCContext = createContext();

export const useWebRTC = () => {
  const context = useContext(WebRTCContext);
  if (!context) {
    throw new Error("useWebRTC must be used within a WebRTCProvider");
  }
  return context;
};

const configuration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export const WebRTCProvider = ({ children }) => {
  const socket = useSocket();
  const [callState, setCallState] = useState({
    isIncomingCall: false,
    isOutgoingCall: false,
    isCalling: false,
    callType: null,
    remoteUserId: null,
    callId: null,
    caller: null,
    isCallAccepted: false,
  });

  const [streams, setStreams] = useState({
    localStream: null,
    remoteStream: null,
  });

  const peerConnection = useRef(null);
  // const { userInfo } = useAppStore();
  const callStateRef = useRef(callState);

  // Keep callStateRef in sync with callState
  useEffect(() => {
    callStateRef.current = callState;
  }, [callState]);

  const createPeerConnection = useCallback(() => {
    if (peerConnection.current) {
      peerConnection.current.close();
    }

    const pc = new RTCPeerConnection(configuration);

    pc.onicecandidate = (event) => {
      if (event.candidate && socket && callStateRef.current.callId) {
        socket.emit("ice-candidate", {
          callId: callStateRef.current.callId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      setStreams((prev) => ({
        ...prev,
        remoteStream: event.streams[0],
      }));
    };

    pc.oniceconnectionstatechange = () => {
      if (
        pc.iceConnectionState === "disconnected" ||
        pc.iceConnectionState === "failed"
      ) {
        handleEndCall();
      }
    };

    peerConnection.current = pc;
    return pc;
  }, [socket]);

  const initiateCall = useCallback(
    async (recipientId, callType) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: callType === "video",
        });

        setCallState((prev) => ({
          ...prev,
          isOutgoingCall: true,
          isCalling: true,
          callType,
          remoteUserId: recipientId,
        }));

        const pc = createPeerConnection();
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        setStreams((prev) => ({ ...prev, localStream: stream }));

        socket.emit("initiate-call", {
          recipientId,
          callType,
        });
      } catch (err) {
        console.error("Error accessing media devices:", err);
        handleEndCall();
      }
    },
    [socket, createPeerConnection]
  );

  const handleEndCall = useCallback(() => {
    const currentCallId = callStateRef.current.callId;
    if (currentCallId) {
      socket.emit("end-call", { callId: currentCallId });
    }

    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }

    if (streams.localStream) {
      streams.localStream.getTracks().forEach((track) => track.stop());
    }

    if (streams.remoteStream) {
      streams.remoteStream.getTracks().forEach((track) => track.stop());
    }

    setStreams({ localStream: null, remoteStream: null });
    setCallState({
      isIncomingCall: false,
      isOutgoingCall: false,
      isCalling: false,
      callType: null,
      remoteUserId: null,
      callId: null,
      caller: null,
      isCallAccepted: false,
    });
  }, [streams.localStream, streams.remoteStream, socket]);

  const answerCall = useCallback(
    async (accepted) => {
      if (!callStateRef.current.isIncomingCall) return;

      if (accepted) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: callStateRef.current.callType === "video",
          });

          const pc = createPeerConnection();
          stream.getTracks().forEach((track) => pc.addTrack(track, stream));

          setStreams((prev) => ({ ...prev, localStream: stream }));

          setCallState((prev) => ({
            ...prev,
            isCallAccepted: true,
            isCalling: true,
          }));

          socket.emit("call-response", {
            callId: callStateRef.current.callId,
            accepted: true,
          });
        } catch (err) {
          console.error("Error accessing media devices:", err);
          socket.emit("call-response", {
            callId: callStateRef.current.callId,
            accepted: false,
          });
          handleEndCall();
        }
      } else {
        socket.emit("call-response", {
          callId: callStateRef.current.callId,
          accepted: false,
        });
        handleEndCall();
      }
    },
    [createPeerConnection, socket, handleEndCall]
  );

  useEffect(() => {
    if (!socket) return;

    const handleIncomingCall = ({ callId, callerId, callType }) => {
      setCallState({
        isIncomingCall: true,
        isOutgoingCall: false,
        isCalling: false,
        callType,
        remoteUserId: callerId,
        callId,
        caller: callerId,
        isCallAccepted: false,
      });
    };

    const handleCallAccepted = async ({ callId }) => {
      setCallState((prev) => ({
        ...prev,
        callId,
        isCallAccepted: true,
        isCalling: true,
      }));

      // Wait for state update before proceeding
      setTimeout(async () => {
        try {
          if (peerConnection.current && streams.localStream) {
            const offer = await peerConnection.current.createOffer();
            await peerConnection.current.setLocalDescription(offer);
            socket.emit("sdp-offer", {
              callId,
              sdp: offer,
            });
          }
        } catch (err) {
          console.error("Error creating offer:", err);
          handleEndCall();
        }
      }, 0);
    };

    socket.on("incoming-call", handleIncomingCall);
    socket.on("call-accepted", handleCallAccepted);
    socket.on("call-rejected", handleEndCall);
    socket.on("call-ended", handleEndCall);
    socket.on("call-failed", ({ reason }) => {
      console.error("Call failed:", reason);
      handleEndCall();
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      if (peerConnection.current && candidate) {
        try {
          await peerConnection.current.addIceCandidate(
            new RTCIceCandidate(candidate)
          );
        } catch (err) {
          console.error("Error adding ICE candidate:", err);
        }
      }
    });

    socket.on("sdp-offer", async ({ sdp }) => {
      if (peerConnection.current) {
        try {
          await peerConnection.current.setRemoteDescription(
            new RTCSessionDescription(sdp)
          );
          const answer = await peerConnection.current.createAnswer();
          await peerConnection.current.setLocalDescription(answer);
          socket.emit("sdp-answer", {
            callId: callStateRef.current.callId,
            sdp: answer,
          });
        } catch (err) {
          console.error("Error handling SDP offer:", err);
        }
      }
    });

    socket.on("sdp-answer", async ({ sdp }) => {
      if (peerConnection.current) {
        try {
          await peerConnection.current.setRemoteDescription(
            new RTCSessionDescription(sdp)
          );
        } catch (err) {
          console.error("Error handling SDP answer:", err);
        }
      }
    });

    return () => {
      socket.off("incoming-call");
      socket.off("call-accepted");
      socket.off("call-rejected");
      socket.off("call-ended");
      socket.off("call-failed");
      socket.off("ice-candidate");
      socket.off("sdp-offer");
      socket.off("sdp-answer");
    };
  }, [socket, streams.localStream, handleEndCall]);

  return (
    <WebRTCContext.Provider
      value={{
        callState,
        streams,
        initiateCall,
        answerCall,
        endCall: handleEndCall,
      }}
    >
      {children}
    </WebRTCContext.Provider>
  );
};
