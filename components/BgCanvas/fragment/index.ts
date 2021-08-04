import source from './fragment.glsl'

import noise3D from '~/webgl-noise/src/noise3D.glsl'

export const fragmentShader = `
  ${noise3D}
  ${source}
`
