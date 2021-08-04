uniform float uTime;
uniform sampler2D uTexturePrev;
uniform sampler2D uTextureNext;
uniform vec2 uTexturePrevResolution;
uniform vec2 uTextureNextResolution;
uniform vec2 uResolution;
uniform float uProgress;
// uniform vec2 resolution;
// uniform vec2 uTextureResolution;

varying vec2 vUv;
// varying vec3 vPosition;
// varying float vIndex;
// varying vec3 vCenter;
// varying float vDiff;
// varying vec3 vNormal;
// varying float vProgress;

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
// const vec4 dl = vec4(0.2, 0.06, 0.1, 1.0);
const vec4 dl = vec4(0.3, 0.06, 0.3, 1.0);
const float maxDelay = 0.6;
const float duration = 1.0 - maxDelay;

void main(void) {
  float noise = snoise(vec3(vUv, uTime / 12000.0));
  float fNoise = ((noise + 1.0) * 0.5);

  float delay = (vUv.x + vUv.y) * 0.5 * maxDelay;
  float tProgress = clamp(sineInOut(uProgress) - delay, 0.0, duration) / duration;

  float tBezier = cubicBezier(0.0, 1.0 + fNoise * 4.0, 0.0, sineInOut(tProgress));

  float stagger = (tBezier * noise + 1.0);

  vec2 prevUv = imageUv(uResolution, uTexturePrevResolution, vUv) * stagger;
  vec2 nextUv = imageUv(uResolution, uTextureNextResolution, vUv) * stagger;

  float noiseR = snoise(vec3(vUv, uTime / 5000.0)) * 0.07;
  float noiseG = snoise(vec3(vUv, uTime / 2500.0)) * 0.07;
  float noiseB = snoise(vec3(vUv, uTime / 5500.0)) * 0.07;

  float pr = texture2D(uTexturePrev, prevUv + noiseR).r;
  float pg = texture2D(uTexturePrev, prevUv + noiseG).g;
  float pb = texture2D(uTexturePrev, prevUv + noiseB).b;

  float nr = texture2D(uTextureNext, nextUv + noiseR).r;
  float ng = texture2D(uTextureNext, nextUv + noiseG).g;
  float nb = texture2D(uTextureNext, nextUv + noiseB).b;

  vec4 darkness = dl * (tBezier * 2.0 + 1.0);

  vec4 prevColor = vec4(pr, pg, pb, 1.0) * darkness;
  vec4 nextColor = vec4(nr, ng, nb, 1.0) * darkness;

  // vec4 prevOrigColor = texture2D(uTexturePrev, prevUv) * dl;
  // vec4 nextOrigColor = texture2D(uTextureNext, nextUv) * dl;



  // float t = (sin(uTime / 2000.0) + 1.0) * 0.5;

  // vec4 prevChange = mix(prevColor, prevOrigColor, t);
  // vec4 nextChange = mix(nextColor, nextOrigColor, t);

  gl_FragColor = mix(prevColor, nextColor, tProgress);
}
