attribute vec3 center;

uniform float uTime;
uniform vec2 uSize;
uniform float uProgress;
uniform float uDiff;
uniform float uStagger;
uniform float uModalProgress;

varying vec2 vUv;
varying float vProgress;
varying vec3 vCenter;

vec4 quatFromAxisAngle(vec3 axis, float angle) {
  float halfAngle = angle * 0.5;

  return vec4(axis.xyz * sin(halfAngle), cos(halfAngle));
}

vec3 rotateVector(vec4 q, vec3 v) {
  return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v);
}

float cubicBezier(float p0, float c0, float p1, float t) {
  float tn = 1.0 - t;

  return (
    tn * tn * p0 +
    2.0 * tn * t * c0 +
    t * t * p1
  );
}

vec3 cubicBezier(vec3 p0, vec3 c0, vec3 p1, float t) {
  float tn = 1.0 - t;

  return (
    tn * tn * p0 +
    2.0 * tn * t * c0 +
    t * t * p1
  );
}

vec3 cubicBezier(vec3 p0, vec3 c0, vec3 c1, vec3 p1, float t) {
  float tn = 1.0 - t;

  return (
    tn * tn * tn * p0 +
    3.0 * tn * tn * t * c0 +
    3.0 * tn * t * t * c1 +
    t * t * t * p1
  );
}

vec3 cubicBezier(vec3 p0, vec3 c0, vec3 c1, vec3 c2, vec3 p1, float t) {
  float tn = 1.0 - t;

  return (
    tn * tn * tn * tn * p0 +
    4.0 * tn * tn * tn * t * c0 +
    4.0 * tn * tn * t * t * c1 +
    4.0 * tn * t * t * t * c2 +
    t * t * t * t * p1
  );
}

float rand(vec2 co) {
  float a = fract(dot(co, vec2(2.067390879775102, 12.451168662908249))) - 0.5;
  float s = a * (6.182785114200511 + a * a * (-38.026512460676566 + a * a * 53.392573080032137));
  float t = fract(s * 43758.5453);

  return t;
}

const float maxDelay = 0.6;
const float duration = 1.0 - maxDelay;
const vec3 modalScale = vec3(1.05, 1.05, 1.0);

void main(void) {
  vec2 p = vec2(
    position.x / (uSize.x * 0.5),
    position.y / (uSize.y * 0.5)
  );
  float noise = snoise(vec3(p, uTime / 3000.0));
  float clampedDiff = uDiff / 600.0;

  vec3 axis = vec3(
    (snoise(vec3(position.xy, uTime / 530.0)) + 1.0) * 0.5,
    (snoise(vec3(position.xy, uTime / 630.0)) + 1.0) * 0.5,
    (snoise(vec3(position.xy, uTime / 500.0)) + 1.0) * 0.5
  );
  float rad = radians(cubicBezier(0.0, 359.0, 0.0, uModalProgress));
  vec4 quat = quatFromAxisAngle(axis, rad);

  vec3 orig = position - center;
  vec3 transformed = rotateVector(quat, orig) + center;

  vec3 glP = vec3(
    position.x + pow(clampedDiff, 2.0) * 100.0 * p.x * pow(p.y, 4.0),
    position.y + clampedDiff * 100.0 * (noise + 1.0),
    position.z
  );

  vec2 dp = vec2(
    (center.x / (uSize.x * 0.5) + 1.0) * 0.5,
    (center.y / (uSize.y * 0.5) + 1.0) * 0.5
  );

  float delay = ((dp.x + dp.y) * 0.5) * maxDelay;
  float tProgress = (clamp(uModalProgress - delay, 0.0, duration) / duration);
  float progressBezier = cubicBezier(0.0, 2.5, 1.0, tProgress);

  vec3 result = cubicBezier(
    glP,
    transformed * (snoise(vec3(position.xy, uTime / 1000.0)) + 1.0),
    position * modalScale,
    progressBezier
  );

  vProgress = progressBezier;
  vCenter = center;
  vUv = uv;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(result, 1.0);
}
