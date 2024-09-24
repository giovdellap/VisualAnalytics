export class XAxisLoadingTime {
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

export const pcaLoadingTimeSettings: XAxisLoadingTime[] = [
  {
    value: 'input_tokens',
    type: 'linear',
    domain: [-8000, 8000],
    maxRay: 5,
    ticks: 5
  },
  {
    value: 'total_tokens',
    type: 'linear',
    domain: [-80000, 80000],
    maxRay: 5,
    ticks: 5
  },
  {
    value: 'stream_messages',
    type: 'linear',
    domain: [-10, 10],
    maxRay: 7,
    ticks: 5
  },
  {
    value: 'input_dimension',
    type: 'linear',
    domain: [-50, 50],
    maxRay: 5,
    ticks: 5
  }
]

export const simpleLoadingTimeSettings: XAxisLoadingTime[] = [
  {
    value: 'input_tokens',
    type: 'linear',
    domain: [1000, 10000],
    maxRay: 5,
    ticks: 5
  },
  {
    value: 'total_tokens',
    type: 'linear',
    domain: [1000, 80000],
    maxRay: 5,
    ticks: 5
  },
  {
    value: 'stream_messages',
    type: 'linear',
    domain: [1, 12],
    maxRay: 7,
    ticks: 5
  },
  {
    value: 'input_dimension',
    type: 'linear',
    domain: [1000, 8000],
    maxRay: 5,
    ticks: 5
  }
]
