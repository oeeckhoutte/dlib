import { ShaderMaterial, ShaderLib, UniformsUtils } from "three";

import THREEShader from "./THREEShader.js";

export default class THREEShaderMaterial extends ShaderMaterial {
  constructor (options = {}) {
    let type = options.type || "";
    let vertexShaderChunks = options.vertexShaderChunks;
    let fragmentShaderChunks = options.fragmentShaderChunks;
    let uniforms = options.uniforms;
    let shaders = options.shaders || [];

    options = Object.assign({}, options);
    delete options.type;
    delete options.vertexShaderChunks;
    delete options._vertexShaderChunks;
    delete options._vertexShader;
    delete options.fragmentShaderChunks;
    delete options._fragmentShaderChunks;
    delete options._fragmentShader;
    delete options.uniforms;
    delete options.attributes;
    delete options.shaders;

    let shader = new THREEShader({
      vertexShader: options.vertexShader || (type ? ShaderLib[type].vertexShader : undefined),
      fragmentShader: options.fragmentShader || (type ? ShaderLib[type].fragmentShader : undefined),
      uniforms: type ? UniformsUtils.clone(ShaderLib[type].uniforms) : undefined
    });

    super(Object.assign({
      fragmentShader: shader.fragmentShader,
      vertexShader: shader.vertexShader,
      uniforms: shader.uniforms
    }, options));

    this._shader = shader;
    this.add({vertexShaderChunks, fragmentShaderChunks, uniforms});

    for (let shader of shaders) {
      this.add(shader);
    }

    this.lights = /lambert|phong|standard/.test(type);
  }

  add({vertexShaderChunks, fragmentShaderChunks, uniforms}) {
    this._shader.add({vertexShaderChunks, fragmentShaderChunks, uniforms});

    this.fragmentShader = this._shader.fragmentShader;
    this.vertexShader = this._shader.vertexShader;

    for (let name in this._shader.uniforms) {
      let key = name; // Firefox fix
      this.uniforms[key] = this._shader.uniforms[key];
      Object.defineProperty(this, key, {
        configurable: true,
        get: function() { 
          return this.uniforms[key].value;
        },
        set: function(value) {
          this.uniforms[key].value = value;
        }
      });
    }

    this.needsUpdate = true;
  }
}
