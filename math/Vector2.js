import vec2 from "gl-matrix/src/gl-matrix/vec2.js";

export default class Vector2 extends Float32Array {
  constructor(x = 0, y = 0) {
    super(2);
    this.set(x, y);
    return this;
  }

  get x() {
    return this[0];
  }

  set x(value) {
    this[0] = value;
  }

  get y() {
    return this[1];
  }

  set y(value) {
    this[1] = value;
  }

  set(x, y) {
    vec2.set(this, x, y);
    return this;
  }

  copy(vector2) {
    vec2.copy(this, vector2);
    return this;
  }

  add(vector2) {
    vec2.add(this, this, vector2);
    return this;
  }

  get size() {
    return vec2.length(this);
  }

  get squaredSize() {
    return vec2.squaredLength(this);
  }

  subtract(vector2) {
    vec2.subtract(this, this, vector2);
    return this;
  }

  negate(vector2 = this) {
    vec2.negate(this, vector2);
    return this;
  }

  cross(vector2a, vector2b) {
    vec2.cross(this, vector2a, vector2b);
    return this;
  }

  scale(value) {
    vec2.scale(this, this, value);
    return this;
  }

  normalize() {
    vec2.normalize(this, this);
  }

  dot(vector2) {
    return vec2.dot(this, vector2);
  }

  equals(vector2) {
    return vec2.exactEquals(this, vector2);
  }

  applyMatrix3(matrix3) {
    vec2.transformMat3(this, this, matrix3);
    return this;
  }

  applyMatrix4(matrix4) {
    vec2.transformMat4(this, this, matrix4);
    return this;
  }

  angle(vector2) {
    return vec2.angle(this, vector2);
  }

  lerp(vector2, value) {
    vec2.lerp(this, this, vector2, value);
  }

  clone() {
    return new Vector3(this.x, this.y, this.z);
  }
}
