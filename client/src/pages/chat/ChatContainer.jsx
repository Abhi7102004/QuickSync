import React from "react";
import { useWebRTC } from "@/context/WebRTCContext";
import ChatHeaderContainer from "./ChatHeaderContainer";
import MessageContainer from "./MessageContainer";
import MessageBar from "./MessageBar";
import CallModal from "./CallModal";
import IncomingCallModal from "./IncomingCallModal";

const ChatContainer = () => {
  const { callState, streams, answerCall, endCall } = useWebRTC();
  return (
    <>
      <div className="flex flex-col h-full bg-gray-900">
        <ChatHeaderContainer />
        <MessageContainer />
        <MessageBar />
      </div>

      {/* Modals positioned outside the flex container */}
      <IncomingCallModal
        isOpen={callState.isIncomingCall && !callState.isCallAccepted}
        caller={callState.caller}
        callType={callState.callType}
        onAccept={() => answerCall(true)}
        onReject={() => answerCall(false)}
      />

      <CallModal
        isOpen={callState.isCalling || callState.isCallAccepted}
        streams={streams}
        callType={callState.callType}
        onEnd={endCall}
        callState={callState}
      />
    </>
  );
};

export default ChatContainer;
