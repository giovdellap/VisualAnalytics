import * as d3 from 'd3';
import { BoxPlotSettings } from '../model/graphSettings/boxplotSettings';
import { models } from '../model/models';
import { LogItem } from '../model/queryresponses/analModel/logItem';
import { createAxis, getScatterplotLegendPosition } from './graphUtils';

export class GraphFactory {
  public svg: any;
  private margin = 30;
  private width
  private height

  //axis
  private x: any;
  private y: any;

  // scatterplot
  private r: any

  //boxplot
  private bins: any

  constructor(width: number, height: number) {
    this.width = width - (this.margin * 2)
    this.height = height - (this.margin * 2)
  }

  public removeSvg(id: string): void {
    this.svg.selectAll("*").remove();  }

  public createSvg(id: string): void {
    this.svg = d3.select("figure#" + id)
    .append("svg")
    .attr("width", this.width + (this.margin * 2))
    .attr("height", this.height + (this.margin * 2))
    .append("g")
    .attr("transform", "translate(" + this.margin + "," + this.margin + ")")
    //.attr("transform", "translate(" + this.margin/2 + "," + this.margin/2 + ")");

  }

  public createXAxis(type: string, domain: number[] | Date[], ticks: number, format: string) {
    if (type === "boxplot") {
      this.x = d3.scaleLinear()
      .domain(domain)
      .rangeRound([(this.margin), (this.width - this.margin)])
    } else this.x = createAxis(type, domain, [0, this.width])
  }
  
  public addXAxis(type: string, domain: number[] | Date[], ticks: number, format: string) {
      this.svg.append("g")
      .attr("transform", "translate(0," + this.height + ")")
      .call(d3.axisBottom(this.x)
        .tickSize(-this.height)
        .ticks(ticks, format)
      );

  }

  public createYAxis(type: string, domain: number[], ticks: number) {
    if (type === "boxplot") {
      this.y = d3.scaleLinear()
      .domain(domain)
      .rangeRound([(this.margin), (this.height - this.margin)])
    } else this.y = createAxis(type, domain, [this.height, 0])
  }

  public addYAxis(type: string, domain: number[], ticks: number, format: string) {
    this.svg.append("g")
    .call(d3.axisLeft(this.y)
      .tickSize(-this.width)
      .ticks(ticks, format)
    );
  }

  public colorGrid() {
    this.svg.selectAll(".tick line")
    .attr("stroke","#C7C7C7");
  }

  public addXAxisTitle(value: string) {
    this.svg.append("text")
    .attr("text-anchor", "end")
    .attr("x", this.width)
    .attr("y", this.height + (this.margin / 2))
    .style("font", "10px sans-serif")
    .text(value);
  }

  public addYAxisTitle(value:string) {
    this.svg.append("text")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .attr("y", - (this.margin/2) )
    .attr("x", 0)
    .style("font", "10px sans-serif")
    .text(value)
  }

  // SCATTERPLOT

  public addColoredScatterplotDots(data: any, x_value: string, y_value:string) {

    const dots = this.svg.append('g');
    dots.selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", (d: any) => this.x(d[x_value]))
    .attr("cy",  (d: any) => this.y(d[y_value]))
    .attr("r", 1)
    .style("opacity", 1)
    .style("fill", (d:any) => {
      if (d.selected) {
        return "#fa2a23"
      } else return "#69b3a2"
    });
  }

  public addColoredBackground() {
    this.svg.append("rect")
    .attr("x",0)
    .attr("y",0)
    .attr("height", this.height)
    .attr("width", this.width)
    .style("fill", "#9cb8f0")
  }

  public addRAxis(domain: number[], maxRay: number) {
    this.r = createAxis('linear', domain, [0, maxRay])
  }

  public addVariableScatterplotDots(
    data: any,
    x_value: string,
    y_value: string
  ) {
    const dots = this.svg.append('g');
    dots.selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", (d: any) => this.x(d[x_value]))
    .attr("cy",  (d: any) => this.y(d[y_value]))
    .attr("r", (d: any) => this.r(d.count))
    .style("opacity", 1)
    .style("fill", "#69b3a2")
  }

  public addSimpleScatterplotDots(
    data: any,
    x_value: string,
    y_value: string,
    ray: number
  ) {
    const dots = this.svg.append('g');
    dots.selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", (d: any) => this.x(d[x_value]))
    .attr("cy",  (d: any) => this.y(d[y_value]))
    .attr("r", ray)
    .style("opacity", 1)
    .style("fill", "#69b3a2")
  }

  public addScatterplotDimensionLegend() {
    const positionString = "translate(" + (this.width + this.margin/2) + "," + (this.height) + ")"

    const legend = this.svg.append("g")
      .attr("fill", "#777")
      .attr("transform", positionString)
      .attr("text-anchor", "middle")
      .style("font", "6px sans-serif")
      .selectAll()
      .data(this.r.ticks(4))
      .join("g");

    legend.append("circle")
      .attr("fill", "none")
      .attr("stroke", "#ccc")
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
    console.log(ordValue, this.bins)
  }

  public drawBinsVertical(ordValue: BoxPlotSettings) {

    const g = this.svg.append("g")
      .selectAll("g")
      .data(this.bins)
      .join("g");
  
    // Range.
    g.append("path")
        .attr("stroke", "currentColor")
        .attr("d", (d: any) => `
          M${this.x(d.x0)},${this.y(d.range[1])}
          V${this.y(d.range[0])}
        `);
  
    // Quartiles.
    g.append("path")
        .attr("fill", "#ddd")
        .attr("d", (d: any) => `
          M${this.x(d.x0-0.2)},${this.y(d.quartiles[2])}
          H${this.x(d.x0+0.2)}
          V${this.y(d.quartiles[0])}
          H${this.x(d.x0 -0.2)}
          Z
        `);
  
    // Median.
    g.append("path")
        .attr("stroke", "currentColor")
        .attr("stroke-width", 2)
        .attr("d", (d: any) => `
          M${this.x(d.x0-0.2)},${this.y(d.quartiles[1])}
          H${this.x(d.x0+0.2)}
        `);
  
    // Outliers, with a bit of jitter.
    g.append("g")
        .attr("fill", "currentColor")
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
  
    // Range.
    g.append("path")
        .attr("stroke", "currentColor")
        .attr("d", (d: any) => `
          M${this.x(d.range[1])},${this.y((d.x0))}
          H${this.x(d.range[0])}
        `);
  
    // Quartiles.
    g.append("path")
        .attr("fill", "#ddd")
        .attr("d", (d: any) => `
          M${this.x(d.quartiles[2])}, ${this.y(d.x0 - 0.2)}
          V${this.y(d.x0 + 0.3)}
          H${this.x(d.quartiles[0])}
          V${this.y(d.x0 - 0.3)}
          Z
        `);
  
    // Median.
    g.append("path")
        .attr("stroke", "currentColor")
        .attr("stroke-width", 2)
        .attr("d", (d: any) => `
          M${this.x(d.quartiles[1])},${this.y(d.x0 - 0.3)}
          V${this.y(d.x0 + 0.3)}
        `);
  
    // Outliers, with a bit of jitter.
    g.append("g")
        .attr("fill", "currentColor")
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
      .call(d3.axisBottom(this.x)
        .tickSize(-this.height)
        .ticks(ticks, format)
      );

  }

  public createTokensBPYAxis(type: string, domain: number[], ticks: number) {
    this.y = d3.scaleLinear()
    .domain(domain)
    .rangeRound([this.height, 0])
  }

  public addTokensBPYAxis(type: string, domain: number[], ticks: number, format: string) {
    this.svg.append("g")
    .call(d3.axisLeft(this.y)
      .tickSize(-this.width)
      .ticks(ticks, format)
    );
  }

  public createWliBPXAxis(type: string, domain: number[] | Date[], ticks: number, format: string) {
    this.x = d3.scaleLinear()
    .domain(domain)
    .rangeRound([0, this.width])
  }
  
  public addWliBPXAxis(type: string, domain: number[] | Date[], ticks: number, format: string) {
    this.svg.append("g")
    .attr("transform", "translate(0," + this.height + ")")
    .call(d3.axisBottom(this.x)
      .tickSize(-this.height)
      .ticks(ticks, format)
    );
  }

  public createWliBPYAxis(type: string, domain: number[], ticks: number) {
    this.y = d3.scaleLinear()
    .domain(domain)
    .range([this.height, 0])  
  }

  public addWliBPYAxis(type: string, domain: number[], ticks: number, format: string) {
    this.svg.append("g")
    .call(d3.axisLeft(this.y)
      .tickSize(-this.width)
      .ticks(ticks, format)
    );
  }
}