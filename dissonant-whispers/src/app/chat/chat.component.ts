import { Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { RtcService } from '../rtc.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, AfterViewInit {
  @ViewChild('localVideoElement')
  localVideoElement: ElementRef<HTMLVideoElement>;

  remoteUsers: any;
  remoteStreams: MediaStream[];

  constructor(private _rtcService: RtcService) {}

  ngOnInit() {
    this.remoteUsers = this._rtcService.users;
  }

  ngAfterViewInit() {
    this.localVideoElement.nativeElement.volume = 0;
    this._rtcService.localStream.subscribe(stream => {
      this.localVideoElement.nativeElement.srcObject = stream;
    });
  }
}
