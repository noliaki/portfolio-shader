export async function loadImage(src: string): Promise<HTMLImageElement> {
  return await new Promise((resolve, reject): void => {
    const img = new Image()

    img.addEventListener(
      'load',
      (_event: Event): void => {
        resolve(img)
      },
      {
        once: true,
      }
    )

    img.addEventListener('error', (event: Event): void => {
      reject(event)
    })

    img.src = src
  })
}
