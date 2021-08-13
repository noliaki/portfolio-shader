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
  BufferGeometry,
  BufferAttribute,
  DoubleSide,
} from 'three'
import { gsap } from 'gsap'

import type { Item } from '../../pages/index'

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
  selectedIndex,
}: {
  className?: string
  bgImages: BgImageItem[]
  contentImages: Item[]
  selectedIndex?: number
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
  const modalTween = useRef<gsap.core.Tween | null>(null)

  useEffect(() => {
    console.log('change selectedIndex: ', selectedIndex)
    if (modalTween.current != null) {
      // modalTween.current.pause()
      modalTween.current.kill()
    }

    const meshes = group.current.children as Mesh[]
    const progresses = meshes.map((mesh) => {
      return {
        value:
          (mesh.material as ShaderMaterial).uniforms.uModalProgress.value ?? 0,
      }
    })

    const duration = Math.min(
      Math.max(
        ...meshes.map((mesh: Mesh, index: number) =>
          Math.abs(
            (index === selectedIndex ? 1 : 0) -
              (mesh.material as ShaderMaterial).uniforms.uModalProgress.value
          )
        ),
        0.3
      ),
      0.8
    )
    // meshes.reduce((acc, curr, index) => {
    //   return Math.max(
    //     Math.abs(
    //       (index === selectedIndex ? 1 : 0) -
    //         (curr.material as ShaderMaterial).uniforms.uModalProgress.value
    //     ),
    //     acc
    //   )
    // }, 0.5) * 0.6

    modalTween.current = gsap.to(progresses, {
      value(index: number): number {
        return index === selectedIndex ? 1 : 0
      },
      duration,
      ease: 'power3.out',
      // ease: 'steps(10)',
      onUpdate() {
        meshes.forEach((mesh, index) => {
          ;(mesh.material as ShaderMaterial).uniforms.uModalProgress.value =
            progresses[index]?.value ?? 0
        })
      },
    })
  }, [selectedIndex])

  const update = useCallback(() => {
    const material = mesh.current.material as ShaderMaterial
    const time = start.current - Date.now()
    const diff = scrollTop.current - contentTop.current
    const volume = Math.abs(diff) > 0.0001 ? diff : 0

    vol.current += volume - vol.current
    contentTop.current += volume * 0.2

    material.uniforms.uTime.value = time
    // material.uniformsNeedUpdate = true

    group.current.children.forEach((mesh) => {
      const material = (mesh as Mesh).material as ShaderMaterial

      material.uniforms.uDiff.value = vol.current
      material.uniforms.uTime.value = time
      // material.uniformsNeedUpdate = true
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

    camera.current.near = -10000
    camera.current.far = 10000

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

      if (contentImages != null) {
        contentImages.forEach((item: Item, i) => {
          if (item.el == null) {
            return
          }

          const rect = item.el.getBoundingClientRect()
          const mesh = group.current.children[i] as Mesh

          mesh.geometry = createContentGeometry(rect.width, rect.height)

          mesh.position.x = -winWidth * 0.5 + rect.width * 0.5 + rect.left
          mesh.position.y =
            winHeight * 0.5 - rect.height * 0.5 - (rect.top + scrollTop.current)
        })
      }

      resetRenderer(winWidth, winHeight)
      resetCamera(winWidth, winHeight)
    }, 300)
  }, [resetRenderer, resetCamera, contentImages])

  const onScroll = useCallback(() => {
    scrollTop.current = document.scrollingElement?.scrollTop ?? 0
    group.current.position.y = scrollTop.current
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
      // material.uniformsNeedUpdate = true

      const progress = {
        value: 0,
      }

      gsap.to(progress, {
        value: 1,
        duration: 3,
        ease: 'none',
        onUpdate() {
          material.uniforms.uProgress.value = progress.value
          // material.uniformsNeedUpdate = true
        },
        onComplete() {
          material.uniforms.uProgress.value = 0
          material.uniforms.uTexturePrev.value.image = img
          material.uniforms.uTexturePrevResolution.value = [
            img.naturalWidth,
            img.naturalHeight,
          ]

          material.uniforms.uTexturePrev.value.needsUpdate = true
          // material.uniformsNeedUpdate = true

          imagesIndex.current = (imagesIndex.current + 1) % bgImages.length

          nextTextureTimerId.current = window.setTimeout(() => {
            nextTexture(bgImages[imagesIndex.current]).catch(console.error)
          }, 5500)
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
        uModalProgress: {
          value: 0,
        },
      },
    })

    scene.current.add(mesh.current)
    scene.current.add(group.current)

    renderer.current = new WebGLRenderer({
      canvas: canvasEl.current as HTMLCanvasElement,
    })

    onScroll()
    resetCamera(winWidth, winHeight)
    resetRenderer(winWidth, winHeight)

    if (!contentImages.some((item: Item): boolean => item.el == null)) {
      Promise.all(
        contentImages.map(
          async (item: Item) =>
            await createImageMesh(item, winWidth, winHeight, scrollTop.current)
        )
      )
        .then((result: Mesh[]) => {
          console.log('CREATE')
          group.current.clear()

          result.forEach((mesh) => {
            group.current.add(mesh)
          })
        })
        .catch(console.error)
    }

    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onScroll)

    update()
    nextTexture(bgImages[imagesIndex.current]).catch(console.error)

    return () => {
      if (nextTextureTimerId.current !== undefined) {
        clearTimeout(nextTextureTimerId.current)
      }

      if (rafId.current != null) {
        cancelAnimationFrame(rafId.current)
      }

      renderer.current?.dispose()
      scene.current?.clear()
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
  item: Item,
  winWidth: number,
  winHeight: number,
  scrollTop: number
): Promise<Mesh> {
  const rect = (item.el as HTMLElement).getBoundingClientRect()
  const mesh = new Mesh()

  mesh.position.x = -winWidth * 0.5 + rect.width * 0.5 + rect.left
  mesh.position.y = winHeight * 0.5 - rect.height * 0.5 - (rect.top + scrollTop)

  const img = await loadImage(item.image.url)

  const texture = new Texture()
  texture.image = img
  texture.needsUpdate = true

  mesh.geometry = createContentGeometry(rect.width, rect.height)

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
        value: Math.random() * -2 + 1,
      },
      uModalProgress: {
        value: 0,
      },
    },
    side: DoubleSide,
  })

  return mesh
}

function createContentGeometry(width: number, height: number): BufferGeometry {
  // return new PlaneBufferGeometry(
  //   width,
  //   height,
  //   30,
  //   Math.floor((height / width) * 30)
  // )

  const segmentX = 30
  const segmentY = Math.floor((height / width) * segmentX)
  const geo = new BufferGeometry()

  const top = -(height / 2)
  const left = -(width / 2)

  const position = []
  const center = []
  const uv = []
  // const index = []

  const polygonWidth = width / segmentX
  const polygonHeight = height / segmentY

  for (let i = 0, len = segmentX * segmentY; i < len; i++) {
    const row = Math.floor(i / segmentX)
    const col = i % segmentX

    const x1 = col * polygonWidth + left
    const y1 = row * polygonHeight + top

    const x2 = x1 + polygonWidth
    const y2 = y1

    const x3 = x1
    const y3 = y1 + polygonHeight

    const centerX1 = (x1 + x2 + x3) / 3
    const centerY1 = (y1 + y2 + y3) / 3

    position.push(x1)
    position.push(y1)
    position.push(0)
    uv.push(col / segmentX)
    uv.push(row / segmentY)
    center.push(centerX1)
    center.push(centerY1)
    center.push(0)

    position.push(x2)
    position.push(y2)
    position.push(0)
    uv.push((col + 1) / segmentX)
    uv.push(row / segmentY)
    center.push(centerX1)
    center.push(centerY1)
    center.push(0)

    position.push(x3)
    position.push(y3)
    position.push(0)
    uv.push(col / segmentX)
    uv.push((row + 1) / segmentY)
    center.push(centerX1)
    center.push(centerY1)
    center.push(0)

    const x4 = x2
    const y4 = y1

    const x5 = x4
    const y5 = y4 + polygonHeight

    const x6 = x4 - polygonWidth
    const y6 = y5

    const centerX2 = (x4 + x5 + x6) / 3
    const centerY2 = (y4 + y5 + y6) / 3

    position.push(x4)
    position.push(y4)
    position.push(0)
    uv.push((col + 1) / segmentX)
    uv.push(row / segmentY)
    center.push(centerX2)
    center.push(centerY2)
    center.push(0)

    position.push(x5)
    position.push(y5)
    position.push(0)
    uv.push((col + 1) / segmentX)
    uv.push((row + 1) / segmentY)
    center.push(centerX2)
    center.push(centerY2)
    center.push(0)

    position.push(x6)
    position.push(y6)
    position.push(0)
    uv.push(col / segmentX)
    uv.push((row + 1) / segmentY)
    center.push(centerX2)
    center.push(centerY2)
    center.push(0)
  }

  geo.setAttribute(
    'position',
    new BufferAttribute(new Float32Array(position), 3)
  )
  geo.setAttribute('uv', new BufferAttribute(new Float32Array(uv), 2))
  geo.setAttribute('center', new BufferAttribute(new Float32Array(center), 3))
  geo.setAttribute('index', new BufferAttribute(new Float32Array(uv), 2))

  return geo
}
