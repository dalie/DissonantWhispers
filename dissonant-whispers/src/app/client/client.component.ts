import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Session } from '../Session';
import { SessionsService } from '../sessions.service';
import { RtcService } from '../rtc.service';
declare var Peer: any;
@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.css']
})
export class ClientComponent implements OnInit {
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
    const connection = new Peer(null, {
      host: this.session.server,
      key: 'peerjs',
      path: 'myapp',
      port: 9000
    });

    connection.on('error', e => {
      console.log(e);
    });

    this._rtcService.localStream.subscribe(stream => {
      const mediaConn = connection.call(`host_${this.session.name}`, stream);
      mediaConn.on('stream', () => {
        console.log('received stream');
      });
    });
    this._rtcService.getUserMedia();

    setTimeout(() => {
      const dataConn = connection.connect(`host_${this.session.name}`);

      dataConn.on('data', data => {
        console.log(data);
      });
    }, 2000);
  }
}
