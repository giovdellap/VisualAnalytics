import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogModule,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import * as d3 from 'd3';
import { BehaviorSubject, Observable } from 'rxjs';
import * as Pca from "../../../assets/js/pca";
import { GraphFactory } from '../../graphFactory/graphfactory';
import { getMaxCount, getRequestObjects } from '../../graphFactory/graphUtils';
import { pcaLoadingTimeSettings, simpleLoadingTimeSettings, XAxisLoadingTime } from '../../model/graphSettings/xaxisloadingtime';
import { RequestItem, RequestItemSimple } from '../../model/queryresponses/analModel/requestItems';
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
    MatRadioModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  templateUrl: './loadtime.component.html',
  styleUrl: './loadtime.component.css'
})
export class LoadtimeComponent {

  cleanData: RequestItem[] = []
  data: RequestItem[] = []

  topFactory: GraphFactory
  bottomFactory: GraphFactory
  pcaFactory: GraphFactory

  optionControl = new FormControl()
  countOption = "stream_messages"
  options: string[] = ['total_tokens', 'input_tokens', 'input_dimension']

  insights: string[] = requestScatterplotInsights
  insightEmitter = new BehaviorSubject<string>(this.insights[0])
  insightObservable: Observable<string> = this.insightEmitter.asObservable()

  selectionEmitter = new BehaviorSubject<boolean>(false)
  selectionObservable: Observable<boolean> = this.selectionEmitter.asObservable()
  selection: boolean = false

  loadingStateEmitter: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)
  loadingStateObs: Observable<boolean> = this.loadingStateEmitter.asObservable()
  dialog = inject(MatDialog);
  matDialogRef: MatDialogRef<MyDialog> = {} as MatDialogRef<MyDialog>


  //DATE: 8-14 SETTEMBRE INCLUSI

  constructor(
    private api: ApiService,
    private resolution: ResolutionService,
    //private dialog: MatDialog
  ) {
    this.topFactory = new GraphFactory(this.resolution.getWeekScatterPlotWidth(), this.resolution.getWeekScatterPlotHeight())
    this.bottomFactory = new GraphFactory(this.resolution.getBottomScatterPlotWidth(), this.resolution.getBottomScatterPlotHeight())
    this.pcaFactory = new GraphFactory(this.resolution.getPCAWidth(), this.resolution.getPCAHeight())
  }

  ngOnInit() {

    this.loadingStateObs.subscribe((loading: boolean) => {
      if (loading) {
        console.log('LOADING TRUE')
        //dialogRef.afterClosed().subscribe(result => {
          //console.log(`DIALOG CLOSED`);
        //});
        //this.loadingStateEmitter.next(true)
      } else {
        console.log("LOADING FALSE")

      }
    })

    this.topFactory.createSvg('top')
    this.bottomFactory.createSvg('bottom')
    this.pcaFactory.createSvg('pca')

    this.optionControl.setValue(this.options[0])

    this.api.getGenericResponseQuery().subscribe((res: BasicRequestQueryItem[]) => {
      this.cleanData = getRequestObjects(res)
      this.data = [...this.cleanData]

      this.createAllGraphs()
      this.addBrushing()

      this.optionControl.valueChanges.subscribe(() => this.controlValueChanges())
      this.selectionObservable.subscribe((selection: boolean) => {
        if(selection) {
          this.newSelection()
        }
      })
    })
  }

  controlValueChanges() {
    console.log('CONTROLVALUECHANGES')

    this.removeAllGraphs()
    this.selection = false
    this.selectionEmitter.next(false)
    this.insightEmitter.next(this.insights[this.options.indexOf(this.optionControl.value)])
    for (let el of this.data) {
      if(el.selected) el.selected = false
    }
    this.createAllGraphs()
    this.addBrushing()
  }

  newSelection() {
    console.log('NEW SELECTION')
    this.removeAllGraphs()
    this.createAllGraphs()
  }


  newBottomGraph() {
    console.log('NEW BOTTOM GRAPH', this.optionControl.value)
    if(this.optionControl.value === this.countOption) {
      this.createCountScatterplot()
    } else this.createSimpleScatterplot()
  }

  createTopScatterplot() {
    console.log('CREATETOPSCATTERPLOT')


    let minDate = new Date(2024, 8, 8, 0, 0, 0)
    let maxDate = new Date(2024, 8, 14, 23, 59, 59)

    this.topFactory.addColoredBackground()
    this.topFactory.createXAxis('time', [minDate, maxDate], 28, "%a %H")
    this.topFactory.createYAxis('linear', [0, 150], 10)
    this.topFactory.addXAxis('time', [minDate, maxDate], 28, "%a %H")
    this.topFactory.addYAxis('linear', [0, 150], 10, "s")
    this.topFactory.colorGrid()
    this.topFactory.addXAxisTitle('daytime')
    this.topFactory.addYAxisTitle('loading time')
    this.topFactory.addColoredScatterplotDots(this.data, 'time', 'loading_time')
  }

  createSimpleScatterplot() {
    console.log('CREATESIMPLESCATTERPLOT')

    let xOption = this.getXOption(this.optionControl.value)
    this.bottomFactory.addColoredBackground()
    this.bottomFactory.createXAxis(xOption.type, xOption.domain, xOption.ticks, "s")
    this.bottomFactory.addXAxis(xOption.type, xOption.domain, xOption.ticks, "s")
    this.bottomFactory.createYAxis('linear', [0, 150], 10)
    this.bottomFactory.addYAxis('linear', [0, 150], 10, "s")
    this.bottomFactory.colorGrid()
    this.bottomFactory.addXAxisTitle(xOption.value)
    this.bottomFactory.addYAxisTitle('loading time')
    this.bottomFactory.addColoredScatterplotDots(this.data, xOption.value, 'loading_time')
  }

  createCountScatterplot() {
    console.log('CREATECOUNTSCATTERPLOT')

    let values: RequestItem[] = this.data
    let xOption: XAxisLoadingTime = this.getXOption(this.optionControl.value)
    let factory: GraphFactory = this.bottomFactory
    let yDomain: number[] = [0, 150]
    let yTicks: number = 10


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
    factory.addVariableLoadDataScatterplotDots(countedData, xOption.value, 'loading_time')
    factory.addScatterplotDimensionLegend()
  }

  createPCAScatterplot() {
    console.log('CREATEPCASCATTERPLOT')

    let data: RequestItem[] = []
    if (this.selection) {
      data = this.data.filter((x: RequestItem) => x.selected)
    } else data = this.data
    let values: RequestItem[] = this.calculatePCA(data)
    let xOption: XAxisLoadingTime = this.getPCAOption(this.optionControl.value)
    let factory: GraphFactory = this.pcaFactory
    let yDomain: number[] = [-1, 1]
    let yTicks: number = 1

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
    factory.addVariableLoadDataScatterplotDots(countedData, xOption.value, 'loading_time')
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

  calculatePCA(data: RequestItem[]) {
    let onlyNumbers = []
    for (let i = 0; i < data.length; i++) {
    //let item = [dbResponse[i]['loading_time'], dbResponse [i][field]]
      let item = [data[i][this.optionControl.value as keyof RequestItem], data[i]['loading_time']]

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
      result[this.optionControl.value as keyof RequestItemSimple] = adData.formattedAdjustedData[0][i]
      results.push(result)
    }
    return results
  }

  addBrushing() {

    const brush = d3.brushX()
    .extent([
      [0, 0.5],
      [
        this.bottomFactory.width,
        this.resolution.getBottomScatterPlotHeight() - (this.bottomFactory.margin * 1.5)]])
    .on("end", (selection: any) => {
      //console.log('BRUSHENDED A', selection)
      let width = this.resolution.getBottomScatterPlotWidth() - 45
      //console.log('BRUSHENDED WIDTH', width)
      let maxX = this.getXOption(this.optionControl.value).domain[1]
      //console.log('BRUSHENDED MAXX', maxX)

      let min = maxX * selection.selection[0]/width
      //console.log('BRUSHENDED MIN', min)

      let max = maxX * selection.selection[1]/width
      //console.log('BRUSHENDED MAX', max)

      for (const el of this.cleanData) {
        if(el.selected) console.log('CLEANDATA DIRTY 1')
      }
      let temp = [...this.cleanData]
      for (const el of temp) {
        if(el.selected) console.log('TEMP DIRTY 1')
      }
      for (const el of this.data) {
        if(el.selected) el.selected = false
      }
      for (let elem of temp) {
        let val = Number(elem[this.optionControl.value as keyof RequestItem])
        if (val >= min && val <= max) {
          //console.log('BRUSHENDED SELECTED VAL', val)
          elem.selected = true
        }
      }
      this.data = temp
      this.selection = true
      this.selectionEmitter.next(true)
    });

    const gb = this.bottomFactory.svg.append("g")
      .call(brush)

    let xVar: string = this.optionControl.value

  }

  disableSelection() {
    console.log('DISABLE SELECTION GRAPH')

    this.removeAllGraphs()
    this.data = [...this.cleanData]
    for (const el of this.data) {
      if(el.selected) el.selected = false
    }

    this.selection = false
    this.selectionEmitter.next(false)
    this.createAllGraphs()
    this.addBrushing()

  }

  removeAllGraphs(){
    console.log('REMOVE ALL GRAPH')

    this.topFactory.removeSvg('top')
    this.bottomFactory.removeSvg('bottom')
    this.pcaFactory.removeSvg('pca')
  }

  createAllGraphs() {
    console.log('CREATE ALL GRAPH')
    console.log('START')
    this.loadingStateEmitter.next(true)
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    this.matDialogRef = this.dialog.open(MyDialog, {
      height: '100%',
      width: '600px'}
    )
    this.createTopScatterplot()
    this.newBottomGraph()
    this.createPCAScatterplot()
    this.loadingStateEmitter.next(false)
    console.log('END')
    this.matDialogRef.close()
    //this.dialog = inject(MatDialog);

  }


}

@Component({
  selector: 'my-dialog',
  templateUrl: '../dialog.html',
  styleUrl: '../dialog.css',
  standalone: true,
  imports: [MatDialogModule,MatDialogTitle],
})
export class MyDialog {

  constructor(
    public dialogRef: MatDialogRef<LoadtimeComponent>) {
      console.log('COSTRUTTORE MODALE')
     }

}
