import Head from 'next/head'
// import Image from 'next/image'
import { useCallback, useRef, useState } from 'react'

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
  el: HTMLLIElement | null
}

export default function Home(props: any): JSX.Element {
  const items = useRef<Item[]>(
    props.items.map((item: ItemData): Item => ({ image: item.image, el: null }))
  )
  const [selectedIndex, setSelectedIndex] = useState<number | undefined>(
    undefined
  )

  const onMouseEnter = useCallback((index: number): void => {
    console.log(index)
    setSelectedIndex(index)
  }, [])

  const onMouseLeave = useCallback(() => {
    setSelectedIndex(undefined)
  }, [])

  return (
    <article>
      <Head>
        <title>Portfolio Shader</title>
        <meta name="description" content="Generated by create next app" />
      </Head>
      <BgCanvas
        className="fixed inset-0 w-full h-full pointer-events-none"
        bgImages={props.bgImages}
        contentImages={items.current}
        selectedIndex={selectedIndex}
      />
      <section
        className="fixed bottom-1 left-0 "
        style={{
          textOrientation: 'upright',
          writingMode: 'vertical-rl',
          textAlign: 'right',
        }}
      >
        <div>
          <a
            href="https://noliaki.netlify.app/about"
            target="_blank"
            rel="noreferrer"
            className="bg-black text-white hover:bg-white hover:text-black"
          >
            山田 典明
          </a>
        </div>
        <div>
          <a
            href="https://noliaki.netlify.app/product"
            target="_blank"
            rel="noreferrer"
            className="bg-purple-600 hover:bg-purple-50"
          >
            他作品
          </a>
        </div>
      </section>
      <section className="container max-w-screen-md mx-auto py-10">
        <ul>
          {props.items.map((itemData: ItemData, index: number) => {
            const classNames = ['relative']

            if (index !== 0) {
              classNames.push('mt-24')
            }

            if (selectedIndex === index) {
              classNames.push('is-active')
            }

            return (
              <li
                key={itemData.url}
                className={classNames.join(' ')}
                ref={(ref) => (items.current[index].el = ref)}
              >
                <dl className="absolute top-6 -left-6 max-w-full content whitespace-pre-line">
                  <dt>
                    <span>{itemData.title}</span>
                  </dt>
                  <dd>{itemData.description}</dd>
                  <dd>
                    <a
                      href={itemData.url}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      見る
                    </a>
                  </dd>
                </dl>
                <button
                  type="button"
                  className="block relative btn"
                  onMouseEnter={() => onMouseEnter(index)}
                  onMouseLeave={onMouseLeave}
                ></button>
              </li>
            )
          })}
        </ul>
      </section>
    </article>
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
