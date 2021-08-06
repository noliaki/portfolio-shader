import source from './vertex.glsl'

import sineInOut from '~/glsl-easings/sine-in-out.glsl'
import cubicOut from '~/glsl-easings/cubic-out.glsl'
import noise3D from '~/webgl-noise/src/noise3D.glsl'

export const vertexShader = `
  ${sineInOut}
  ${cubicOut}
  ${noise3D}
  ${source}
`
