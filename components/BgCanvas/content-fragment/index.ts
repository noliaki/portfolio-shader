import source from './fragment.glsl'

import sineInOut from '~/glsl-easings/sine-in-out.glsl'
import noise3D from '~/webgl-noise/src/noise3D.glsl'

export const fragmentShader = `
  ${sineInOut}
  ${noise3D}
  ${source}
`
