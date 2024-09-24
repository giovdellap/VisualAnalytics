import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ResolutionService {

  options: string[] = ['1920x1080', '2560x1440']
  currentResolution: string = this.options[1]

  constructor() { }

  setResolution(res: string) {
    this.currentResolution = res
  }

  getResolution() {
    return this.currentResolution
  }

  getGenSatScatterplotWidth(): number {
    if (this.currentResolution === this.options[0]) {
      return 250
    } else return 300
  }

  getGenSatScatterplotHeight(): number {
    if (this.currentResolution === this.options[0]) {
      return 225
    } else return 312
  }

  getGenSatBoxplotWidth(): number {
    if (this.currentResolution === this.options[0]) {
      return 480
    } else return 670
  }

  getGenSatBoxplotHeight(): number {
    if (this.currentResolution === this.options[0]) {
      return 210
    } else return 290
  }

  getWeekScatterPlotWidth(): number {
    if (this.currentResolution === this.options[0]) {
      return 1790
    } else return 2400
  }

  getWeekScatterPlotHeight(): number {
    if (this.currentResolution === this.options[0]) {
      return 450
    } else return 600
  }

  getBottomScatterPlotWidth(): number {
    if (this.currentResolution === this.options[0]) {
      return 1590
    } else return 2100
  }

  getBottomScatterPlotHeight(): number {
    if (this.currentResolution === this.options[0]) {
      return 330
    } else return 400
  }

  getPCAWidth(): number {
    if (this.currentResolution === this.options[0]) {
      return 1590
    } else return 2100
  }

  getPCAHeight(): number {
    if (this.currentResolution === this.options[0]) {
      return 130
    } else return 200
  }



}
