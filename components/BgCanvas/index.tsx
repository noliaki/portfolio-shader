import { useCallback, useEffect, useRef, useMemo } from 'react'
import {
  Mesh,
  WebGLRenderer,
  Scene,
  OrthographicCamera,
  PlaneBufferGeometry,
  ShaderMaterial,
  Texture,
  Group,
} from 'three'
import { gsap } from 'gsap'

import { vertexShader } from './vertex'
import { fragmentShader } from './fragment'
import { vertexShader as imageVertex } from './content-vertex'
import { fragmentShader as imageFragment } from './content-fragment'

import { debounce, loadImage } from '~/utils'

export interface BgImageItem {
  image: {
    url: string
    width: number
    height: number
  }
}

export function BgCanvas({
  className,
  bgImages,
  contentImages,
}: {
  className?: string
  bgImages: BgImageItem[]
  contentImages: Array<HTMLLIElement | null>
}): JSX.Element {
  const canvasEl = useRef<HTMLCanvasElement | null>(null)
  const renderer = useRef<WebGLRenderer | null>(null)
  const scene = useRef(new Scene())
  const camera = useRef(new OrthographicCamera(0, 0, 0, 0, 0, 1000))
  const mesh = useRef(new Mesh())
  const start = useRef(Date.now())
  const imagesIndex = useRef(0)
  const imageMap = useRef(new Map<string, HTMLImageElement>())
  const nextTextureTimerId = useRef<number | undefined>()
  const group = useRef(new Group())
  const contentTop = useRef(0)
  const scrollTop = useRef(0)
  const vol = useRef(0)
  const rafId = useRef<number>()

  const update = useCallback(() => {
    const material = mesh.current.material as ShaderMaterial
    const time = start.current - Date.now()
    const diff = scrollTop.current - contentTop.current
    const volume = Math.abs(diff) > 0.0001 ? diff : 0

    vol.current += (volume - vol.current) * 0.15

    material.uniforms.uTime.value = time
    material.uniformsNeedUpdate = true

    contentTop.current += volume * 0.1

    group.current.position.y = scrollTop.current

    group.current.children.forEach((mesh) => {
      const material = (mesh as Mesh).material as ShaderMaterial

      material.uniforms.uDiff.value = vol.current
      material.uniforms.uTime.value = time
      material.uniformsNeedUpdate = true
    })

    renderer.current?.render(scene.current, camera.current)

    rafId.current = requestAnimationFrame(() => {
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

      if (contentImages != null) {
        contentImages.forEach((el, i) => {
          if (el == null) {
            return
          }

          const rect = el.getBoundingClientRect()
          const mesh = group.current.children[i] as Mesh

          console.log(rect.top, scrollTop.current)

          mesh.position.x = -winWidth * 0.5 + rect.width * 0.5 + rect.left
          mesh.position.y =
            winHeight * 0.5 - rect.height * 0.5 - (rect.top + scrollTop.current)
        })
      }
    }, 300)
  }, [resetRenderer, resetCamera, contentImages])

  const onScroll = useCallback(() => {
    scrollTop.current = document.scrollingElement?.scrollTop ?? 0
  }, [])

  const nextTexture = useCallback(
    async ({ image }: BgImageItem) => {
      if (nextTextureTimerId.current !== undefined) {
        clearTimeout(nextTextureTimerId.current)
      }

      const img =
        imageMap.current.get(image.url) ?? (await loadImage(image.url))

      imageMap.current.set(image.url, img)

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
        ease: 'none',
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

          imagesIndex.current = (imagesIndex.current + 1) % bgImages.length

          nextTextureTimerId.current = window.setTimeout(() => {
            nextTexture(bgImages[imagesIndex.current]).catch(console.error)
          }, 4000)
        },
      })
    },
    [bgImages]
  )

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

    onScroll()
    resetCamera(winWidth, winHeight)
    resetRenderer(winWidth, winHeight)

    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onScroll)

    nextTexture(bgImages[imagesIndex.current]).catch(console.error)

    update()

    Promise.all(
      contentImages.map(
        async (el: HTMLLIElement | null) =>
          await createImageMesh(
            el as HTMLLIElement,
            winWidth,
            winHeight,
            scrollTop.current
          )
      )
    )
      .then((result: Mesh[]) => {
        console.log('CREATE')
        group.current.clear()

        result.forEach((mesh) => {
          group.current.add(mesh)
        })

        scene.current.add(group.current)
      })
      .catch(console.error)

    return () => {
      if (nextTextureTimerId.current !== undefined) {
        clearTimeout(nextTextureTimerId.current)
      }

      if (rafId.current != null) {
        cancelAnimationFrame(rafId.current)
      }

      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onScroll)
    }
  }, [
    onResize,
    onScroll,
    resetCamera,
    resetRenderer,
    update,
    nextTexture,
    bgImages,
    contentImages,
  ])

  return <canvas ref={canvasEl} className={`${className ?? ''} block`}></canvas>
}

async function createImageMesh(
  el: HTMLLIElement,
  winWidth: number,
  winHeight: number,
  scrollTop: number
): Promise<Mesh> {
  const rect = el.getBoundingClientRect()
  const mesh = new Mesh()

  mesh.position.x = -winWidth * 0.5 + rect.width * 0.5 + rect.left
  mesh.position.y = winHeight * 0.5 - rect.height * 0.5 - (rect.top + scrollTop)

  const src = (el.querySelector('img') as HTMLImageElement).src
  const img = await loadImage(src)

  const texture = new Texture()
  texture.image = img
  texture.needsUpdate = true

  mesh.geometry = new PlaneBufferGeometry(rect.width, rect.height, 100, 1)

  mesh.material = new ShaderMaterial({
    vertexShader: imageVertex,
    fragmentShader: imageFragment,
    uniforms: {
      uTime: {
        value: Date.now(),
      },
      uTexture: {
        value: texture,
      },
      uResolution: {
        value: [winWidth, winHeight],
      },
      uSize: {
        value: [rect.width, rect.height],
      },
      uDiff: {
        value: 0,
      },
      uStagger: {
        value: Math.random(),
      },
    },
  })

  return mesh
}
