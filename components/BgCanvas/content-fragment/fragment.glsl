uniform float uTime;
uniform sampler2D uTexture;
uniform float uProgress;
uniform float uDiff;
uniform float uStagger;

varying vec2 vUv;
varying float vProgress;
varying vec3 vCenter;

float rand(vec2 co) {
  float a = fract(dot(co, vec2(2.067390879775102, 12.451168662908249))) - 0.5;
  float s = a * (6.182785114200511 + a * a * (-38.026512460676566 + a * a * 53.392573080032137));
  float t = fract(s * 43758.5453);

  return t;
}

vec2 imageRatio(vec2 resolution, vec2 imageResolution) {
  return vec2(
    min((resolution.x / resolution.y) / (imageResolution.x / imageResolution.y), 1.0),
    min((resolution.y / resolution.x) / (imageResolution.y / imageResolution.x), 1.0)
  );
}

vec2 imageUv(vec2 resolution, vec2 imageResolution, vec2 uv){
  vec2 ratio = imageRatio(resolution, imageResolution);

  return vec2(
    uv.x * ratio.x + (1.0 - ratio.x) * 0.5,
    uv.y * ratio.y + (1.0 - ratio.y) * 0.5
  );
}

void main(void) {
  float cDiff = uDiff * 0.005;
  float time = uTime * 0.001;

  float noiseR = snoise(vec3(vUv + uStagger, time)) * cDiff;
  float noiseG = snoise(vec3(vUv + uStagger, time * 2.0)) * cDiff;
  float noiseB = snoise(vec3(vUv + uStagger, time * 3.0)) * cDiff;

  float rdmR = (snoise(vec3(vCenter.xy, time * 0.1)) + 1.0) * 0.5 * 0.3;
  float rdmG = snoise(vec3(vCenter.yx, time * 0.3)) * 0.3;
  float rdmB = (snoise(vec3(vCenter.yx, time * 0.1)) + 1.0) * 0.5 * 0.3;

  float rdmT = ((rand(vUv) - 0.5) * 2.0) * 0.003;

  float r = texture2D(uTexture, vUv + noiseR).r;
  float g = texture2D(uTexture, vUv + noiseG).g;
  float b = texture2D(uTexture, vUv + noiseB).b;

  vec4 rColor = vec4(
    r,
    g - pow(cDiff * 0.01, 4.0),
    b,
    1.0
  );

  vec4 mColor = texture2D(uTexture, vUv + rdmT) + vec4(rdmR, rdmG, rdmB, 0.0);

  gl_FragColor = mix(
    rColor,
    mColor,
    vProgress
  );
}
