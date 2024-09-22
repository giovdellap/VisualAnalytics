export class LogItem {
    wli: number = 0
    tokens: number = 0
    model: string = ""
    count: number = 0
    selected: boolean = false
}

export class LogItemGenerations extends LogItem {
    generations: number = 0
}
  
export class LogItemSatisfaction extends LogItem {
    satisfaction: number = 0
}