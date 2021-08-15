import Head from 'next/head'
import { useCallback, useRef, useState, useEffect } from 'react'
import { gsap } from 'gsap'

import { BgCanvas } from '../components/BgCanvas'

import { fetchGraphQL } from '~/lib/api'

export interface ItemImage {
  size: number
  url: string
  width: number
  height: number
}

export interface ItemData {
  title: string
  url: string
  description: string
  image: ItemImage
}

export interface Item {
  image: ItemImage
  el: HTMLElement | null
}

export default function Home(props: any): JSX.Element {
  const items = useRef<Item[]>(
    props.items.map((item: ItemData): Item => ({ image: item.image, el: null }))
  )
  const [selectedIndex, setSelectedIndex] = useState<number | undefined>(
    undefined
  )

  const tls = useRef<Map<number, gsap.core.Timeline>>(new Map())

  const createTl = useCallback(
    (el: HTMLElement | null, index: number): void => {
      console.log('createTl')

      if (el == null) {
        return
      }

      const title = el.querySelector('.title')
      const titleText = el.querySelector('.title-text')
      const titleCover = el.querySelector('.title-cover')

      const desc = el.querySelector('.desc')
      const descText = el.querySelector('.desc-text')
      const descCover = el.querySelector('.desc-cover')

      const btn = el.querySelector('.btn')
      const btnAnchor = el.querySelector('.btn-anchor')
      const btnCover = el.querySelector('.btn-cover')

      gsap.set([titleText, descText, btnAnchor], {
        visibility: 'hidden',
      })
      gsap.set([titleCover, descCover, btnCover], {
        transformOrigin: '0% 50%',
        scaleX: 0,
      })

      const tl = gsap
        .timeline({
          defaults: {
            duration: 0.3,
            ease: 'expo.inOut',
          },
        })
        .fromTo(
          title,
          {
            x: 100,
          },
          { x: 0 },
          'title'
        )
        .fromTo(
          titleCover,
          {
            scaleX: 0,
          },
          {
            scaleX: 1,
          },
          'title'
        )
        .set(titleCover, {
          transformOrigin: '0% 50%',
        })
        .set(titleText, {
          visibility: 'hidden',
        })
        .set(titleText, {
          visibility: 'visible',
        })
        .set(titleCover, {
          transformOrigin: '100% 50%',
        })
        .fromTo(
          titleCover,
          {
            scaleX: 1,
          },
          {
            scaleX: 0,
          }
        )
        .fromTo(
          desc,
          {
            x: 100,
          },
          { x: 0 },
          'title+=0.08'
        )
        .fromTo(
          descCover,
          {
            scaleX: 0,
          },
          {
            scaleX: 1,
          },
          'title+=0.08'
        )
        .set(descCover, {
          transformOrigin: '0% 50%',
        })
        .set(descText, {
          visibility: 'hidden',
        })
        .set(descText, {
          visibility: 'visible',
        })
        .set(descCover, {
          transformOrigin: '100% 50%',
        })
        .fromTo(
          descCover,
          {
            scaleX: 1,
          },
          {
            scaleX: 0,
          }
        )
        .fromTo(
          btn,
          {
            x: 100,
          },
          { x: 0 },
          'title+=0.2'
        )
        .fromTo(
          btnCover,
          {
            scaleX: 0,
          },
          {
            scaleX: 1,
          },
          'title+=0.2'
        )
        .set(btnCover, {
          transformOrigin: '0% 50%',
        })
        .set(btnAnchor, {
          visibility: 'hidden',
        })
        .set(btnAnchor, {
          visibility: 'visible',
        })
        .set(btnCover, {
          transformOrigin: '100% 50%',
        })
        .fromTo(
          btnCover,
          {
            scaleX: 1,
          },
          {
            scaleX: 0,
          }
        )

      tl.progress(1)
      tl.pause(0)
      tls.current.set(index, tl)
    },
    []
  )

  const onActivate = useCallback((index: number): void => {
    setSelectedIndex(index)

    tls.current.forEach((tl: gsap.core.Timeline | null, key: number): void => {
      if (key === index) {
        tl?.play()
      } else {
        tl?.reverse()
      }
    })
  }, [])

  const onDeactivate = useCallback(() => {
    setSelectedIndex(undefined)

    tls.current.forEach((tl: gsap.core.Timeline | null): void => {
      tl?.reverse()
    })
  }, [])

  useEffect(() => {
    items.current.forEach((item: Item, index: number) => {
      createTl(item.el, index)
    })
  }, [])

  return (
    <>
      <Head>
        <title>Portfolio Shader</title>
        <meta name="description" content="いろいろ作ったやつ一覧" />
      </Head>
      <BgCanvas
        className="fixed inset-0 w-full h-full pointer-events-none"
        bgImages={props.bgImages}
        contentImages={items.current}
        selectedIndex={selectedIndex}
      />
      <section className="max-w-screen-md mx-auto sm:p-10 p-6">
        {props.items.map((itemData: ItemData, index: number) => {
          const classNames = ['content-item', 'relative']

          if (index !== 0) {
            classNames.push('md:mt-24')
            classNames.push('mt-10')
          }

          if (index === selectedIndex) {
            classNames.push('z-10')
          }

          return (
            <article
              key={itemData.title}
              className={classNames.join(' ')}
              ref={(ref) => {
                items.current[index].el = ref
              }}
              onMouseEnter={() => onActivate(index)}
              onMouseLeave={onDeactivate}
            >
              <div className="absolute top-1 -left-3 sm:top-6 sm:-left-10 whitespace-pre-wrap">
                <div>
                  <h1 className="title inline-block relative text-3xl sm:text-6xl overflow-hidden">
                    <span className="title-text inline-block bg-white py-1 px-2">
                      {itemData.title}
                    </span>
                    <span className="title-cover block absolute inset-0 w-full h-full bg-purple-900"></span>
                  </h1>
                </div>
                <div className="mt-2 max-w-md sm:text-sm overflow-hidden">
                  <div className="desc inline-block overflow-hidden relative">
                    <span className="desc-text inline-block bg-white py-1 px-2">
                      {itemData.description}
                    </span>
                    <span className="desc-cover block absolute inset-0 w-full h-full bg-purple-500"></span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="btn inline-block relative overflow-hidden sm:text-sm">
                    <a
                      href={itemData.url}
                      target="_blank"
                      className="btn-anchor bg-purple-700 inline-block px-2 py-1 text-white hover:text-purple-900 hover:bg-white"
                      rel="noreferrer noopener"
                    >
                      見る
                    </a>
                    <span className="btn-cover block absolute inset-0 w-full h-full bg-purple-100"></span>
                  </div>
                </div>
              </div>
            </article>
          )
        })}
      </section>
      <div
        className="fixed bottom-1 left-0 "
        style={{
          textOrientation: 'upright',
          writingMode: 'vertical-rl',
          textAlign: 'right',
        }}
      >
        <a
          href="https://noliaki.netlify.app/product"
          target="_blank"
          rel="noreferrer"
          className="bg-purple-600 text-white hover:text-purple-900 hover:bg-white"
        >
          他作品
        </a>
      </div>
    </>
  )
}

export async function getStaticProps(): Promise<any> {
  const bgImages = await fetchGraphQL(
    `{
      backgroundImageCollection {
        items {
          image {
            url
            width
            height
          }
        }
      }
    }`
  )

  const items = await fetchGraphQL(
    `{
      artCollection {
        items {
          title
          url
          description
          image {
            size
            url
            width
            height
          }
        }
      }
    }`
  )

  return {
    props: {
      bgImages: bgImages?.data?.backgroundImageCollection?.items ?? [],
      items: items?.data?.artCollection?.items ?? [],
    },
  }
}
