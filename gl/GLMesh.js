import GLBuffer from "./GLBuffer.js";

export default class GLMesh {
  constructor({gl, positions, uvs, normals, indices} = {}) {
    this.gl = gl;

    this.gl.getExtension("OES_element_index_uint");

    this.attributes = new Map();

    if(positions) {
      this.attributes.set("position", {
        buffer: new GLBuffer({
          gl: this.gl, 
          data: positions
        }),
        count: positions.length / 3,
        size: 3
      });
    }

    if(normals) {
      this.attributes.set("normal", {
        buffer: new GLBuffer({
          gl: this.gl, 
          data: normals
        }),
        count: normals.length / 3,
        size: 3
      });
    }

    if(uvs) {
      this.attributes.set("uv", {
        buffer: new GLBuffer({
          gl: this.gl,
          data: uvs
        }),
        count: uvs.length / 2,
        size: 2
      });
    }

    if(indices) {
      this.setIndicesData({
        data: indices,
        count: indices.length
      });
    }
  }

  setIndicesData({data, offset = 0, count = 0} = {}) {
    this.indices = {
      buffer: new GLBuffer({
        gl: this.gl,
        data,
        target: this.gl.ELEMENT_ARRAY_BUFFER
      }),
      offset,
      count
    }
  }

  bind() {
    for (let attribute of this.attributes.values()) {
      attribute.buffer.bind();
    }

    if(this.indices.buffer) {
      this.indices.buffer.bind();
    }
  }

  unbind() {
    for (let attribute of this.attributes.values()) {
      attribute.buffer.unbind();
    }
    
    if(this.indices.buffer) {
      this.indices.buffer.unbind();
    }
  }

  draw ({
    mode = this.gl.TRIANGLES, 
    elements = !!this.indices.buffer,
    count = elements ? this.indices.count : this.attributes.get("position").count, 
    offset = this.indices.offset,
    first = 0
  } = {}) {
    if(elements) {
      let type = count > 65535 ? this.gl.UNSIGNED_INT : this.gl.UNSIGNED_SHORT;
      this.gl.drawElements(mode, count, type, offset);
    } else {
      this.gl.drawArrays(mode, first, count);
    }
  }
};
