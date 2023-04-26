import { Peer } from "peerjs";

class PeerClient {
  private peerInstance: Peer;

  constructor() {
    this.peerInstance = new Peer({
      host: "localhost",
      port: 443,
      path: "/peer"
    });
  };

  get getInstance() {
    return this.peerInstance
  };
};

const peer = new PeerClient();

export default Object.freeze(peer);