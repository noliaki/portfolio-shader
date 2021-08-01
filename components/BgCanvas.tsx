import { useRef } from 'react'

export function BgCanvas(): JSX.Element {
  const canvasEl = useRef<HTMLCanvasElement>(null)

  return <canvas ref={canvasEl}></canvas>
}
