import Emitter from "./emitter";
import MediaDevice from "./mediaDevice";
import socket from "./socket";

const CONFIG: RTCConfiguration = { iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }] };

interface SignalMessage {
  to: string;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
}

class PeerConnection extends Emitter {
  private remoteId: string;
  private pc: RTCPeerConnection;
  private mediaDevice: MediaDevice;

  constructor(remoteId: string) {
    super();
    this.remoteId = remoteId;

    this.pc = new RTCPeerConnection(CONFIG);
    this.pc.onicecandidate = ({ candidate }) => {
      socket.emit("call", {
        to: this.remoteId,
        candidate,
      });
    };

    this.pc.ontrack = ({ streams }) => {
      this.emit("remoteStream", streams[0]);
    };

    this.mediaDevice = new MediaDevice();
    this.getDescription = this.getDescription.bind(this);
  }

  start(isCaller: boolean, config?: MediaStreamConstraints): this {
    this.mediaDevice
      .on("stream", (stream: MediaStream) => {
        stream.getTracks().forEach(t => {
          this.pc.addTrack(t, stream);
        });

        this.emit("localStream", stream);

        if (isCaller) {
          socket.emit("request", { to: this.remoteId });
        } else {
          this.createOffer();
        }
      })
      .start();

    return this;
  }

  stop(isCaller: boolean): this {
    if (isCaller) {
      socket.emit("end", { to: this.remoteId });
    }
    this.mediaDevice.stop();
    this.pc.restartIce();
    this.off("");

    return this;
  }

  createOffer(): this {
    this.pc.createOffer().then(this.getDescription).catch(console.error);
    return this;
  }

  createAnswer(): this {
    this.pc.createAnswer().then(this.getDescription).catch(console.error);
    return this;
  }

  getDescription(desc: RTCSessionDescriptionInit): this {
    this.pc.setLocalDescription(desc);
    const message: SignalMessage = { to: this.remoteId, sdp: desc };
    socket.emit("call", message);

    return this;
  }

  setRemoteDescription(desc: RTCSessionDescriptionInit): this {
    this.pc.setRemoteDescription(new RTCSessionDescription(desc));
    return this;
  }

  addIceCandidate(candidate: RTCIceCandidateInit | null): this {
    if (candidate) {
      this.pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.error);
    }

    return this;
  }
}

export default PeerConnection;
