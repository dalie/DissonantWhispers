import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Session } from './Session';
declare var Peer: any;

@Injectable({
  providedIn: 'root'
})
export class RtcService {
  private _connection: PeerJs.Peer;
  private _dataConnections: PeerJs.DataConnection[] = [];
  private _mediaConnections: PeerJs.MediaConnection[] = [];
  private _remoteStreams: MediaStream[] = [];
  private _localStream: MediaStream;

  localStream = new Subject<MediaStream>();
  remoteStreams = new Subject<MediaStream[]>();
  dataConnections = new Subject<PeerJs.DataConnection[]>();

  constructor() {
    window.addEventListener('beforeunload', () => {
      this.destroy();
    });
  }

  destroy() {
    this._dataConnections.forEach(d => {
      d.close();
    });

    this._mediaConnections.forEach(m => {
      m.close();
    });

    this._connection.destroy();
  }

  getUserMedia() {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(mediaStream => {
      this._localStream = mediaStream;
      this.localStream.next(mediaStream);
    });
  }

  hostSession(session: Session) {
    this._connection = new Peer(`host_${session.name}`, {
      host: session.server,
      key: 'peerjs',
      path: 'myapp',
      port: 9000
    });

    this._connection.on('error', e => {
      console.log(e);
    });

    this._connection.on('open', () => {
      console.log('Connected to peer server, waiting for clients to join.');
    });

    this._connection.on('connection', dataConnection => {
      dataConnection.on('close', function() {
        console.log('data conn closed');
        console.log(this);
      });
      this.addDataConnection(dataConnection);
    });

    this._connection.on('call', mediaConnection => {
      this._mediaConnections.push(mediaConnection);
      mediaConnection.answer(this._localStream);
      mediaConnection.on('stream', stream => {
        this.addRemoteStream(stream);
      });

      mediaConnection.on('close', function() {
        console.log('media conn closed');
        console.log(this);
      });
    });
  }

  joinSession(session: Session) {
    this._connection = new Peer(null, {
      host: session.server,
      key: 'peerjs',
      path: 'myapp',
      port: 9000
    });

    this._connection.on('error', e => {
      console.log(e);
    });

    this.callUser(`host_${session.name}`);
  }

  callUser(userId: string) {
    const mediaConn = this._connection.call(userId, this._localStream);
    mediaConn.on('stream', stream => {
      this.addRemoteStream(stream);
    });

    const dataConn = this._connection.connect(userId);

    dataConn.on('data', data => {
      console.log(data);
    });

    this._mediaConnections.push(mediaConn);
    this._dataConnections.push(dataConn);
  }

  private addRemoteStream(stream) {
    if (this._remoteStreams.indexOf(stream) < 0) {
      this._remoteStreams.push(stream);
      this.remoteStreams.next(this._remoteStreams);
    }
  }

  private addDataConnection(dataConnection) {
    if (this._dataConnections.indexOf(dataConnection) < 0) {
      this._dataConnections.push(dataConnection);
      this.dataConnections.next(this._dataConnections);
    }
  }
}
