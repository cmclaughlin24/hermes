export class MqResponse<T> {
  constructor(public message: string, public data?: T) {}
}
