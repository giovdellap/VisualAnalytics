export class BoxPlotSettings {
    value: string = ""
    type: string = ""
    domain: number[] = []
    insight: string = ""
    ticks: number = 0
    format: string = ""
}

export const boxplotXAxis: BoxPlotSettings[] = [
    {
        value: 'tokens',
        type: 'boxplot',
        domain: [2000, 10000],
        insight: 'TOKENS RANGE: 3000-10000',
        ticks: 7,
        format: "s"
      },
      {
        value: 'wli',
        type: 'boxplot',
        domain: [0, 6],
        insight: 'WLI RANGE: 1-5',
        ticks: 5,
        format: "g"
      }
]

export const boxplotYAxis: BoxPlotSettings[] = [
    {
        value: 'generations',
        type: 'boxplot',
        domain: [0, 11],
        ticks: 9,
        format: "s",
        insight: 'GENERATIONS RANGE: 1-10',
      },
      {
        value: 'satisfaction',
        type: 'boxplot',
        domain: [0, 6],
        ticks: 5,
        format: "g",
        insight: 'SATISFACTION RANGE: 1-5',
      }
]