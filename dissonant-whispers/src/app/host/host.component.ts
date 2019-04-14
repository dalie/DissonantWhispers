import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SessionsService } from '../sessions.service';
import { Session } from '../Session';
import { RtcService } from '../rtc.service';

@Component({
  selector: 'app-host',
  templateUrl: './host.component.html',
  styleUrls: ['./host.component.css']
})
export class HostComponent implements OnInit, OnDestroy {
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
    this._rtcService.getUserMedia();

    this._rtcService.hostSession(this.session);
  }
}
