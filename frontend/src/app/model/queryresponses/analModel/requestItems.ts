export class RequestItemSimple {
  loading_time: number = 0
  input_dimension: number = 0
  input_tokens: number = 0
  total_tokens: number = 0
  stream_messages: number = 0
  time: Date = new Date()
  count: number = 0
}

export class RequestItem extends RequestItemSimple {
    selected: boolean = false
  }
