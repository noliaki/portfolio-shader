import type { AppProps /*, AppContext */ } from 'next/app'
import 'tailwindcss/tailwind.css'
import Head from 'next/head'

import { BgCanvas } from '../components/BgCanvas'

function App({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <BgCanvas className="fixed inset-0 w-full h-full pointer-events-none" />
      <Component {...pageProps} />
    </>
  )
}

export default App
