import * as d3 from 'd3';
import { LogItem } from '../model/queryresponses/analModel/logItem';
import { RequestItem } from '../model/queryresponses/analModel/requestItems';
import { BasicRequestQueryItem } from '../model/queryresponses/basicRequestQueryItem';
import { medYellow, selectedBlue, selectedGreeen, selectedRed } from '../utils/colors';

export function createAxis(type: string, domain: any[], range: number[]) {
  if (type === 'linear' || type === 'boxplot') {
    return d3.scaleLinear()
    .domain(domain)
    .range(range);
  } else {
    return d3.scaleTime()
    .domain(domain)
    .range(range);
  }
}

export function getDotRay(maxRay: number, count: number, total: number) {
  return maxRay*count/total
}

export function getTotal(data: any) {
  let total = 0
  for (let i = 0; i < data.length; i++) {
    total = total + data[i].count
  }
  return total
}

export function getMaxCount(data: any) {
  let max_count = 0
  for (let i = 0; i < data.length; i++) {
    if (data[i].count > max_count) {
      max_count = data[i].count
    }
  }
  return max_count
}

export function getScatterplotLegendPosition(
  rAxis: any,
  margin: number,
  ticks_num: number,
  d:any
) {
  let values = rAxis.ticks(ticks_num)
  let positions = [margin + Math.round(rAxis(values[0]))]
  for (let i = 1; i < values.length; i++) {
    let position = positions[i-1] + rAxis(values[i-1]) + margin + rAxis(values[i])
    positions.push(Math.round(position))
  }
  //console.log("values", values)
  //console.log("positions", positions)
  return positions[values.indexOf(d)]
}

export function getElements(
  allItems: LogItem[],
  quartiles: number[],
  range: number[],
  id: number,
  ord: string,
  card: string,
  cardV: number,
  colorId: number
): LogItem[] {

  console.log('ord', ord)
  console.log('card', card)
  console.log('cardv', cardV, typeof cardV)
  console.log('id', id, typeof id)
  console.log('colorid', colorId, typeof colorId)
  let items = [...allItems]
  console.log('range: ', range)
  console.log('quartiles', quartiles)
  for (let el of items) {
    const value: number = Number(el[ord as keyof LogItem])
    const cardValue: number = Number(el[card as keyof LogItem]) as number
    switch (id) {
      case 0:
        if (value >= range[0] && value <= quartiles[0] && cardValue === cardV) {
            el.selected = colorId
        }
        break;
      case 1:
        if (value > quartiles[0] && value <= quartiles[1] && cardValue === cardV) {
          el.selected = colorId
        }
        break;
      case 2:
        
        if (value > quartiles[1] && value <= quartiles[2] && cardValue === cardV) {
          el.selected = colorId
        }
        break;
      case 3:
        if (value > quartiles[2] && value <= range[1] && cardValue === cardV) {
          el.selected = colorId
        }
        break;
    }
  }
  return items
}

export function getSelectedColor(colorId: number): string {
  switch (colorId) {
    case 0:
      return medYellow
    case 1:
      return selectedRed
    case 2:
      return selectedBlue
    case 3:
      return selectedGreeen
  }
  return medYellow
}

function getNewDate(old: Date) {
  return new Date(
    2024,
    8,
    8 + old.getDay(),
    old.getHours(),
    old.getMinutes(),
    old.getSeconds()
  )
}

export function getRequestObjects(data: BasicRequestQueryItem[]): RequestItem[] {
  let res: RequestItem[] = []
  for (let i = 0; i < data.length; i++) {
    let obj: RequestItem = {} as RequestItem
    obj.loading_time = data[i].loading_time
    obj.input_dimension = data[i].input_dimension
    obj.input_tokens = data[i].input_tokens
    obj.stream_messages = data[i].stream_messages
    obj.total_tokens = data[i].total_tokens
    obj.time = getNewDate(new Date(data[i].time))
    res.push(obj)
  }
  return res
}

export function isBrushed(brush_coords: any, cx: any, cy: any): boolean {
  let x0 = brush_coords[0][0]
  let x1 = brush_coords[1][0]
  let y0 = brush_coords[0][1]
  let y1 = brush_coords[1][1]
  return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;    // This return TRUE or FALSE depending on if the points is in the selected area
}
