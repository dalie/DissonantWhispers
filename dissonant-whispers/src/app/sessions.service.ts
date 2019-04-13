import { Injectable } from '@angular/core';
import { Session } from './Session';

@Injectable({
  providedIn: 'root'
})
export class SessionsService {
  constructor() {}

  getSessions(): string[] {
    return JSON.parse(localStorage.getItem('sessions'));
  }

  getServers(): string[] {
    return JSON.parse(localStorage.getItem('servers'));
  }

  getSession(sessionName: string, serverURL?: string): Session {
    if (localStorage.getItem('sessions.' + sessionName)) {
      return JSON.parse(localStorage.getItem('sessions.' + sessionName));
    } else {
      const session: Session = {
        server: serverURL,
        name: sessionName,
        players: []
      };

      localStorage.setItem('sessions.' + sessionName, JSON.stringify(session));

      let sessions: string[] = [];
      if (localStorage.getItem('sessions')) {
        sessions = JSON.parse(localStorage.getItem('sessions'));
      }
      sessions.push(sessionName);

      localStorage.setItem('sessions', JSON.stringify(sessions));

      const servers: string[] = JSON.parse(localStorage.getItem('servers')) || [];
      if (servers.indexOf(serverURL) < 0) {
        servers.push(serverURL);
        localStorage.setItem('servers', JSON.stringify(servers));
      }

      return session;
    }
  }
}
