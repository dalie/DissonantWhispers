import { Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { RtcService } from '../rtc.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, AfterViewInit {
  @ViewChild('localVideoElement')
  localVideoElement: ElementRef<HTMLVideoElement>;

  remoteMediaTracks: MediaStreamTrack[] = [];

  constructor(private _rtcService: RtcService) {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.localVideoElement.nativeElement.volume = 0;
    this._rtcService.localStream.subscribe(stream => {
      this.localVideoElement.nativeElement.srcObject = stream;
    });

    this._rtcService.remoteMeadiTracks.subscribe(tracks => {
      this.remoteMediaTracks = tracks;
    });
  }
}
