import Vector2 from "dlib/math/Vector2.js";
import Vector3 from "dlib/math/Vector3.js";
import Vector4 from "dlib/math/Vector4.js";
import Matrix3 from "dlib/math/Matrix3.js";
import Matrix4 from "dlib/math/Matrix4.js";
import GLTexture from "./GLTexture.js";

import Shader from "dlib/3d/Shader.js";

export default class GLProgram extends Shader {
  constructor({gl, vertexShader, fragmentShader, uniforms, attributes, vertexShaderChunks, fragmentShaderChunks, shaders} = {}) {
    super({vertexShader, fragmentShader, uniforms, attributes, vertexShaderChunks, fragmentShaderChunks, shaders});

    let program = gl.createProgram();

    self = this;

    let attributesLocations = new Map();
    class Attributes extends Map {
      set (name , {buffer, location = attributesLocations.get(name), size, type = gl.FLOAT, normalized = false, stride = 0, offset = 0} = {}) {
        if(name instanceof Map) {
          for (let [key, value] of name) {
            this.set(key, value);
          }
          return;
        }
        buffer.bind();
        if(!location) {
          location = gl.getAttribLocation(program, name);
          if(location === -1) {
            console.warn(`Attribute "${name}" is missing or never used`)
          }
          attributesLocations.set(name, location);
        }
        gl.enableVertexAttribArray(location);
        gl.vertexAttribPointer(location, size, type, normalized, stride, offset);
        buffer.unbind();
        super.set(name, {buffer, size, type, normalized, stride, offset});
      }
    }

    let uniformLocations = new Map();
    let uniformTypes = new Map();
    class Uniforms extends Map {
      set (name , ...values) {
        let location = uniformLocations.get(name);
        if(!location) {
          location = gl.getUniformLocation(program, name);
          uniformLocations.set(name, location);
        }
        let type = uniformTypes.get(name);
        if(!type) {
          type = /int|ivec|sampler2D|samplerCube/.test(self._uniformTypes.get(name)) ? "iv" : "fv";
          uniformTypes.set(name, type);
        }
        let value = values[0];
        if(value.length === undefined) {
          if(values.length > 1) {
            value = self.uniforms.get(name);
            value.set(...values);
          } else {
            value = values;
          }
        }
        if(value.length <= 4) {
          gl[`uniform${value.length || 1}${type}`](location, value);
        }
        else if(value.length === 9) {
          gl.uniformMatrix3fv(location, false, value);
        }
        else if(value.length === 16) {
          gl.uniformMatrix4fv(location, false, value);
        }
        super.set(name, value);
      }
    }
    
    this.gl = gl;
    this._program = program;

    this.vertexShader = this.vertexShader;
    this.fragmentShader = this.fragmentShader;

    this.gl.linkProgram(this._program);
    this.use();

    this.attributes = new Attributes();
    this.uniforms = new Uniforms([...this.uniforms]);
  }

  set vertexShader(value) {
    super.vertexShader = value;
    if(this.gl) {
      this._updateShader(this.gl.VERTEX_SHADER, this.vertexShader);
    }
  }

  get vertexShader() {
    return super.vertexShader;
  }

  set fragmentShader(value) {
    super.fragmentShader = value;
    if(this.gl) {
      this._updateShader(this.gl.FRAGMENT_SHADER, this.fragmentShader);
    }
  }

  get fragmentShader() {
    return super.fragmentShader;
  }
  
  use() {
    this.gl.useProgram(this._program);
  }

  _updateShader(type, source) {
    if(!source) {
      return;
    }

    let shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      let error = this.gl.getShaderInfoLog(shader);
      let lineNumber = parseFloat(/ERROR: 0:(\d+):/.exec(error)[1]);
      let shaderLines = source.split("\n");
      console.error(`${error}\nat: ${shaderLines[lineNumber - 1].replace(/^\s*/, "")}`);
    }

    this.gl.attachShader(this._program, shader);
  }

  _parseUniforms(string) {
    super._parseUniforms(string, {
      Vector2,
      Vector3,
      Vector4,
      Matrix3,
      Matrix4,
      GLTexture
    });
  }
}
