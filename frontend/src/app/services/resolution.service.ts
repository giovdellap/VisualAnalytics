import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ResolutionService {

  currentResolution: string = '1920x1080'
  options: string[] = ['1920x1080', '2560x1440']

  constructor() { }

  setResolution(res: string) {
    this.currentResolution = res
  }

  getGenSatScatterplotWidth(): number {
    if (this.currentResolution === this.options[0]) {
      return 250
    } else return 250
  }

  getGenSatScatterplotHeight(): number {
    if (this.currentResolution === this.options[0]) {
      return 225
    } else return 200
  }

  getGenSatBoxplotWidth(): number {
    if (this.currentResolution === this.options[0]) {
      return 500
    } else return 500
  }

  getGenSatBoxplotHeight(): number {
    if (this.currentResolution === this.options[0]) {
      return 220
    } else return 200
  }

  getWeekScatterPlotWidth(): number {
    if (this.currentResolution === this.options[0]) {
      return 1850
    } else return 1800
  }

  getWeekScatterPlotHeight(): number {
    if (this.currentResolution === this.options[0]) {
      return 450
    } else return 500
  }

  getBottomScatterPlotWidth(): number {
    if (this.currentResolution === this.options[0]) {
      return 1650
    } else return 1800
  }

  getBottomScatterPlotHeight(): number {
    if (this.currentResolution === this.options[0]) {
      return 350
    } else return 400
  }

  getPCAWidth(): number {
    if (this.currentResolution === this.options[0]) {
      return 1650
    } else return 1800
  }

  getPCAHeight(): number {
    if (this.currentResolution === this.options[0]) {
      return 160
    } else return 300
  }


  
}
