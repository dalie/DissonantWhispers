import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Session } from './Session';
import { find, remove } from 'lodash';
import * as PeerJs from 'peerjs';

declare var Peer: any;
interface PeerUser {
  id: string;
  name: string;
  dataConnection: PeerJs.DataConnection;
  mediaConnection: PeerJs.MediaConnection;
  stream: MediaStream;
}

interface DataMessage {
  type: 'chat' | 'user';
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class RtcService {
  private _name: string;
  private _connection: PeerJs;
  private _localStream: MediaStream;
  private _users: PeerUser[] = [];

  localStream = new Subject<MediaStream>();
  users = new Subject<PeerUser[]>();

  constructor() {
    window.addEventListener('beforeunload', () => {
      this.destroy();
    });
  }

  destroy() {
    this._users.forEach(user => {
      if (user.dataConnection) {
        user.dataConnection.close();
      }
      if (user.mediaConnection) {
        user.mediaConnection.close();
      }
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
    this._name = 'DM';
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
      this.addUser(dataConnection.peer, null, dataConnection);

      const self = this;

      dataConnection.on('open', () => {
        dataConnection.send({ type: 'user', message: name } as DataMessage);
      });
      dataConnection.on('close', function() {
        self.removeUser(this.peer);
      });

      dataConnection.on('data', function(data: DataMessage) {
        if (data.type === 'user') {
          self.addUser(this.peer, data.message);
        }
      });
    });

    this._connection.on('call', mediaConnection => {
      mediaConnection.answer(this._localStream);
      const self = this;
      mediaConnection.on('stream', function(stream) {
        self.addUser(this.peer, null, null, this, stream);
      });

      mediaConnection.on('close', function() {
        self.removeUser(this.peer);
      });
    });
  }

  joinSession(name: string, session: Session) {
    this._connection = new Peer(null, {
      host: session.server,
      key: 'peerjs',
      path: 'myapp',
      port: 9000
    });

    this._connection.on('error', e => {
      console.log(e);
    });

    this.callUser(`host_${session.name}`, name);
  }

  callUser(userId: string, name: string) {
    this._name = name;
    const mediaConn = this._connection.call(userId, this._localStream, { name });
    const self = this;
    mediaConn.on('stream', function(stream) {
      self.addUser(this.peer, null, null, this, stream);
    });

    mediaConn.on('close', function() {
      self.removeUser(this.peer);
    });

    const dataConn = this._connection.connect(userId);

    dataConn.on('close', function() {
      self.removeUser(this.peer);
    });

    dataConn.on('open', () => {
      dataConn.send({ type: 'user', message: name } as DataMessage);
    });

    dataConn.on('data', function(data: DataMessage) {
      if (data.type === 'user') {
        self.addUser(this.peer, data.message);
      }
    });
  }

  private addUser(
    id: string,
    name?: string,
    dataConnection?: PeerJs.DataConnection,
    mediaConnection?: PeerJs.MediaConnection,
    stream?: MediaStream
  ) {
    const existingUser = find(this._users, user => {
      return user.id === id;
    });

    if (existingUser) {
      if (name) {
        existingUser.name = name;
      }

      if (dataConnection) {
        existingUser.dataConnection = dataConnection;
      }

      if (mediaConnection) {
        existingUser.mediaConnection = mediaConnection;
      }

      if (stream) {
        existingUser.stream = stream;
      }
    } else {
      this._users.push({
        id,
        dataConnection,
        mediaConnection,
        stream,
        name
      });
    }

    if (name) {
      console.log(name + ' connected.');
    }

    this.users.next(this._users);
  }

  private removeUser(id: string) {
    const removedUsers = remove(this._users, user => {
      return user.id === id;
    });

    if (removedUsers.length > 0) {
      this.users.next(this._users);
    }
  }
}
