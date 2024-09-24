export class XAxisScatterplot {
  value: string
  type: string
  domain: number[]
  maxRay: number
  insight: string
  ticks: number
  format: string

  constructor(value: string, type: string, domain: number[], maxRay: number, insight: string, ticks: number, format: string) {
    this.value = value
    this.type = type
    this.domain = domain
    this.maxRay = maxRay
    this.insight = insight
    this.ticks = ticks
    this.format = format
  }
}

export const xScatterplotSettings: XAxisScatterplot[] = [
  {
    value: 'tokens',
    type: 'linear',
    domain: [2000, 10500],
    maxRay: 7,
    insight: 'TOKENS RANGE: 3000-10000',
    ticks: 7,
    format: "s"
  },
  {
    value: 'wli',
    type: 'linear',
    domain: [0, 6],
    maxRay: 15,
    insight: 'WLI RANGE: 1-5',
    ticks: 5,
    format: "g"
  },
  {
    value: 'temperature',
    type: 'linear',
    domain: [0, 1],
    maxRay: 5,
    insight: 'TEMPERATURE RANGE: 0.0-1.0',
    ticks: 3,
    format: ".2s"
  },
  {
    value: 'presence_penalty',
    type: 'linear',
    domain: [0, 2],
    maxRay: 5,
    insight: 'PRESENCE PENALTY RANGE: 0.0-2.0',
    ticks: 1,
    format: ".2s"
  }
]

export const xBoxPlotSettings: XAxisScatterplot[] = [
  {
    value: 'tokens',
    type: 'boxplot',
    domain: [3000, 10000],
    maxRay: 0,
    insight: 'TOKENS RANGE: 3000-10000',
    ticks: 7,
    format: "s"
  },
  {
    value: 'wli',
    type: 'boxplot',
    domain: [0, 6],
    maxRay: 0,
    insight: 'WLI RANGE: 1-5',
    ticks: 5,
    format: "g"
  },
]


