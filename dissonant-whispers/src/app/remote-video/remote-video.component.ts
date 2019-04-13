import { Component, OnInit, Input, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-remote-video',
  templateUrl: './remote-video.component.html',
  styleUrls: ['./remote-video.component.css']
})
export class RemoteVideoComponent implements OnInit, AfterViewInit {
  @Input()
  mediaStream: MediaStream;

  @ViewChild('remoteVideoElement')
  remoteVideoElement: ElementRef<HTMLVideoElement>;

  constructor() {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.remoteVideoElement.nativeElement.srcObject = this.mediaStream;
  }
}
