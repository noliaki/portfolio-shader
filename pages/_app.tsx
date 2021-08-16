import type { AppProps } from 'next/app'
import 'tailwindcss/tailwind.css'
import '../styles/globals.css'
import Head from 'next/head'

function PortfolioShader({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width" />
        <meta property="og:url" content="https://portfolio-shader.vercel.app" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Portfolio" />
        <meta
          property="og:image"
          content="https://portfolio-shader.vercel.app/ogp.png"
        />

        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:url"
          content="https://portfolio-shader.vercel.app"
        />
        <meta name="twitter:title" content="Portfolio" />
        <meta
          name="twitter:image"
          content="https://portfolio-shader.vercel.app/ogp.png"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}

export default PortfolioShader
