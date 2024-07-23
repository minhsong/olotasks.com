// socketClient.js
import { io } from "socket.io-client";

class SocketClient {
  constructor(url) {
    if (!SocketClient.instance) {
      this.socket = io(url);
      SocketClient.instance = this;
    }
    return SocketClient.instance;
  }

  sendMessage(event, message) {
    this.socket.emit(event, message);
  }

  addEventListener(event, listener) {
    this.socket.on(event, listener);
  }
}

const singletonSocketClient = (function () {
  let instance;
  return function (url) {
    if (!instance) {
      instance = new SocketClient(url);
    }
    return instance;
  };
})();

export default singletonSocketClient;
