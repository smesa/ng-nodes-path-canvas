import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  ngAfterViewInit(): void {

    const SVG_NS = 'http://www.w3.org/2000/svg';

    const wrap = document.getElementById('wrap');
    const svg = document.getElementById('svg');

    const mainBox = wrap.getBoundingClientRect();
    console.log('MainBox', mainBox);

    const dots = Array.from(document.querySelectorAll(".dot"));
    console.log(dots);


    let points = [];
    let count = 0;

    dots.forEach(d => {

      d.addEventListener("click", (e) => {

        let bcr = d.getBoundingClientRect();

        const x = ((bcr.left - mainBox.left) + (bcr.width / 2)) * (100 / mainBox.width);
        const y = ((bcr.top - mainBox.top) + (bcr.height / 2)) * (100 / mainBox.height);

        points.push({ x, y })

        if (count % 2 == 1) {
          drawConnector(points[points.length - 1], points[points.length - 2])
        }

        count++;
      })
    })

    function drawConnector(a, b) {

      let path = document.createElementNS(SVG_NS, 'path');

      let d = `M${a.x},${a.y} C50,${a.y} 50 ${b.y} ${b.x} ${b.y}`;

      path.setAttributeNS(null, "d", d);
      path.classList.add('line');
      svg.appendChild(path)
    }

  }
}
