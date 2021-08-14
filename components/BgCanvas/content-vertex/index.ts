import source from './vertex.glsl'

import noise3D from '~/webgl-noise/src/noise3D.glsl'

export const vertexShader = `
  ${noise3D}
  ${source}
`
