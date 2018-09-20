/* global Vue, VueSocketIOExt, io, QRCode */

const vueApp = {
  el: '#app',
  mounted() {
    new ClipboardJS('#copy-btn');
  },
  sockets: {
    connect() {
      console.log('socket connected', this.$socket.id);
      this.socketId = this.$socket.id;
      this.$socket.emit('GET_IP');
    },
    CONNECTED() {
      this.status = 'Connected';
    },
    disconnect() {
      this.status = 'Connecting...';
    },
    GET_IP(ip) {
      QRCode.toCanvas(document.getElementById('canvas'), ip, {
        // version: 2,
      }, err => {
        if (err) console.error(err);
        else console.log('GET_IP', ip);
      });
    },
    SET_TEXT({ id, text }) {
      if (this.socketId !== id) {
        this.updateText(decodeURI(text), false);
      }
    },
  },
  methods: {
    updateText(newText, updateServer = true) {
      this.text = newText;
      if (updateServer) {
        this.$socket.emit('SET_TEXT', encodeURI(newText));
      }
    },
  },
  computed: {
    hudStyle() {
      if (this.status === 'Connected') {
        return {
          color: 'green',
        };
      }
      return {
        color: 'red',
      };
    },
  },
  data: {
    status: 'Connecting...',
    text: '',
    socketId: null,
  },
};

function onReady(fn) {
  if (document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

onReady(() => {
  Vue.use(VueSocketIOExt, io(undefined, { reconnectionAttempts: 3 }));
  new Vue(vueApp); // eslint-disable-line no-new
});
