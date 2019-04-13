import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Session } from './Session';
import { Player } from './Player';
import * as Peer from 'peerjs';

@Injectable({
  providedIn: 'root'
})
export class RtcService {
  private _localStream: MediaStream;
  private _localPeerConnection: RTCPeerConnection;
  private _remoteTracks: MediaStreamTrack[] = [];

  localStream = new Subject<MediaStream>();
  remoteMeadiTracks = new Subject<MediaStreamTrack[]>();

  constructor() {}

  start(player: Player, session: Session) {
    const peer = new Peer(player.id, {
      host: session.server
    });

    const connection = peer.connect('dom');
  }

  getUserMedia() {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(mediaStream => {
      this.localStream.next(mediaStream);
    });
  }
}
