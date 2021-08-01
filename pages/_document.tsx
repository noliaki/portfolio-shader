import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
  DocumentInitialProps,
} from 'next/document'

class MyDocument extends Document {
  static async getInitialProps(
    ctx: DocumentContext
  ): Promise<DocumentInitialProps> {
    const initialProps = await Document.getInitialProps(ctx)

    return { ...initialProps }
  }

  render(): JSX.Element {
    console.log(this.props.head)

    return (
      <Html lang="ja">
        <Head></Head>
        <body>
          <Main></Main>
          <NextScript></NextScript>
        </body>
      </Html>
    )
  }
}

export default MyDocument
