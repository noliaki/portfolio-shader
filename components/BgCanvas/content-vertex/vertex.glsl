uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uSize;
uniform float uProgress;
uniform float uDiff;
uniform float uStagger;

varying vec2 vUv;

float cubicBezier(float p0, float c0, float p1, float t) {
  float tn = 1.0 - t;

  return (
    tn * tn * p0 +
    2.0 * tn * t * c0 +
    t * t * p1
  );
}

const float maxDelay = 0.6;
const float duration = 1.0 - maxDelay;

void main(void) {
  vUv = uv;

  vec2 p = vec2(
    position.x / (uSize.x * 0.5),
    position.y / (uSize.y * 0.5)
  );
  float noise = snoise(vec3(p * uStagger, uTime / 3000.0));

  vec4 glP = vec4(
    position.x + clamp(uDiff, -200.0, 200.0) * noise,
    position.y + clamp(uDiff, -1000.0, 1000.0) * pow(p.x, 1.5) * (noise + 1.0) * 0.5,
    position.z,
    1.0
  );
  gl_Position = projectionMatrix * modelViewMatrix * glP;
}
