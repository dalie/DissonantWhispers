import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Session } from './Session';
import { Player } from './Player';
import * as Peer from 'peerjs';

@Injectable({
  providedIn: 'root'
})
export class RtcService {
  private _remoteStreams: MediaStream[] = [];

  localStream = new Subject<MediaStream>();
  remoteStreams = new Subject<MediaStream[]>();

  constructor() {}

  getUserMedia() {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(mediaStream => {
      this.localStream.next(mediaStream);
    });
  }

  addRemoteStream(stream) {
    if (this._remoteStreams.indexOf(stream) < 0) {
      this._remoteStreams.push(stream);
      this.remoteStreams.next(this._remoteStreams);
    }
  }
}
