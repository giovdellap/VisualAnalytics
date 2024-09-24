import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import * as d3 from 'd3';
import { BehaviorSubject, Observable } from 'rxjs';
import * as Pca from "../../../assets/js/pca";
import { GraphFactory } from '../../graphFactory/graphfactory';
import { getMaxCount, getRequestObjects } from '../../graphFactory/graphUtils';
import { pcaLoadingTimeSettings, simpleLoadingTimeSettings, XAxisLoadingTime } from '../../model/graphSettings/xaxisloadingtime';
import { RequestItem } from '../../model/queryresponses/analModel/requestItems';
import { BasicRequestQueryItem } from '../../model/queryresponses/basicRequestQueryItem';
import { ApiService } from '../../services/api.service';
import { ResolutionService } from '../../services/resolution.service';
import { requestScatterplotInsights } from '../../utils/insights';



@Component({
  selector: 'app-loadtime',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatSelectModule,
    ReactiveFormsModule,
    CommonModule,
    MatCardModule,
    MatRadioModule
  ],
  templateUrl: './loadtime.component.html',
  styleUrl: './loadtime.component.css'
})
export class LoadtimeComponent {

  data: RequestItem[] = []

  topFactory: GraphFactory
  bottomFactory: GraphFactory
  pcaFactory: GraphFactory

  optionControl = new FormControl()
  countOption = "stream_messages"
  options: string[] = ['total_tokens', 'input_tokens', 'stream_messages', 'input_dimension']

  insights: string[] = requestScatterplotInsights
  insightEmitter = new BehaviorSubject<string>(this.insights[0])
  insightObservable: Observable<string> = this.insightEmitter.asObservable()

  //DATE: 8-14 SETTEMBRE INCLUSI

  constructor(
    private api: ApiService,
    private resolution: ResolutionService
  ) {
    this.topFactory = new GraphFactory(this.resolution.getWeekScatterPlotWidth(), this.resolution.getWeekScatterPlotHeight())
    this.bottomFactory = new GraphFactory(this.resolution.getBottomScatterPlotWidth(), this.resolution.getBottomScatterPlotHeight())
    this.pcaFactory = new GraphFactory(this.resolution.getPCAWidth(), this.resolution.getPCAHeight())
  }

  ngOnInit() {

    this.topFactory.createSvg('week')
    this.bottomFactory.createSvg('left')
    this.pcaFactory.createSvg('right')

    this.optionControl.setValue(this.options[0])

    this.api.getGenericResponseQuery().subscribe((res: BasicRequestQueryItem[]) => {
      this.data = getRequestObjects(res)

      this.createTopScatterplot()
      this.newLeftGraph()
      this.addBrushing()
      this.createCountScatterplot(true)

      this.optionControl.valueChanges.subscribe(() => this.controlValueChanges())

    })
  }

  controlValueChanges() {
    this.bottomFactory.removeSvg('left')
    this.insightEmitter.next(this.insights[this.options.indexOf(this.optionControl.value)])
    this.newLeftGraph()
    this.addBrushing()
    this.createCountScatterplot(true)
  }

  newLeftGraph() {
    if(this.optionControl.value === this.countOption) {
      this.createCountScatterplot(false)
    } else this.createSimpleScatterplot()
  }

  createTopScatterplot() {

    let minDate = new Date(2024, 8, 8, 0, 0, 0)
    let maxDate = new Date(2024, 8, 14, 23, 59, 59)

    this.topFactory.addColoredBackground()
    this.topFactory.createXAxis('time', [minDate, maxDate], 28, "%a %H")
    this.topFactory.createYAxis('linear', [0, 130], 10)
    this.topFactory.addXAxis('time', [minDate, maxDate], 28, "%a %H")
    this.topFactory.addYAxis('linear', [0, 130], 10, "s")
    this.topFactory.colorGrid()
    this.topFactory.addXAxisTitle('daytime')
    this.topFactory.addYAxisTitle('loading time')
    this.topFactory.addSimpleScatterplotDots(this.data, 'time', 'loading_time', 1)
  }

  createSimpleScatterplot() {
    let xOption = this.getXOption(this.optionControl.value)
    this.bottomFactory.addColoredBackground()
    this.bottomFactory.createXAxis(xOption.type, xOption.domain, xOption.ticks, "s")
    this.bottomFactory.addXAxis(xOption.type, xOption.domain, xOption.ticks, "s")
    this.bottomFactory.createYAxis('linear', [0, 130], 10)
    this.bottomFactory.addYAxis('linear', [0, 130], 10, "s")
    this.bottomFactory.colorGrid()
    this.bottomFactory.addXAxisTitle(xOption.value)
    this.bottomFactory.addYAxisTitle('loading time')
    this.bottomFactory.addSimpleScatterplotDots(this.data, xOption.value, 'loading_time', 1)
    this.bottomFactory.svg.on("click", (event: any) => {
      console.log(event)
    })
  }

  createCountScatterplot(pca: boolean) {
    let values: RequestItem[]
    let xOption: XAxisLoadingTime
    let factory: GraphFactory
    let yDomain: number[]
    let yTicks: number

    if(pca) {
      xOption = this.getPCAOption(this.optionControl.value)
      values = this.calculatePCA()
      factory = this.pcaFactory
      yDomain = [-1, 1]
      yTicks = 1
    } else {
      xOption = this.getXOption(this.optionControl.value)
      values = this.data
      factory = this.bottomFactory
      yDomain = [0, 130]
      yTicks = 10
    }

    let countedData: RequestItem[] = this.countOccurrencies(values, this.optionControl.value, 'loading_time')

    factory.addColoredBackground()
    factory.createXAxis(xOption.type, xOption.domain, xOption.ticks, "s")
    factory.addXAxis(xOption.type, xOption.domain, xOption.ticks, "s")
    factory.createYAxis('linear', yDomain, yTicks)
    factory.addYAxis('linear', yDomain, yTicks, "s")
    factory.addRAxis([1, getMaxCount(countedData)], xOption.maxRay)
    factory.colorGrid()
    factory.addXAxisTitle(xOption.value)
    factory.addYAxisTitle('loading time')
    factory.addVariableScatterplotDots(countedData, xOption.value, 'loading_time')
    factory.addScatterplotDimensionLegend()
  }


  getXOption(value: string): XAxisLoadingTime {
    for (let i = 0; i < simpleLoadingTimeSettings.length; i++) {
      if (simpleLoadingTimeSettings[i].value === value) {
        return simpleLoadingTimeSettings[i]
      }
    }
    return {} as XAxisLoadingTime
  }

  getPCAOption(value: string): XAxisLoadingTime {
    for(let i = 0; i < pcaLoadingTimeSettings.length; i++) {
      if(pcaLoadingTimeSettings[i].value === value) {
        return pcaLoadingTimeSettings[i]
      }
    }
    return {} as XAxisLoadingTime
  }

  countOccurrencies(data: RequestItem[], xValue: string, yValue: string) {
    let resArray = []
    for (let i = 0; i < data.length; i++) {
        let resIndex = undefined
        for (let j = 0; j < resArray.length; j++) {
            if (data[i][xValue as keyof RequestItem] === resArray[j][xValue as keyof RequestItem] 
            && data[i][yValue as keyof RequestItem] === resArray[j][yValue as keyof RequestItem]) {
                resIndex = j
            }
        }
        if (resIndex) {
            resArray[resIndex].count++
        } else {
            let obj = data[i]
            obj.count = 1
            resArray.push(obj)
        }
    }
    return resArray
    //return resArray.slice(1, resArray.length)
  }

  calculatePCA() {
    let onlyNumbers = []
    for (let i = 0; i < this.data.length; i++) {
    //let item = [dbResponse[i]['loading_time'], dbResponse [i][field]]
      let item = [this.data[i][this.optionControl.value as keyof RequestItem], this.data[i]['loading_time']]

      onlyNumbers.push(item)
    }
    let vectors = Pca.getEigenVectors(onlyNumbers)
    //var first = PCA.computePercentageExplained(vectors,vectors[0])
    //var topTwo = PCA.computePercentageExplained(vectors,vectors[0],vectors[1])
  
    var adData =  Pca.computeAdjustedData(onlyNumbers,vectors[0])
    let results = []
    for (let i = 0; i < adData.formattedAdjustedData[0].length; i++) {
      let result: RequestItem = new RequestItem()
      result.loading_time = 0
      result[this.optionControl.value as keyof RequestItem] = adData.formattedAdjustedData[0][i]
      results.push(result)
    }
    return results
  }

  addBrushing() {

    let xVar: string = this.optionControl.value
    this.bottomFactory.svg.call(d3.brush().on("end", ({selection}) => {
      let value = [];
      console.log('AAA', selection)
      if (selection) {
        const [[x0, y0], [x1, y1]] = selection;
        console.log(selection)
        console.log('pp', this.bottomFactory.dots)
        value = this.bottomFactory.dots
          .selectAll("circle")
          //.style("fill", "#9cb8f0")
          .attr("fake", (d:any)=> console.log('AO', this.bottomFactory.x(d['cx'])))
          //.filter((d: any) => x0 <= this.bottomFactory.x(d.attr('cx')) && this.bottomFactory.x(d.attr('cx')) < x1
          //        && y0 <= this.bottomFactory.y(d.attr('cy')) && this.bottomFactory.y(d.attr('cy')) < y1)
          .style("fill", (d: any) => x0 <= this.bottomFactory.x(d['cx']) && this.bottomFactory.x(d['cx']) < x1
                  && y0 <= this.bottomFactory.y(d['cy']) && this.bottomFactory.y(d['cy']) < y1 ? "#fa2a2a" : "#9cb8f0")
          //.data()
      } else {
        //this.bottomFactory.dots.style("fill", "#9cb8f0");
      }
    }))
  }


}
