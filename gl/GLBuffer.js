export default class GLBuffer {
  constructor({gl, data, size, target = gl.ARRAY_BUFFER, usage = gl.STATIC_DRAW} = {}) {
    this.gl = gl;
    this._data = data;
    this._target = target;

    this._buffer = this.gl.createBuffer();

    this.bind();
    this.gl.bufferData(this._target, this._data || size, usage);
    this.unbind();
  }

  get data() {
    return this._data;
  }

  bind() {
    this.gl.bindBuffer(this._target, this._buffer);
  }

  unbind() {
    this.gl.bindBuffer(this._target, null);
  }
};
