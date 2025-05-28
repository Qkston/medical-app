import Emitter from "./emitter";

class MediaDevice extends Emitter {
  private stream: MediaStream | null = null;

  start(): this {
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: true,
      })
      .then((stream: MediaStream) => {
        this.stream = stream;
        this.emit("stream", stream);
      })
      .catch(console.error);

    return this;
  }


  toggle(type: "Audio" | "Video", on?: boolean): this {
    if (this.stream) {
      this.stream[`get${type}Tracks`]().forEach((t: MediaStreamTrack) => {
        t.enabled = on !== undefined ? on : !t.enabled;
      });
    }

    return this;
  }

  stop(): this {
    if (this.stream) {
      this.stream.getTracks().forEach((t: MediaStreamTrack) => {
        t.stop();
      });
    }
    this.off("");

    return this;
  }
}

export default MediaDevice;
