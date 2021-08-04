import type { AppProps } from 'next/app'
import 'tailwindcss/tailwind.css'
import '../styles/globals.css'
import Head from 'next/head'

function PortfolioShader({ Component, pageProps }: AppProps): JSX.Element {
  console.log('pageProps', pageProps)

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Component {...pageProps} />
    </>
  )
}

export default PortfolioShader
