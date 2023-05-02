import { Peer } from "peerjs";

const IS_DEV = import.meta.env.DEV;
const peerHost = IS_DEV ? "localhost" : import.meta.env.VITE_PRODUCTION_HOST;

class PeerClient {
  private peerInstance: Peer;

  constructor() {
    this.peerInstance = new Peer({
      host: "geocall-server.onrender.com",
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