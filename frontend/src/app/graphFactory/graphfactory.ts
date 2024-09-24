import * as d3 from 'd3';
import { BoxPlotSettings } from '../model/graphSettings/boxplotSettings';
import { models } from '../model/models';
import { LogItem } from '../model/queryresponses/analModel/logItem';
import { lightYellow, medGrey, medYellow, plotBg, white } from '../utils/colors';
import { createAxis, getScatterplotLegendPosition, getSelectedColor } from './graphUtils';

export class GraphFactory {
  public svg: any;
  private margin = 30;
  public width
  public height
  public dots: any

  //axis
  public x: any;
  public y: any;

  // scatterplot
  private r: any

  //boxplot
  private bins: any

  constructor(width: number, height: number) {
    this.width = width - (this.margin * 1.5)
    this.height = height - (this.margin * 1.5)
  }

  public removeSvg(id: string): void {
    this.svg.selectAll("*").remove();  }

  public createSvg(id: string): void {
    this.svg = d3.select("figure#" + id)
    .append("svg")
    .attr("width", this.width + (this.margin * 1.5))
    .attr("height", this.height + (this.margin * 1.5))
    .append("g")
    //.attr("transform", "translate(" + this.margin + "," + this.margin + ")")
    .attr("transform", "translate(" + this.margin + "," + this.margin/2 + ")");
    //.attr("transform", "translate(" + this.margin +",)");
  }

  public createXAxis(type: string, domain: number[] | Date[], ticks: number, format: string) {
    if (type === "boxplot") {
      this.x = d3.scaleLinear()
      .domain(domain)
      .rangeRound([(this.margin), (this.width - (this.margin / 2))])
    } else this.x = createAxis(type, domain, [0, this.width])
  }

  public addXAxis(type: string, domain: number[] | Date[], ticks: number, format: string) {
      this.svg.append("g")
      .attr("transform", "translate(0," + this.height + ")")
      .style("stroke", white)
      .call(d3.axisBottom(this.x)
        .tickSize(-this.height)
        .ticks(ticks, format)
      )
      .select(".domain")
      .style("stroke",white);
  }

  public createYAxis(type: string, domain: number[], ticks: number) {
    if (type === "boxplot") {
      this.y = d3.scaleLinear()
      .domain(domain)
      .rangeRound([(this.margin), (this.height - (this.margin / 2))])
    } else this.y = createAxis(type, domain, [this.height, 0])
  }

  public addYAxis(type: string, domain: number[], ticks: number, format: string) {
    this.svg.append("g")
    .style("stroke", white)
    .call(d3.axisLeft(this.y)
      .tickSize(-this.width)
      .ticks(ticks, format)
    )
    .select(".domain")
    .style("stroke",white);
  }

  public colorGrid() {
    this.svg.selectAll(".tick line")
    .attr("stroke",medGrey);
  }

  public addXAxisTitle(value: string) {
    this.svg.append("text")
    .attr("text-anchor", "end")
    .attr("x", this.width)
    .attr("y", this.height + (this.margin / 2))
    .style("font", "10px sans-serif")
    .attr("fill", "#EEEEEE")
    .text(value);
  }

  public addYAxisTitle(value:string) {
    this.svg.append("text")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .attr("y", - (this.margin/2) )
    .attr("x", 0)
    .style("font", "10px sans-serif")
    .attr("fill", "#EEEEEE")
    .text(value)
  }

  // SCATTERPLOT

  public addColoredScatterplotDots(data: any, x_value: string, y_value:string) {

    this.dots = this.svg.append('g');
    this.dots.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", (d: any) => this.x(d[x_value]))
    .attr("cy",  (d: any) => this.y(d[y_value]))
    .attr("r", 1)
    .style("opacity", 1)
    .style("fill", (d:any) => getSelectedColor(d.selected));
  }

  public addColoredBackground() {
    this.svg.append("rect")
    .attr("x",0)
    .attr("y",0)
    .attr("height", this.height)
    .attr("width", this.width)
    .style("fill", plotBg)
  }

  public addRAxis(domain: number[], maxRay: number) {
    this.r = createAxis('linear', domain, [0, maxRay])
  }

  public addVariableScatterplotDots(
    data: any,
    x_value: string,
    y_value: string
  ) {
    this.dots = this.svg.append('g');
    this.dots.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", (d: any) => this.x(d[x_value]))
    .attr("cy",  (d: any) => this.y(d[y_value]))
    .attr("r", (d: any) => this.r(d.count))
    .style("opacity", 1)
    .style("fill", (d:any) => getSelectedColor(d.selected));
  }

  public addSimpleScatterplotDots(
    data: any,
    x_value: string,
    y_value: string,
    ray: number
  ) {
    this.dots = this.svg.append('g');
    this.dots.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", (d: any) => this.x(d[x_value]))
    .attr("cy",  (d: any) => this.y(d[y_value]))
    .attr("r", ray)
    .style("opacity", 1)
    .style("fill", medYellow)
  }

  public addScatterplotDimensionLegend() {
    const positionString = "translate(" + (this.width + this.margin/4) + "," + (this.height) + ")"

    const legend = this.svg.append("g")
      .attr("fill", "#EEEEEE")
      .attr("transform", positionString)
      .attr("text-anchor", "middle")
      .style("font", "6px sans-serif")
      .selectAll()
      .data(this.r.ticks(4))
      .join("g");

    legend.append("circle")
      .attr("fill", "none")
      .attr("stroke", "#EEEEEE")
      .attr("cy", (d: any) => - getScatterplotLegendPosition(this.r, 20, 4, d))
      .attr("r", this.r);

    legend.append("text")
      .attr("y", (d: any) => - getScatterplotLegendPosition(this.r, 20, 4, d))
      .attr("dy", "1.3em")
      .text(this.r.tickFormat(4, "s"));
  }

  getColor(model: string) {
    let realModels = models.slice(1)
    let colors = [ "#F8766D", "#00BA38", "#619CFF", "#8B8000"]
    for (let i = 0; i < realModels.length; i++) {
      if (model === realModels[i]) {
        return colors[i]
      }
    }
    return "all"
  }

  // BOXPLOT

  public setBins(catValue: string, ordValue: string, data: LogItem[], catTicks: number) {

    this.bins = d3.bin()
    .thresholds(catTicks)
    .value((d: any) => d[catValue])
    (data as any)
    .map((bin: any) => {
      bin.sort((a: any, b: any) => a[ordValue] - b[ordValue]);
      const values = bin.map((d: any) => d[ordValue]);
      const min = values[0];
      const max = values[values.length - 1];
      const q1 = d3.quantile(values, 0.25);
      const q2 = d3.quantile(values, 0.50);
      const q3 = d3.quantile(values, 0.75);
      const iqr = (q3 || 0) - (q1 || 0); // interquartile range
      const r0 = Math.max(min, (q1 || 0) - iqr * 1.5);
      const r1 = Math.min(max, (q3 || 0) + iqr * 1.5);
      bin.quartiles = [q1, q2, q3];
      bin.range = [r0, r1];
      bin.outliers = bin.filter((v : any) => v[ordValue] < r0 || v[ordValue] > r1); // TODO
      return bin;
    })
  }

  public drawBinsVertical(ordValue: BoxPlotSettings) {

    const g = this.svg.append("g")
      .selectAll("g")
      .data(this.bins)
      .join("g");

    //NOT CLICKABLE

    //horizontal top
    g.append("path")
      .attr("stroke", medYellow)
      .attr("stroke-width", 2)
      .attr("d", (d: any) => `
        M${this.x(d.x0 - 0.2)},${this.y((d.range[1]))}
        H${this.x((d.x0 + 0.2))}
      `);

    //horizontal bottom
    g.append("path")
      .attr("stroke", medYellow)
      .attr("stroke-width", 2)
      .attr("d", (d: any) => `
        M${this.x(d.x0 - 0.2)},${this.y((d.range[0]))}
        H${this.x((d.x0 + 0.2))}
      `);

    // Range.
    g.append("path")
        .attr("stroke", medYellow)
        .attr("stroke-width", 2)
        .attr("d", (d: any) => `
          M${this.x(d.x0)},${this.y(d.range[1])}
          V${this.y(d.range[0])}
        `);

    // Quartile 0.
    g.append("path")
        .attr("id", "0")
        .attr("fill", "transparent")
        .attr("d", (d: any) => `
          M${this.x(d.x0-0.2)},${this.y(d.range[0])}
          H${this.x(d.x0+0.2)}
          V${this.y(d.quartiles[0])}
          H${this.x(d.x0 -0.2)}
          Z
        `);

    // Quartile 1.
    g.append("path")
        .attr("id", "1")
        .attr("fill", lightYellow)
        .attr("d", (d: any) => `
          M${this.x(d.x0-0.2)},${this.y(d.quartiles[1])}
          H${this.x(d.x0+0.2)}
          V${this.y(d.quartiles[0])}
          H${this.x(d.x0 -0.2)}
          Z
        `);

    // Quartile 2.
    g.append("path")
        .attr("id", "2")
        .attr("fill", lightYellow)
        .attr("d", (d: any) => `
          M${this.x(d.x0-0.2)},${this.y(d.quartiles[1])}
          H${this.x(d.x0+0.2)}
          V${this.y(d.quartiles[2])}
          H${this.x(d.x0 -0.2)}
          Z
        `);

    // Quartile 3.
    g.append("path")
        .attr("id", "3")
        .attr("fill", "transparent")
        .attr("d", (d: any) => `
          M${this.x(d.x0-0.2)},${this.y(d.quartiles[2])}
          H${this.x(d.x0+0.2)}
          V${this.y(d.range[1])}
          H${this.x(d.x0 -0.2)}
          Z
        `);

    // Median.
    g.append("path")
        .attr("stroke", medYellow)
        .attr("stroke-width", 2)
        .attr("d", (d: any) => `
          M${this.x(d.x0-0.2)},${this.y(d.quartiles[1])}
          H${this.x(d.x0+0.2)}
        `);

    // Outliers, with a bit of jitter.
    g.append("g")
        .attr("fill", medYellow)
        .attr("fill-opacity", 0.2)
        .attr("stroke", "none")
        .attr("transform", (d: any) => `translate(${this.x(d.x0)},0)`)
      .selectAll("circle")
      .data((d: any) => d.outliers)
      .join("circle")
        .attr("r", 2)
        .attr("cx", () => (Math.random() - 0.5) * 4)
        .attr("cy", (d: any) => this.y(d[ordValue.value]));
  }

  public drawBinsHorizontal(ordValue: BoxPlotSettings) {

    const g = this.svg.append("g")
      .selectAll("g")
      .data(this.bins)
      .join("g");

    //NOT CLICKABLE

    //vertical left
    g.append("path")
      .attr("stroke", medYellow)
      .attr("stroke-width", 3)
      .attr("d", (d: any) => `
        M${this.x(d.range[0])},${this.y((d.x0 - 0.2))}
        V${this.y((d.x0 + 0.2))}
      `);

    //vertical right
    g.append("path")
      .attr("stroke", medYellow)
      .attr("stroke-width", 3)
      .attr("d", (d: any) => `
        M${this.x(d.range[1])},${this.y((d.x0 - 0.2))}
        V${this.y(d.x0 + 0.2)}
      `);

    //range
    g.append("path")
    .attr("stroke", medYellow)
    .attr("stroke-width", 3)
    .attr("d", (d: any) => `
      M${this.x(d.range[0])},${this.y((d.x0))}
      H${this.x(d.range[1])}
    `);

    // Quartile 0
    g.append("path")
        .attr("id", "0")
        .attr("fill", "transparent")
        .attr("d", (d: any) => `
          M${this.x(d.quartiles[0])}, ${this.y(d.x0 - 0.3)}
          V${this.y(d.x0 + 0.3)}
          H${this.x(d.range[0])}
          V${this.y(d.x0 - 0.3)}
          Z
        `);

    // Quartile 1
    g.append("path")
      .attr("fill", lightYellow)
      .attr("id", "1")
      .attr("d", (d: any) => `
        M${this.x(d.quartiles[0])}, ${this.y(d.x0 - 0.3)}
        V${this.y(d.x0 + 0.3)}
        H${this.x(d.quartiles[1])}
        V${this.y(d.x0 - 0.3)}
        Z
      `);

    // Quartile 2
    g.append("path")
      .attr("fill", lightYellow)
      .attr("id", "2")
      .attr("d", (d: any) => `
        M${this.x(d.quartiles[1])}, ${this.y(d.x0 - 0.3)}
        V${this.y(d.x0 + 0.3)}
        H${this.x(d.quartiles[2])}
        V${this.y(d.x0 - 0.3)}
        Z
      `);

    // Quartile 3
    g.append("path")
      .attr("id", "3")
      .attr("fill", "transparent")
      .attr("d", (d: any) => `
        M${this.x(d.range[1])}, ${this.y(d.x0 - 0.3)}
        V${this.y(d.x0 + 0.3)}
        H${this.x(d.quartiles[2])}
        V${this.y(d.x0 - 0.3)}
        Z
      `);

    // Median.
    g.append("path")
        .attr("stroke", medYellow)
        .attr("stroke-width", 3)
        .attr("d", (d: any) => `
          M${this.x(d.quartiles[1])},${this.y(d.x0 - 0.3)}
          V${this.y(d.x0 + 0.3)}
        `);

    // Outliers, with a bit of jitter.
    g.append("g")
        .attr("fill", medYellow)
        .attr("fill-opacity", 0.2)
        .attr("stroke", "none")
        .attr("transform", (d: any) => `translate(${this.y((d.x0 + d.x1) / 2)},0)`)
      .selectAll("circle")
      .data((d: any) => d.outliers)
      .join("circle")
        .attr("r", 2)
        .attr("cx", () => (Math.random() - 0.5) * 4)
        .attr("cy", (d: any) => this.x(d[ordValue.value]));
  }

  public createTokensBPXAxis(type: string, domain: number[] | Date[], ticks: number, format: string) {
    this.x = d3.scaleLinear()
    .domain(domain)
    .rangeRound([0, this.width])
  }

  public addTokensBPXAxis(type: string, domain: number[] | Date[], ticks: number, format: string) {
      this.svg.append("g")
      .attr("transform", "translate(0," + this.height + ")")
      .style("stroke", white)
      .call(d3.axisBottom(this.x)
        .tickSize(-this.height)
        .ticks(ticks, format)
      )
      .select(".domain")
      .style("stroke",white);
  }

  public createTokensBPYAxis(type: string, domain: number[], ticks: number) {
    this.y = d3.scaleLinear()
    .domain(domain)
    .rangeRound([this.height, 0])
  }

  public addTokensBPYAxis(type: string, domain: number[], ticks: number, format: string) {
    this.svg.append("g")
    .style("stroke", white)
    .call(d3.axisLeft(this.y)
      .tickSize(-this.width)
      .ticks(ticks, format)
    )
    .select(".domain")
    .style("stroke",white);
  }

  public createWliBPXAxis(type: string, domain: number[] | Date[], ticks: number, format: string) {
    this.x = d3.scaleLinear()
    .domain(domain)
    .rangeRound([0, this.width])
  }

  public addWliBPXAxis(type: string, domain: number[] | Date[], ticks: number, format: string) {
    this.svg.append("g")
    .attr("transform", "translate(0," + this.height + ")")
    .style("stroke", white)
    .call(d3.axisBottom(this.x)
      .tickSize(-this.height)
      .ticks(ticks, format)
    )
    .select(".domain")
    .style("stroke",white);
  }

  public createWliBPYAxis(type: string, domain: number[], ticks: number) {
    this.y = d3.scaleLinear()
    .domain(domain)
    .range([this.height, 0])
  }

  public addWliBPYAxis(type: string, domain: number[], ticks: number, format: string) {
    this.svg.append("g")
    .style("stroke",white)
    .call(d3.axisLeft(this.y)
      .tickSize(-this.width)
      .ticks(ticks, format)
    )
    .select(".domain")
    .style("stroke",white)
    ;
  }
}
