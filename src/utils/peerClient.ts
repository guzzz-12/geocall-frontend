import { Peer } from "peerjs";

class PeerClient {
  private peerInstance: Peer;

  constructor() {
    this.peerInstance = new Peer({
      host: "192.168.0.114",
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