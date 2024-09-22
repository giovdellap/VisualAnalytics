export class YAxisScatterplot {
  value: string
  type: string
  domain: number[]
  maxRay: number
  ticks: number

  constructor(value: string, type: string, domain: number[], maxRay: number, ticks: number) {
    this.value = value
    this.type = type
    this.domain = domain
    this.maxRay = maxRay
    this.ticks = ticks
  }
}

export const yScatterplotSettings: YAxisScatterplot[] = [
  {
    value: 'generations',
    type: 'linear',
    domain: [0, 10],
    maxRay: 5,
    ticks: 9
  },
  {
    value: 'satisfaction',
    type: 'linear',
    domain: [0, 6],
    maxRay: 30,
    ticks: 5
  }
]

export const yBoxPlotSettings: YAxisScatterplot[] = [
  {
    value: 'generations',
    type: 'linear',
    domain: [0, 10],
    maxRay: 5,
    ticks: 9
  },
  {
    value: 'satisfaction',
    type: 'linear',
    domain: [0, 6],
    maxRay: 30,
    ticks: 5
  }
]
