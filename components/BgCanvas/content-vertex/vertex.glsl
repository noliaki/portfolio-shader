attribute vec3 center;

uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uSize;
uniform float uProgress;
uniform float uDiff;
uniform float uStagger;
uniform float uModalProgress;

varying vec2 vUv;
varying float vProgress;

vec4 quatFromAxisAngle(vec3 axis, float angle) {
  float halfAngle = angle * 0.5;

  return vec4(axis.xyz * sin(halfAngle), cos(halfAngle));
}

vec3 rotateVector(vec4 q, vec3 v) {
  return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v);
}

// float cubicBezier(float p0, float c0, float p1, float t) {
//   float tn = 1.0 - t;

//   return (
//     tn * tn * p0 +
//     2.0 * tn * t * c0 +
//     t * t * p1
//   );
// }

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

const float maxDelay = 0.5;
const float duration = 1.0 - maxDelay;

void main(void) {
  vUv = uv;

  vec2 p = vec2(
    position.x / (uSize.x * 0.5),
    position.y / (uSize.y * 0.5)
  );
  float noise = snoise(vec3(p, uTime / 3000.0));

  float clampedDiff = uDiff / 600.0;

  float xOffset = clampedDiff * 0.1;
  float yOffset = clampedDiff * 0.25;


  vec3 axis = vec3(
    (snoise(vec3(position.xy, uTime / 530.0)) + 1.0) * 0.5,
    (snoise(vec3(position.xy, uTime / 630.0)) + 1.0) * 0.5,
    (snoise(vec3(position.xy, uTime / 500.0)) + 1.0) * 0.5
    // 1.0
    // 0.0,
    // 0.0,
    // 1.0
  );
  float rad = radians(270.0);
  vec4 quat = quatFromAxisAngle(axis, rad);

  vec3 orig = position - center;
  vec3 transformed = rotateVector(quat, orig) + center;

  // vec3 offset = cubicBezier(
  //   vec3(0),
  //   vec3((center * 10.0).xy, 0.0),
  //   vec3((center * -50.0).xy, 0.0),
  //   vec3((center * -8.0).xy, 0.0),
  //   vec3(0),
  //   clamp(abs(clampedDiff), 0.0, 1.0)
  // );

  // vec4 glP = vec4(
  //   position.x + xOffset * noise,
  //   position.y + yOffset * pow(p.x + uStagger * 0.3, 2.0) * noise,
  //   position.z,
  //   1.0
  // );
  vec3 glP = vec3(
    position.x + pow(clampedDiff, 2.0) * 100.0 * p.x * pow(p.y, 4.0),
    position.y + clampedDiff * 100.0 * (noise + 1.0),
    position.z
  );

  vec2 dp = vec2(
    (center.x / (uSize.x * 0.5) + 1.0) * 0.5,
    (center.y / (uSize.y * 0.5) + 1.0) * 0.5
  );

  float delay = ((uv.x + uv.y) * 0.5) * maxDelay;
  float tProgress = sineInOut(clamp((uModalProgress) - delay, 0.0, duration) / duration);

  vec3 result = cubicBezier(
    glP,
    // transformed * 3.0 * pow(snoise(vec3(center.xy, uTime / 1000.0)), 2.0),
    // transformed * (snoise(vec3(center.xy, uTime / 1000.0)) + 1.0),
    vec3(transformed.xy * 1.05, transformed.z),
    position,
    tProgress
  );

  vProgress = tProgress;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(result, 1.0);
}
