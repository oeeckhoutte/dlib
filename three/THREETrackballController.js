import { Object3D } from "three/src/core/Object3D.js";
import { Matrix4 as THREEMatrix4 } from "three/src/math/Matrix4.js";

import TrackballController from "../3d/controllers/TrackballController.js";
import Matrix4 from "../math/Matrix4.js";

export default class THREETrackballController extends TrackballController {
  constructor(object3D = new Object3D(), {domElement, distance, distanceStep} = {}) {
    object3D.updateMatrix();
    super(new Matrix4(object3D.matrix.elements), {domElement, distance, distanceStep});
    this._matrix4 = new THREEMatrix4();
    this.object3D = object3D;
  }

  update() {
    this.matrix.x = this.object3D.position.x;
    this.matrix.y = this.object3D.position.y;
    this.matrix.z = this.object3D.position.z;
    super.update();
    this._matrix4.fromArray(this.matrix);
    this.object3D.matrix.identity();
    this.object3D.applyMatrix(this._matrix4);
  }
}