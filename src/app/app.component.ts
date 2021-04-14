import { Component } from '@angular/core';
import { ElementRef } from '@angular/core';
import { OnInit } from '@angular/core';
import { fromEvent } from 'rxjs';

type pathModel = {
  pathId?: string,
  nodeInit?: string,
  nodeEnd?: string,
  inProcess?: boolean,
  nodePositionInit?: any,
  nodePositionEnd?: any
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent  implements OnInit {

  SVG_NS = 'http://www.w3.org/2000/svg';
  mainBox: any;
  wrap: any;
  svg: any;

  mousemove$: any;
  mousePosition = {
    x: 0,
    y: 0
  };

  nodeList = [
    {
      id: 'box1',
      top: 300,
      left: 200,
    },
    {
      id: 'box2',
      top: 300,
      left: 800,
    },
    {
      id: 'box3',
      top: 600,
      left: 800,
    }
  ];

  paths: pathModel[] = [];

  constructor(
    private _el: ElementRef
  ) { }

  ngOnInit() {
    this.initMouseTracking();
  }

  initMouseTracking() {
    this.mousemove$ = fromEvent(this._el.nativeElement, 'mousemove');
    this.mousemove$.subscribe((e) => {
      this.mousePosition.x = e.x;
      this.mousePosition.y = e.y;
      this.validateIfPathCreateIsActive();
    });
  }

  validateIfPathCreateIsActive() {

    const pathsActive = this.paths.filter(path => path.inProcess === true);

    if (pathsActive.length > 0) {

      const firstPath = pathsActive[0];
      const indexOfPaths = this.paths.indexOf(firstPath);

      const x = ((this.mousePosition.x - this.mainBox.left) + (2 / 2)) * (100 / this.mainBox.width);
      const y = ((this.mousePosition.y - this.mainBox.top) + (2 / 2)) * (100 / this.mainBox.height);

      this.paths[indexOfPaths] = {
        ...this.paths[indexOfPaths],
        nodePositionEnd: {x,y}
      }

      const nodePositionInit = this.paths[indexOfPaths].nodePositionInit;
      const nodePositionEnd = this.paths[indexOfPaths].nodePositionEnd;

      this.drawConnector(nodePositionInit, nodePositionEnd, this.paths[indexOfPaths].pathId);

    }
  }

  ngAfterViewInit(): void {
    this.wrap = document.getElementById('wrap');
    this.svg = document.getElementById('svg');
    this.mainBox = this.wrap.getBoundingClientRect();
  }

  drawConnector(from, to, pathId) {

    const existPath = document.getElementById(pathId);
    const lineDraw = `M${from.x},${from.y} C50,${from.y} 50 ${to.y} ${to.x} ${to.y}`;

    if (existPath) {
      existPath.setAttributeNS(null, "d", lineDraw);
    } else {
      const newPath = document.createElementNS(this.SVG_NS, 'path');
      newPath.setAttributeNS(null, "d", lineDraw);
      newPath.setAttribute('id', pathId);
      newPath.classList.add('line');
      this.svg.appendChild(newPath)
    }

  }

  dragBoxNodeDraw(elementId) {

    const pressNodeId = elementId;
    const pathsInit = this.paths.filter(path => path.nodeInit === pressNodeId);

    pathsInit.forEach((path) => {

      const pressNode = document.getElementById(`dot-right-${pressNodeId}`);
      const dataPosNode = pressNode.getBoundingClientRect();

      const x = ((dataPosNode.left - this.mainBox.left) + (dataPosNode.width / 2)) * (100 / this.mainBox.width);
      const y = ((dataPosNode.top - this.mainBox.top) + (dataPosNode.height / 2)) * (100 / this.mainBox.height);

      const indexOfPaths = this.paths.indexOf(path);

      this.paths[indexOfPaths] = {
        ...this.paths[indexOfPaths],
        nodePositionInit: { x, y }
      }

      const nodePositionInit = this.paths[indexOfPaths].nodePositionInit;
      const nodePositionEnd = this.paths[indexOfPaths].nodePositionEnd;
      this.drawConnector(nodePositionInit, nodePositionEnd, this.paths[indexOfPaths].pathId);

    });

    const pathsEnds = this.paths.filter(path => path.nodeEnd === pressNodeId);

    pathsEnds.forEach((path) => {

      const pressNode = document.getElementById(`dot-left-${pressNodeId}`);
      const dataPosNode = pressNode.getBoundingClientRect();

      const x = ((dataPosNode.left - this.mainBox.left) + (dataPosNode.width / 2)) * (100 / this.mainBox.width);
      const y = ((dataPosNode.top - this.mainBox.top) + (dataPosNode.height / 2)) * (100 / this.mainBox.height);

      const indexOfPaths = this.paths.indexOf(path);

      this.paths[indexOfPaths] = {
        ...this.paths[indexOfPaths],
        nodePositionEnd: { x, y }
      }

      const nodePositionInit = this.paths[indexOfPaths].nodePositionInit;
      const nodePositionEnd = this.paths[indexOfPaths].nodePositionEnd;

      this.drawConnector(nodePositionInit, nodePositionEnd, this.paths[indexOfPaths].pathId);

    });


  }

  moveNodeDrag(event) {

    const mousemove$ = fromEvent(this._el.nativeElement, 'mousemove');
    const mouseup$ = fromEvent(this._el.nativeElement, 'mouseup');
    const mousedown$ = fromEvent(this._el.nativeElement, 'mousedown');

    let sub: any;

    mousedown$.subscribe((e) => {
      sub = mousemove$.subscribe((e) => {
        const nodeId = event.srcElement.parentNode.parentNode.id;
        this.dragBoxNodeDraw(nodeId);
      })
    });

    mouseup$.subscribe((e) => {
      sub.unsubscribe();
    });

  }

  createPath(event, node, type) {
    if (type === 'init') {
      this.initPathCreate(event, node);
    } else {
      this.endPathCreate(event, node);
    }
  }

  initPathCreate(event, node) {

    const pressNode   = document.getElementById(event.srcElement.id);
    const dataPosNode = pressNode.getBoundingClientRect();
    const x = ((dataPosNode.left - this.mainBox.left) + (dataPosNode.width / 2)) * (100 / this.mainBox.width);
    const y = ((dataPosNode.top - this.mainBox.top) + (dataPosNode.height / 2)) * (100 / this.mainBox.height);

    const pathId = `path-${node.id}-${this.paths.filter(path => path.nodeInit === node.id).length + 1}`;

    const newPath = {
      pathId,
      nodeInit: node.id,
      nodeEnd: null,
      inProcess: true,
      nodePositionInit: { x, y },
      nodePositionEnd: null
    };

    this.paths = [...this.paths, newPath];
  }

  endPathCreate(event, node) {

    const activePath = this.paths.filter(path => path.inProcess === true)[0];
    const indexOfPaths = this.paths.indexOf(activePath);

    const pressNode   = document.getElementById(event.srcElement.id);
    const dataPosNode = pressNode.getBoundingClientRect();
    const x = ((dataPosNode.left - this.mainBox.left) + (dataPosNode.width / 2)) * (100 / this.mainBox.width);
    const y = ((dataPosNode.top - this.mainBox.top) + (dataPosNode.height / 2)) * (100 / this.mainBox.height);

    this.paths[indexOfPaths] = {
      ...this.paths[indexOfPaths],
      nodeEnd: node.id,
      inProcess: false,
      nodePositionEnd: {x,y}
    }

    const nodePositionInit = this.paths[indexOfPaths].nodePositionInit;
    const nodePositionEnd = this.paths[indexOfPaths].nodePositionEnd;
    this.drawConnector(nodePositionInit, nodePositionEnd, this.paths[indexOfPaths].pathId);

  }

}
