import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { SessionsService } from '../sessions.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  serverSessionInput = new FormControl('');
  hostSessionInput = new FormControl('');
  joinSessionInput = new FormControl('');
  servers: string[];
  sessions: string[];

  constructor(private _router: Router, private _sessionsService: SessionsService) {}

  ngOnInit() {
    this.servers = this._sessionsService.getServers();
    this.sessions = this._sessionsService.getSessions();
  }

  hostSession() {
    this._router.navigate(['/host', { session: this.hostSessionInput.value, server: this.serverSessionInput.value }]);
  }

  hostExistingSession(sessionName) {
    const session = this._sessionsService.getSession(sessionName);
    this._router.navigate(['/host', { session: session.name, server: session.server }]);
  }
}
