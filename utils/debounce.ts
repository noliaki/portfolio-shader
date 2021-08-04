export function debounce<T>(
  fn: (...args: any) => any,
  interval: number = 300
): (...args: any) => T {
  let timerId: number

  return (...args: any): any => {
    if (typeof timerId !== 'undefined') {
      window.clearTimeout(timerId)
    }

    timerId = window.setTimeout(() => {
      fn(...args)
    }, interval)
  }
}
