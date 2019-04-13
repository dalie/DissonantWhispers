import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SessionsService } from '../sessions.service';
import { Session } from '../Session';
import { RtcService } from '../rtc.service';
declare var Peer: any;
@Component({
  selector: 'app-host',
  templateUrl: './host.component.html',
  styleUrls: ['./host.component.css']
})
export class HostComponent implements OnInit {
  private _localStream: MediaStream;
  session: Session;

  constructor(
    private _route: ActivatedRoute,
    private _sessionsService: SessionsService,
    private _rtcService: RtcService
  ) {}

  ngOnInit() {
    this.session = this._sessionsService.getSession(
      this._route.snapshot.params.session,
      this._route.snapshot.params.server
    );
    this._rtcService.getUserMedia();
    this._rtcService.localStream.subscribe(stream => {
      this._localStream = stream;
    });

    const connection = new Peer(`host_${this.session.name}`, {
      host: this.session.server,
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
    });
  }
}
