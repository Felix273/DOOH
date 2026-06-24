export class NoopRealtimeTransport {
  readonly CONNECTING = 0
  readonly OPEN = 1
  readonly CLOSING = 2
  readonly CLOSED = 3
  readonly readyState = this.CLOSED
  readonly url: string
  readonly protocol = ""

  binaryType = "blob"
  bufferedAmount = 0
  extensions = ""
  onopen: ((this: unknown, ev: Event) => unknown) | null = null
  onmessage: ((this: unknown, ev: MessageEvent) => unknown) | null = null
  onclose: ((this: unknown, ev: CloseEvent) => unknown) | null = null
  onerror: ((this: unknown, ev: Event) => unknown) | null = null

  constructor(address: string | URL) {
    this.url = String(address)
  }

  close() {}

  send() {}

  addEventListener() {}

  removeEventListener() {}

  dispatchEvent() {
    return false
  }
}
