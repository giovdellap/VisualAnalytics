import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap, tap } from 'rxjs';
import { GraphFactory } from '../../graphFactory/graphfactory';
import { getMaxCount } from '../../graphFactory/graphUtils';
import { XAxisScatterplot, xScatterplotSettings } from '../../model/graphSettings/xAxisScatterplot';
import { yScatterplotSettings } from '../../model/graphSettings/yAxisScatterplot';
import { models } from '../../model/models';
import { LogItem } from '../../model/queryresponses/analModel/logItem';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-gensat',
  standalone: true,
  imports: [],
  templateUrl: './gensat.component.html',
  styleUrl: './gensat.component.css'
})
export class GensatComponent {
  
  mainVariable: string = ""

  models: String[] = models
  itemsArray: LogItem[] = []

  tokensFactories: GraphFactory[] = []
  wliFactories: GraphFactory[] = []

  tokenScatterplotSettings = xScatterplotSettings[0]
  wliScatterplotSettings = xScatterplotSettings[1]
  yAxisSettings = yScatterplotSettings[0]

  constructor(
    private route: ActivatedRoute,
    private api: ApiService
  ) {
  }

  ngOnInit() {
    this.refreshItems().subscribe(x => {
      console.log(x)
      this.createScatterplots()
    })
  }

  refreshItems() {
    return this.route.url.pipe(
      tap(url => {
        this.mainVariable = url[0].path
        if (this.mainVariable === 'satisfaction') {
          this.yAxisSettings = yScatterplotSettings[1]
        }
      }),
      switchMap(() => this.api.getGenericLogQuery(this.mainVariable)),
      tap((res: LogItem[]) => this.itemsArray = res)
    )
  }

  createScatterplots() {

    let allModelsCountedTokens: LogItem[] = this.countOccurrencies(this.itemsArray, 'tokens')
    this.createSingleScatterplot(0, allModelsCountedTokens, this.tokenScatterplotSettings, this.tokensFactories)
    let allModelsCountedWli: LogItem[] = this.countOccurrencies(this.itemsArray, 'wli')
    this.createSingleScatterplot(0, allModelsCountedWli, this.wliScatterplotSettings, this.wliFactories)


    for (let i = 1; i < models.length; i++) {
      let tokensCountedArray = this.countOccurrencies(this.itemsArray.filter(obj => obj.model === models[i]), 'tokens')
      this.createSingleScatterplot(i, tokensCountedArray, this.tokenScatterplotSettings, this.tokensFactories)
      let wliCountedArray = this.countOccurrencies(this.itemsArray.filter(obj => obj.model === models[i]), 'wli')
      this.createSingleScatterplot(i, wliCountedArray, this.wliScatterplotSettings, this.wliFactories) 
    }
  }

  createSingleScatterplot(index: number, data: LogItem[], settings: XAxisScatterplot, factories: GraphFactory[]) {
    factories.push(new GraphFactory(250, 250))
    let id = settings.value + index
    factories[index].createSvg(id)
    factories[index].addXAxis(settings.type, settings.domain)
    factories[index].addYAxis(this.yAxisSettings.type, this.yAxisSettings.domain)
    factories[index].addRAxis([1, getMaxCount(data)], settings.maxRay)
    factories[index].colorGrid()
    factories[index].addXAxisTitle(settings.value)
    factories[index].addYAxisTitle(this.yAxisSettings.value)
    factories[index].addVariableScatterplotDots(data, settings.value, this.yAxisSettings.value)
    factories[index].addScatterplotDimensionLegend()
  }

  countOccurrencies(data: LogItem[], value: string) {
    let resArray = []
    for (let i = 0; i < data.length; i++) {
        let resIndex = undefined
        for (let j = 0; j < resArray.length; j++) {
            if (data[i][this.mainVariable as keyof LogItem] === resArray[j][this.mainVariable as keyof LogItem] 
            && data[i][value as keyof LogItem] === resArray[j][value as keyof LogItem]) {
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
}
