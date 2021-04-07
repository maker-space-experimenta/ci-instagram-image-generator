import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Project, Path } from 'paper';
import * as paper from 'paper';
import { Group, Point, Raster, Size } from 'paper/dist/paper-core';
import { ParsedProperty } from '@angular/compiler';
import { ImageCroppedEvent } from 'ngx-image-cropper';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = 'makerspace-watermark';

  @ViewChild('myCanvas') canvas: ElementRef<HTMLCanvasElement>;
  private cx: CanvasRenderingContext2D;
  private img: HTMLImageElement;

  private paperProject: paper.Project;
  private group: paper.Group;
  private raster: paper.Raster;
  private msLogo: any;



  constructor() { }

  public ngAfterViewInit() {
    window['paper'] = paper;


    console.log("init");
    console.log("screen width: " + window.innerWidth);

    this.paperProject = new Project("myCanvas");

    let border_witdth = parseFloat(getComputedStyle(document.documentElement).fontSize) * 1.2;
    let scale = (window.innerWidth - (2 * border_witdth)) / 1080;
    this.canvas.nativeElement.style.transform = "scale(" + scale.toString() + ")";


    const path = new Path.Circle({
      center: [0, 0],
      radius: 1080,
      strokeColor: 'black'
    });

    this.paperProject.importSVG("/assets/maker-space.svg", (item) => {
      this.msLogo = item;
      this.msLogo.scale(0.75)
      this.msLogo.position = new paper.Point((1080 / 2), 50)
    });

  }

  public download(e: any) {
    this.canvas.nativeElement.toBlob((blob) => {
      const anchor = document.createElement('a');
      anchor.download = 'my-file-name.jpg'; // optional, but you can give the file a name
      anchor.href = URL.createObjectURL(blob);
      anchor.click();
      URL.revokeObjectURL(anchor.href);
    },
      'image/jpeg',
      0.9)
  }

  imageChangedEvent: any = '';
  croppedImage: any = '';

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
  }
  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;

    this.raster = new Raster({
      source: this.croppedImage,
      position: this.paperProject.view.center,
      project: this.paperProject,
      size: new Size(1080, 1080)
    });

    // this.raster.sendToBack();
    this.msLogo.bringToFront();
  }
}