import { Peer } from "peerjs";

const IS_DEV = import.meta.env.DEV;
const peerHost = IS_DEV ? "localhost" : import.meta.env.VITE_PEER_HOST;

class PeerClient {
  private peerInstance: Peer;

  constructor() {
    this.peerInstance = new Peer({
      host: peerHost,
      port: IS_DEV ? 10000: 443,
      secure: !IS_DEV,
      path: "/peer"
    });
  };

  get getInstance() {
    return this.peerInstance
  };
};

const peer = new PeerClient();

export default Object.freeze(peer);