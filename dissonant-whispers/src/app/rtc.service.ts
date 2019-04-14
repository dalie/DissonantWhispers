import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Session } from './Session';
declare var Peer: any;

@Injectable({
  providedIn: 'root'
})
export class RtcService {
  private _remoteStreams: MediaStream[] = [];
  private _localStream: MediaStream;
  private _connections: any[] = [];

  localStream = new Subject<MediaStream>();
  remoteStreams = new Subject<MediaStream[]>();

  constructor() {}

  destroy() {
    this._connections.forEach(c => {
      c.destroy();
    });
  }

  getUserMedia() {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(mediaStream => {
      this._localStream = mediaStream;
      this.localStream.next(mediaStream);
    });
  }

  hostSession(session: Session) {
    const connection = new Peer(`host_${session.name}`, {
      host: session.server,
      key: 'peerjs',
      path: 'myapp',
      port: 9000
    });

    connection.on('error', e => {
      console.log(e);
    });

    connection.on('open', () => {
      console.log('Connected to peer server, waiting for clients to join.');
    });

    connection.on('connection', dataConnection => {
      console.log('user connected');
      console.log(dataConnection);
      setTimeout(() => {
        dataConnection.send('hello');
      }, 2000);
    });

    connection.on('call', mediaConnection => {
      console.log('received call, answering with stream');
      mediaConnection.answer(this._localStream);
      mediaConnection.on('stream', stream => {
        this.addRemoteStream(stream);
      });

      mediaConnection.on('close', function() {
        console.log(this);
      });
    });

    this._connections.push(connection);
  }

  joinSession(session: Session) {
    const connection = new Peer(null, {
      host: session.server,
      key: 'peerjs',
      path: 'myapp',
      port: 9000
    });

    connection.on('error', e => {
      console.log(e);
    });

    const mediaConn = connection.call(`host_${session.name}`, this._localStream);
    mediaConn.on('stream', stream => {
      console.log(stream);
      console.log('received stream');
      this.addRemoteStream(stream);
    });

    const dataConn = connection.connect(`host_${session.name}`);

    dataConn.on('data', data => {
      console.log(data);
    });
  }

  private addRemoteStream(stream) {
    if (this._remoteStreams.indexOf(stream) < 0) {
      this._remoteStreams.push(stream);
      this.remoteStreams.next(this._remoteStreams);
    }
  }
}
