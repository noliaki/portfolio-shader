uniform float uTime;
uniform sampler2D uTexture;
uniform vec2 uTextureResolution;
uniform vec2 uResolution;
uniform float uProgress;
uniform float uDiff;
uniform float uStagger;

varying vec2 vUv;
varying float vProgress;
varying vec3 vCenter;

vec3 hsvToRgb(float h, float s, float v){
  vec4 t = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(vec3(h) + t.xyz) * 6.0 - vec3(t.w));

  return v * mix(vec3(t.x), clamp(p - vec3(t.x), 0.0, 1.0), s);
}

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

float cubicBezier(float p0, float c0, float p1, float t) {
  float tn = 1.0 - t;

  return (
    tn * tn * p0 +
    2.0 * tn * t * c0 +
    t * t * p1
  );
}

const float ls = 1.8;
const vec3 dl = vec3(0.3, 0.06, 0.3);
const float maxDelay = 0.6;
const float duration = 1.0 - maxDelay;

void main(void) {
  float cDiff = uDiff * 0.005;

  float noiseR = snoise(vec3(vUv + uStagger, uTime * 0.001));
  float noiseG = snoise(vec3(vUv + uStagger, uTime * 0.002));
  float noiseB = snoise(vec3(vUv + uStagger, uTime * 0.003));

  float rdmR = snoise(vec3(vCenter.xy, uTime * 0.0001)) * 0.1;
  float rdmG = snoise(vec3(vCenter.yx, uTime * 0.0003)) * 0.1;
  float rdmB = snoise(vec3(vCenter.xy, uTime * 0.00001)) * 0.1;

  float rdmT = mod(vUv.y * noiseR, 0.4);

  vec2 uv2 = floor(vUv * 30.0) / 30.0;

  float r = texture2D(uTexture, vUv + cDiff * noiseR).r;
  float g = texture2D(uTexture, vUv + cDiff * noiseG).g;
  float b = texture2D(uTexture, vUv + cDiff * noiseB).b;

  vec4 rColor = vec4(
    r,
    g - pow(cDiff * 0.01, 4.0),
    b,
    1.0
  );

  vec4 mColor = texture2D(uTexture, vUv) + vec4(rdmR, rdmG, rdmB, 0.0);

  gl_FragColor = mix(
    rColor,
    mColor,
    vProgress
  );
}
