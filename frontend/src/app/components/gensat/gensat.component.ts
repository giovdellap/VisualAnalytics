import { AsyncPipe, CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import * as d3 from 'd3';
import { BehaviorSubject, Observable } from 'rxjs';
import { GraphFactory } from '../../graphFactory/graphfactory';
import { getElements, getMaxCount, getSelectedColor } from '../../graphFactory/graphUtils';
import { BoxPlotSettings, boxplotXAxis, boxplotYAxis } from '../../model/graphSettings/boxplotSettings';
import { XAxisScatterplot, xScatterplotSettings } from '../../model/graphSettings/xAxisScatterplot';
import { YAxisScatterplot, yScatterplotSettings } from '../../model/graphSettings/yAxisScatterplot';
import { models } from '../../model/models';
import { LogItem } from '../../model/queryresponses/analModel/logItem';
import { ApiService } from '../../services/api.service';
import { ResolutionService } from '../../services/resolution.service';
import { NoSanitizePipe } from '../../utils/nosanitizerpipe';


@Component({
  selector: 'app-gensat',
  standalone: true,
  imports: [
    NoSanitizePipe,
    AsyncPipe,
    CommonModule,
    MatIcon,
    MatButtonModule
  ],
  templateUrl: './gensat.component.html',
  styleUrl: './gensat.component.css'
})
export class GensatComponent {
  
  models: string[] = models
  itemsArray: LogItem[] = []
  rowItems: LogItem[][] = []
  bpItems: LogItem[][] = []

  spFactories: GraphFactory[][] = []
  bpFactories: GraphFactory[] = []

  tokensId: number = 0
  wliId: number = 1
  generationsId = 0
  satisfactionId = 1

  svgArray: any[] = []

  selectionModeArray: number[] = [0, 0, 0, 0]
  selectionModeBsArray: BehaviorSubject<boolean>[] = []
  selectionModeObsArray: Observable<boolean>[] = []

  bsArray: BehaviorSubject<string>[] = []
  obsArray: Observable<string>[] = []
  currentModels: string[] = []

  constructor(
    private api: ApiService,
    private resolution: ResolutionService
  ) {
  }

  ngOnInit() {

    //initialize Behaviour Subject and Observable for 
    for (let i = 0; i < 4; i++) {
      this.bsArray.push(new BehaviorSubject<string>(this.models[0]))
      this.obsArray.push(this.bsArray[i].asObservable())
      this.currentModels.push(this.models[0])

      this.selectionModeBsArray.push(new BehaviorSubject<boolean>(this.selectionModeArray[i] !== 0))
      this.selectionModeObsArray.push(this.selectionModeBsArray[i].asObservable())
    }

    //create factories
    for (let i = 0; i < 4; i++) {
      this.bpFactories.push(new GraphFactory(this.resolution.getGenSatBoxplotWidth(), this.resolution.getGenSatBoxplotHeight()))
      this.spFactories.push([])
      for (let j = 0; j < this.models.length; j++) {
        this.spFactories[i].push(new GraphFactory(this.resolution.getGenSatScatterplotWidth(), this.resolution.getGenSatScatterplotHeight()))
      }
    }

    this.initializeSVGs()

    this.api.getGenericLogQuery().subscribe((res: LogItem[]) => {
      this.itemsArray = res
      this.rowItems.push(this.itemsArray)
      this.bpItems.push(this.itemsArray)
      for (let r = 0; r < 4; r++) {
        this.rowItems.push(this.itemsArray)
        this.bpItems.push(this.itemsArray)
        this.refreshScatterplotsRow(r)
        this.refreshBoxPlot(r)
      }
    })
  }

  refreshScatterplotsRow(rowIndex: number) {

    let xAxis: XAxisScatterplot
    let yAxis: YAxisScatterplot
    if (rowIndex < 2) {
      xAxis = xScatterplotSettings[this.tokensId]
    } else xAxis = xScatterplotSettings[this.wliId]
    if(rowIndex === 0 || rowIndex === 2) {
      yAxis = yScatterplotSettings[this.satisfactionId]
    } else yAxis = yScatterplotSettings[this.generationsId]

    if (this.selectionModeArray[rowIndex] === 0) {
      let allModelsCounted: LogItem[] = this.countOccurrencies(this.rowItems[rowIndex], xAxis.value, yAxis.value)
      let maxRay = getMaxCount(allModelsCounted)
      this.createSingleScatterplot(rowIndex, 0, allModelsCounted, xAxis, yAxis, this.spFactories[rowIndex][0], maxRay, true)
  
      for (let i = 1; i < models.length; i++) {
        let tokensCountedArray = this.countOccurrencies(this.rowItems[rowIndex].filter(obj => obj.model === models[i]), xAxis.value, yAxis.value)
        this.createSingleScatterplot(rowIndex, i, tokensCountedArray, xAxis, yAxis, this.spFactories[rowIndex][i], maxRay, false)
      }
    } else {
      this.createSingleScatterplotSelectionMode(rowIndex, 0, this.rowItems[rowIndex], xAxis, yAxis, this.spFactories[rowIndex][0])
      for (let i = 1; i < models.length; i++) {
        let items: LogItem[] = this.rowItems[rowIndex].filter(obj => obj.model === models[i])
        this.createSingleScatterplotSelectionMode(rowIndex, i, items, xAxis, yAxis, this.spFactories[rowIndex][i])
      }
    }
  }

  refreshBoxPlot(rowIndex: number) {
    let ySettings: BoxPlotSettings
    let xSettings: BoxPlotSettings
    if(rowIndex === 0 || rowIndex === 2) {
      ySettings = boxplotYAxis[this.satisfactionId]
    } else ySettings = boxplotYAxis[this.generationsId]
    if (rowIndex > 1) {
      xSettings = boxplotXAxis[this.wliId]
      this.createWliBoxplot(rowIndex, this.bpItems[rowIndex], xSettings, ySettings, this.bpFactories[rowIndex])
    } else {
      xSettings = boxplotXAxis[this.tokensId]
      this.createTokensBoxplot(rowIndex, this.bpItems[rowIndex], xSettings, ySettings, this.bpFactories[rowIndex])
    }

  }

  createSingleScatterplot(
    rowIndex: number,
    columnIndex: number,
    data: LogItem[], 
    xSettings: XAxisScatterplot,
    ySettings: YAxisScatterplot,
    factory: GraphFactory,
    maxRay: number,
    legend: boolean
  ) {
    factory.addColoredBackground()
    factory.createXAxis(xSettings.type, xSettings.domain, xSettings.ticks, xSettings.format)
    factory.createYAxis(ySettings.type, ySettings.domain, ySettings.ticks)
    factory.addXAxis(xSettings.type, xSettings.domain, xSettings.ticks, xSettings.format)
    factory.addYAxis(ySettings.type, ySettings.domain, ySettings.ticks, "s")
    factory.addRAxis([1, maxRay], xSettings.maxRay)
    factory.colorGrid()
    factory.addXAxisTitle(xSettings.value)
    factory.addYAxisTitle(ySettings.value)
    factory.addVariableScatterplotDots(data, xSettings.value, ySettings.value)
    if (legend) factory.addScatterplotDimensionLegend()
  }

  createSingleScatterplotSelectionMode(
    rowIndex: number,
    columnIndex: number,
    data: LogItem[], 
    xSettings: XAxisScatterplot,
    ySettings: YAxisScatterplot,
    factory: GraphFactory,
  ) {
    factory.addColoredBackground()
    factory.createXAxis(xSettings.type, xSettings.domain, xSettings.ticks, xSettings.format)
    factory.createYAxis(ySettings.type, ySettings.domain, ySettings.ticks)
    factory.addXAxis(xSettings.type, xSettings.domain, xSettings.ticks, xSettings.format)
    factory.addYAxis(ySettings.type, ySettings.domain, ySettings.ticks, "s")
    factory.colorGrid()
    factory.addXAxisTitle(xSettings.value)
    factory.addYAxisTitle(ySettings.value)
    factory.addColoredScatterplotDots(data, xSettings.value, ySettings.value)
  }

  createWliBoxplot(
    rowIndex: number,
    data: LogItem[], 
    xSettings: BoxPlotSettings,
    ySettings: BoxPlotSettings,
    factory: GraphFactory,
  ) {
    factory.addColoredBackground()
    factory.createWliBPXAxis(xSettings.type, xSettings.domain, xSettings.ticks, xSettings.format)
    factory.createWliBPYAxis(ySettings.type, ySettings.domain, ySettings.ticks)
    factory.setBins(xSettings.value, ySettings.value, data, xSettings.ticks)
    factory.drawBinsVertical(ySettings)
    factory.addWliBPXAxis(xSettings.type, xSettings.domain, xSettings.ticks, xSettings.format)
    factory.addWliBPYAxis(ySettings.type, ySettings.domain, ySettings.ticks, ySettings.format)
    factory.colorGrid()
    factory.addXAxisTitle(xSettings.value)
    factory.addYAxisTitle(ySettings.value)
    factory.svg.on("click", (event: any) => {
      if (this.selectionModeArray[rowIndex] < 4) {
        if (this.selectionModeArray[rowIndex] === 0) {
          this.selectionModeArray[rowIndex] = 1
          this.selectionModeBsArray[rowIndex].next(true)
        } else this.selectionModeArray[rowIndex]++

        let colorId = this.selectionModeArray[rowIndex]
        
        let data = event.srcElement.__data__
        console.log(data)
        console.log(event)
        let elements = getElements(
          this.rowItems[rowIndex], 
          data.quartiles, data.range, 
          Number(event.target.id), 
          xSettings.value, ySettings.value, 
          data.x0, colorId)
        d3.select(event.target).attr("fill", getSelectedColor(colorId))
        this.onClickBoxPlot(rowIndex, elements)
      }

    })
  }

  createTokensBoxplot(
    rowIndex: number,
    data: LogItem[], 
    xSettings: BoxPlotSettings,
    ySettings: BoxPlotSettings,
    factory: GraphFactory,
  ) {
    factory.addColoredBackground()
    factory.createTokensBPXAxis(xSettings.type, xSettings.domain, xSettings.ticks, xSettings.format)
    factory.createTokensBPYAxis(ySettings.type, ySettings.domain, ySettings.ticks)
    factory.setBins(ySettings.value, xSettings.value, data, ySettings.ticks)
    factory.drawBinsHorizontal(ySettings)
    factory.addTokensBPXAxis(xSettings.type, xSettings.domain, xSettings.ticks, xSettings.format)
    factory.addTokensBPYAxis(ySettings.type, ySettings.domain, ySettings.ticks, ySettings.format)
    factory.colorGrid()
    factory.addXAxisTitle(xSettings.value)
    factory.addYAxisTitle(ySettings.value)
    factory.svg.on("click", (event: any) => {
      if (this.selectionModeArray[rowIndex] < 4) {
        if (this.selectionModeArray[rowIndex] === 0) {
          this.selectionModeArray[rowIndex] = 1
          this.selectionModeBsArray[rowIndex].next(true)
        } else this.selectionModeArray[rowIndex]++

        let colorId = this.selectionModeArray[rowIndex]
        
        let data = event.srcElement.__data__
        let elements = getElements(
          this.rowItems[rowIndex], 
          data.quartiles, data.range, 
          Number(event.target.id), 
          xSettings.value, ySettings.value, 
          data.x0, colorId)
        d3.select(event.target).attr("fill", getSelectedColor(colorId))
        this.onClickBoxPlot(rowIndex, elements)
      }

    })
  }

  onClickBoxPlot(rowIndex: number, selectedItems: LogItem[]) {

    this.rowItems[rowIndex] = selectedItems

    this.cleanScatterplotsRow(rowIndex)
    this.refreshScatterplotsRow(rowIndex)
  }

  cleanBoxPlot(rowIndex: number) {
    this.bpFactories[rowIndex].removeSvg('bpr' + rowIndex)
  }

  cleanScatterplotsRow(rowIndex: number) {
    for(let i = 0; i < 5; i ++) {
      let id = 'spr' + rowIndex + 'c' + i
      this.spFactories[rowIndex][i].removeSvg(id)
    }
  }

  initializeSVGs() {
    //initialize scatterplots
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < models.length; col++) {
        let id_sp = 'spr' + row + 'c' + col
        this.spFactories[row][col].createSvg(id_sp)
      }
      let id_bp = 'bpr' + row
      this.bpFactories[row].createSvg(id_bp)
    }
  }


  countOccurrencies(data: LogItem[], xValue: string, yValue: string) {
    let resArray = []
    for (let i = 0; i < data.length; i++) {
        let resIndex = undefined
        for (let j = 0; j < resArray.length; j++) {
            if (data[i][xValue as keyof LogItem] === resArray[j][xValue as keyof LogItem] 
            && data[i][yValue as keyof LogItem] === resArray[j][yValue as keyof LogItem]) {
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

  onClickGraphContainer(rowIndex: number, modelIndex: number) {
    if (!this.selectionModeArray[rowIndex]) {
      this.currentModels[rowIndex] = this.models[modelIndex]
      this.bsArray[rowIndex].next(this.models[modelIndex])
  
      if(modelIndex !== 0) {
        this.bpItems[rowIndex] = this.rowItems[rowIndex].filter(obj => obj.model === models[modelIndex])
      } else this.bpItems[rowIndex] = [...this.itemsArray]
  
      this.cleanBoxPlot(rowIndex)
      this.refreshBoxPlot(rowIndex)
    }
  }

  onClickModelName(modelIndex: number) {
    for(let i = 0; i < 4; i++) {
      this.onClickGraphContainer(i, modelIndex)
    }
  }

  disableSelectionMode(rowIndex: number) {
    this.selectionModeArray[rowIndex] = 0
    this.selectionModeBsArray[rowIndex].next(false)
    this.rowItems[rowIndex] = [...this.itemsArray]

    this.cleanScatterplotsRow(rowIndex)
    this.refreshScatterplotsRow(rowIndex)

    this.cleanBoxPlot(rowIndex)
    this.refreshBoxPlot(rowIndex)
  }
}
