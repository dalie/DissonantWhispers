import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Session } from '../Session';
import { SessionsService } from '../sessions.service';
import { RtcService } from '../rtc.service';
@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.css']
})
export class ClientComponent implements OnInit, OnDestroy {
  session: Session;
  constructor(
    private _route: ActivatedRoute,
    private _sessionsService: SessionsService,
    private _rtcService: RtcService
  ) {}

  ngOnDestroy() {
    this._rtcService.destroy();
  }

  ngOnInit() {
    this.session = this._sessionsService.getSession(
      this._route.snapshot.params.session,
      this._route.snapshot.params.server
    );

    this._rtcService.localStream.subscribe(() => {
      this._rtcService.joinSession(this.session);
    });

    this._rtcService.getUserMedia();
  }
}
