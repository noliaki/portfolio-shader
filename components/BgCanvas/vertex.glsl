// attribute float index;
// attribute vec3 center;
// attribute vec3 stagger;

// uniform float time;
// uniform vec2 resolution;
// uniform float progress;
// uniform sampler2D uTexture;
// uniform vec2 uTextureResolution;

varying vec2 vUv;
// varying vec3 vPosition;
// varying float vIndex;
// varying vec3 vStagger;
// varying vec3 vCenter;
// varying vec3 vNormal;
// varying float vDiff;
// varying float vProgress;

// vec3 rotate3d(vec3 p, float angle, vec3 axis){
//   vec3 a = normalize(axis);
//   float s = sin(angle);
//   float c = cos(angle);
//   float r = 1.0 - c;
//   mat3 m = mat3(
//     a.x * a.x * r + c,
//     a.y * a.x * r + a.z * s,
//     a.z * a.x * r - a.y * s,
//     a.x * a.y * r - a.z * s,
//     a.y * a.y * r + c,
//     a.z * a.y * r + a.x * s,
//     a.x * a.z * r + a.y * s,
//     a.y * a.z * r - a.x * s,
//     a.z * a.z * r + c
//   );
//   return m * p;
// }

// vec3 rotateVector(vec4 q, vec3 v) {
//   return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v);
// }

// vec4 quatFromAxisAngle(vec3 axis, float angle) {
//   float halfAngle = angle * 0.5;

//   return vec4(axis.xyz * sin(halfAngle), cos(halfAngle));
// }

// vec3 bezier(vec3 A, vec3 B, vec3 C, float t) {
//   vec3 D = mix(A, B, t);
//   vec3 E = mix(B, C, t);

//   vec3 F = mix(D, E, t);

//   return F;
// }

// vec3 bezier(vec3 A, vec3 B, vec3 C, vec3 D, float t) {
//   vec3 E = mix(A, B, t);
//   vec3 F = mix(B, C, t);
//   vec3 G = mix(C, D, t);

//   vec3 H = mix(E, F, t);
//   vec3 I = mix(F, G, t);

//   vec3 P = mix(H, I, t);

//   return P;
// }

// vec3 cubicBezier(vec3 p0, vec3 c0, vec3 c1, vec3 p1, float t) {
//   float tn = 1.0 - t;

//   return (
//     tn * tn * tn * p0 +
//     3.0 * tn * tn * t * c0 +
//     3.0 * tn * t * t * c1 +
//     t * t * t * p1
//   );
// }

// vec3 cubicBezier(vec3 p0, vec3 c0, vec3 c1, vec3 c2, vec3 p1, float t) {
//   float tn = 1.0 - t;

//   return (
//     tn * tn * tn * tn * p0 +
//     4.0 * tn * tn * tn * t * c0 +
//     4.0 * tn * tn * t * t * c1 +
//     4.0 * tn * t * t * t * c2 +
//     t * t * t * t * p1
//   );
// }

// vec3 quadraticBezier(vec3 p0, vec3 c0, vec3 p1, float t) {
//   float tn = 1.0 - t;

//   return tn * tn * p0 + 2.0 * tn * t * c0 + t * t * p1;
// }

void main(void) {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
