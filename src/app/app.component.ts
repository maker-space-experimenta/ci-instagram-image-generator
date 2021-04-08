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
  debug = true;

  @ViewChild('myCanvas') canvas: ElementRef<HTMLCanvasElement>;
  private cx: CanvasRenderingContext2D;
  private img: HTMLImageElement;

  private paperProject: paper.Project;
  private group: paper.Group;
  private raster: paper.Raster;
  private msLogo: any;

  private distance_initial = 0;
  public distance = 0;
  public distance_diff = 0;
  public distance_started = false;
  private touchMoveTick = 0;

  private drag_start_x = 0;
  private drag_start_y = 0;
  public move_x = 0;
  public move_y = 0;

  countTouches: number = 0;




  constructor() { }

  public ngAfterViewInit() {

    document.body.addEventListener('touchstart', (e) => { this.touchStart(e); }, false);
    document.body.addEventListener('touchmove', (e) => { this.touchMove(e); }, false);
    document.body.addEventListener('touchend', (e) => { this.touchEnd(e); }, false);

    window['paper'] = paper;

    console.log("init");
    console.log("screen width: " + window.innerWidth);

    this.paperProject = new Project("myCanvas");

    let border_witdth = parseFloat(getComputedStyle(document.documentElement).fontSize) * 1.2;
    let scale = (window.innerWidth - (2 * border_witdth)) / 1080;
    this.canvas.nativeElement.style.transform = "scale(" + scale.toString() + ")";

    this.paperProject.importSVG("/assets/maker-space.svg", (item) => {
      this.msLogo = item;
      this.msLogo.scale(0.75)
      this.msLogo.position = new paper.Point((1080 / 2), 50)
    });

  }

  public render() {


    this.raster.scale(this.distance_diff);

    this.msLogo.bringToFront();

    this.distance_diff = 1;
  }


  public touchStart(event) {
    if (event.target.id == "myCanvas") {
      console.log(event);
      this.countTouches++;
    }
  }


  public touchMove(event) {
    console.log(event);
    this.touchMoveTick++;
    if (event.target.id == "myCanvas") {

      if (event.touches.length > 1) {
        let distance_x = Math.abs(event.touches[0].clientX - event.touches[1].clientX);
        let distance_y = Math.abs(event.touches[0].clientY - event.touches[1].clientY);
        this.distance = Math.sqrt((distance_y * distance_y) + (distance_x + distance_x));

        if (!this.distance_started) {
          this.distance_started = true;
          this.distance_initial = this.distance;
        }

        this.distance_diff = 1 + ((this.distance - this.distance_initial) / 1000);
      } else {

        if (!this.distance_started) {
          this.distance_started = true;
          this.drag_start_x = event.touches[0].clientX;
          this.drag_start_y = event.touches[0].clientY;
        }

        this.move_x = this.drag_start_x - event.touches[0].clientX;
        this.move_y = this.drag_start_y - event.touches[0].clientY;

        this.raster.position.x = this.raster.position.x + this.move_x;
        this.raster.position.y = this.raster.position.y + this.move_y;

        this.distance_diff = 1 + ((this.distance - this.distance_initial) / 1000);
      }

      this.render();
    }
  }

  public touchEnd(event) {
    if (event.target.id == "myCanvas") {
      console.log(event);
      this.countTouches--;
    }

    this.distance_started = false;
    this.countTouches = 0;
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

  // imageChangedEvent: any = '';
  // croppedImage: any = '';

  fileChangeEvent(event: any): void {

    console.log(event.target.files);

    if (event.target.files && event.target.files[0]) {

      let fileReader = new FileReader();

      fileReader.addEventListener("load", (e) => {
        let img = e.target.result;

        console.log(img);

        this.raster = new Raster({
          source: img,
          position: this.paperProject.view.center,
          project: this.paperProject,
          size: new Size(1080, 1080)
        });
      });

      fileReader.readAsDataURL(event.target.files[0]);

      this.render();
    }

  }
}