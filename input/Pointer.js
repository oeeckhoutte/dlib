import Vector2 from "../math/Vector2.js";

import Signal from "dlib/utils/Signal";

export default class Pointer extends Vector2 {
  constructor(domElement = document.body) {
    super();

    this.domElement = domElement;
    this.updateDOMElementBoundingRect();

    this.normalized = new Vector2();
    this.normalizedCentered = new Vector2();
    this.normalizedCenteredFlippedY = new Vector2();

    Pointer._pointers.set(this.domElement, this);

    this.onDown = new Signal();
    this.onMove = new Signal();

    this._onPointerMoveBinded = this.onPointerMove.bind(this);
    this._onPointerDownBinded = this.onPointerDown.bind(this);
    this.domElement.addEventListener("touchdown", this._onPointerDownBinded);
    this.domElement.addEventListener("mousedown", this._onPointerDownBinded);
    this.domElement.addEventListener("touchmove", this._onPointerMoveBinded);
    this.domElement.addEventListener("mousemove", this._onPointerMoveBinded);
  }
  updateDOMElementBoundingRect() {
    this._domElementBoundingRect = this.domElement.getBoundingClientRect();
  }
  onPointerDown(e) {
    this._updatePosition(e);
    this.onDown.dispatch();
  }
  onPointerMove(e) {
    this._updatePosition(e);
    this.onMove.dispatch();
  }
  _updatePosition(e) {
    if (!!TouchEvent && e instanceof TouchEvent) {
      e = e.touches[0];
    }
    this.x = e.clientX - this._domElementBoundingRect.left;
    this.y = e.clientY - this._domElementBoundingRect.top;
    this.normalized.x = this.x / this._domElementBoundingRect.width;
    this.normalized.y = this.y / this._domElementBoundingRect.height;
    this.normalizedCentered.x = this.normalizedCenteredFlippedY.x = this.normalized.x * 2 - 1;
    this.normalizedCentered.y = this.normalizedCenteredFlippedY.y = this.normalized.y * 2 - 1;
    this.normalizedCenteredFlippedY.y *= -1;
  }
  dispose() {
    this.domElement.removeEventListener("touchmove", this._onPointerMoveBinded);
    this.domElement.removeEventListener("mousemove", this._onPointerMoveBinded);
  }
  static get(domElement) {
    let pointer = Pointer._pointers.get(domElement);
    if (!pointer) {
      pointer = new Pointer(domElement);
    }
    return pointer;
  }
}

Pointer._pointers = new Map();
