import { useCallback, useEffect, useRef, useMemo } from 'react'
import {
  Mesh,
  WebGLRenderer,
  Scene,
  OrthographicCamera,
  PlaneBufferGeometry,
  ShaderMaterial,
  Texture,
} from 'three'
import { gsap } from 'gsap'

import vertexShader from './vertex.glsl'
import { fragmentShader } from './fragment'

import { debounce, loadImage } from '~/utils'

export function BgCanvas(props?: { className?: string }): JSX.Element {
  const canvasEl = useRef<HTMLCanvasElement | null>(null)
  const renderer = useRef<WebGLRenderer | null>(null)
  const scene = useRef(new Scene())
  const camera = useRef(new OrthographicCamera(0, 0, 0, 0, 0, 1000))
  const mesh = useRef(new Mesh())
  const start = useRef(Date.now())
  const images = useRef(['/img/bg-demo.webp', '/img/bg-demo2.webp'])
  const imagesIndex = useRef(0)
  const imageMap = useRef(new Map<string, HTMLImageElement>())
  const nextTextureTimerId = useRef<number | undefined>()

  const update = useCallback(() => {
    const material = mesh.current.material as ShaderMaterial

    material.uniforms.uTime.value = start.current - Date.now()
    material.uniformsNeedUpdate = true

    renderer.current?.render(scene.current, camera.current)

    requestAnimationFrame(() => {
      update()
    })
  }, [])

  const resetCamera = useCallback((winWidth: number, winHeight: number) => {
    camera.current.top = winHeight / 2
    camera.current.right = winWidth / 2
    camera.current.bottom = -winHeight / 2
    camera.current.left = -winWidth / 2

    camera.current.updateProjectionMatrix()
  }, [])

  const resetRenderer = useCallback((winWidth: number, winHeight: number) => {
    const canvas = canvasEl.current as HTMLCanvasElement

    canvas.width = winWidth
    canvas.height = winHeight
    renderer?.current?.setPixelRatio(window.devicePixelRatio)
    renderer?.current?.setSize(winWidth, winHeight)
  }, [])

  const onResize = useMemo(() => {
    return debounce((_event: Event): void => {
      const winWidth = window.innerWidth
      const winHeight = window.innerHeight

      const material = mesh.current.material as ShaderMaterial
      material.uniforms.uResolution.value = [winWidth, winHeight]
      material.uniformsNeedUpdate = true

      mesh.current.geometry = new PlaneBufferGeometry(winWidth, winHeight, 1, 1)

      resetRenderer(winWidth, winHeight)
      resetCamera(winWidth, winHeight)
    }, 300)
  }, [resetRenderer, resetCamera])

  const nextTexture = useCallback(async (src: string) => {
    if (nextTextureTimerId.current !== undefined) {
      clearTimeout(nextTextureTimerId.current)
    }

    const img = imageMap.current.get(src) ?? (await loadImage(src))
    imageMap.current.set(src, img)
    const material = mesh.current.material as ShaderMaterial

    material.uniforms.uTextureNext.value.image = img
    material.uniforms.uTextureNext.value.needsUpdate = true
    material.uniforms.uTextureNextResolution.value = [
      img.naturalWidth,
      img.naturalHeight,
    ]
    material.uniformsNeedUpdate = true

    const progress = {
      value: 0,
    }

    gsap.to(progress, {
      value: 1,
      duration: 3,
      none: 'none',
      onUpdate() {
        material.uniforms.uProgress.value = progress.value
        material.uniformsNeedUpdate = true
      },
      onComplete() {
        material.uniforms.uProgress.value = 0
        material.uniforms.uTexturePrev.value.image = img
        material.uniforms.uTexturePrevResolution.value = [
          img.naturalWidth,
          img.naturalHeight,
        ]

        material.uniforms.uTexturePrev.value.needsUpdate = true
        material.uniformsNeedUpdate = true

        imagesIndex.current = (imagesIndex.current + 1) % images.current.length

        nextTextureTimerId.current = window.setTimeout(() => {
          nextTexture(images.current[imagesIndex.current]).catch(console.error)
        }, 4000)
      },
    })
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const winWidth = window.innerWidth
    const winHeight = window.innerHeight

    mesh.current.geometry = new PlaneBufferGeometry(winWidth, winHeight, 1, 1)

    mesh.current.material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: {
          value: Date.now(),
        },
        uResolution: {
          value: [winWidth, winHeight],
        },
        uTexturePrev: {
          value: new Texture(),
        },
        uTextureNext: {
          value: new Texture(),
        },
        uTexturePrevResolution: {
          value: [0, 0],
        },
        uTextureNextResolution: {
          value: [0, 0],
        },
        uProgress: {
          value: 0,
        },
      },
    })

    scene.current.add(mesh.current)

    renderer.current = new WebGLRenderer({
      canvas: canvasEl.current as HTMLCanvasElement,
    })

    resetCamera(winWidth, winHeight)
    resetRenderer(winWidth, winHeight)

    window.addEventListener('resize', onResize)

    nextTexture(images.current[imagesIndex.current]).catch(console.error)

    update()

    return () => {
      if (nextTextureTimerId.current !== undefined) {
        clearTimeout(nextTextureTimerId.current)
      }

      window.removeEventListener('resize', onResize)
    }
  }, [onResize, resetCamera, resetRenderer, update, nextTexture])

  return (
    <canvas
      ref={canvasEl}
      className={`${props?.className ?? ''} block`}
    ></canvas>
  )
}
