const { spawnSync } = require('child_process');

class WebSocket {
  static setup(io) {
    this.io = io;
    this.io.on('connection', this.connectionCallback.bind(this));
    this.text = '';
  }

  static connectionCallback(socket) {
    this.io.emit(WebSocket.CONSTANTS.CONNECTED, { id: socket.id });
    socket.emit(WebSocket.CONSTANTS.SET_TEXT, { text: this.text });

    socket.on(WebSocket.CONSTANTS.SET_TEXT, text => {
      this.text = text;
      console.log(`[${new Date()}] SET_TEXT: '${text}'`);
      this.io.emit(WebSocket.CONSTANTS.SET_TEXT, { text, id: socket.id });
    });

    socket.on(WebSocket.CONSTANTS.GET_IP, _ => {
      // TODO
      const output = spawnSync('ifconfig').stdout.toString();
      const regex = /.*[inet]\s(\d+\.\d+\.\d+\.\d+)\s.*/g;
      let matches = output.match(regex);
      console.log(matches);
      matches = matches.filter(m => !m.includes('127.0.0.1'));
      const ip = matches[0];
      console.log(`[${new Date()}] GET_IP: '${ip}'`);
      this.io.emit(WebSocket.CONSTANTS.GET_IP, ip);
    });

    socket.on('disconnect', _data => {
      this.io.emit(WebSocket.CONSTANTS.DISCONNECTED, { id: socket.id });
    });
  }
}

WebSocket._CONSTANTS = ['CONNECTED', 'DISCONNECTED', 'SET_TEXT', 'GET_IP'];
WebSocket.CONSTANTS = new Proxy({}, {
  get(target, property, _receiver) {
    if (!WebSocket._CONSTANTS.includes(property)) {
      throw new Error(`The WebSocket CONSTANTS '${property}' is not defined`);
    }
    return property;
  },
});

module.exports = WebSocket;
