import { ArcRotateCamera, PointerEventTypes, UniversalCamera } from '@babylonjs/core'
import { TP_MOUSE_MAX_SENSIBILITY, TP_MOUSE_MIN_SENSIBILITY, FP_MOUSE_MAX_SENSIBILITY, FP_MOUSE_MIN_SENSIBILITY } from '../config'
import { KeyCode, MouseButton } from '../config/keyboard'
import Main from './Main'
import CameraManager from './CameraManager'

class InputManager {

  private static instance: InputManager

  isLMDown = false

  isRMDown = false

  keyState: Record<string, boolean> = {}

  constructor() {

    InputManager.instance = this

    this.initKeyboardEvent()

    this.initPointerObserver()

  }

  initKeyboardEvent() {
    const scene = Main.getScene()

    window.addEventListener('keydown', ({ code, repeat }) => {
      if (repeat) return

      this.keyState[code] = true

      const { activeCamera } = scene

      if (code === KeyCode.TAB) {
        const targetCameraIndex = scene.cameras.findIndex(item => activeCamera === item)
        scene.activeCamera = scene.cameras[(targetCameraIndex + 1) % scene.cameras.length]
        return
      }

      if (code === KeyCode.C) {
        scene.debugLayer.isVisible()
          ? scene.debugLayer.hide()
          : scene.debugLayer.show()
        return
      }

      if (code === KeyCode.V) {
        if (CameraManager.isFpCamera(activeCamera!)) {
          scene.activeCamera = CameraManager.getTpCamera()
        } else if (CameraManager.isTpCamera(activeCamera!)) {
          scene.activeCamera = CameraManager.getFpCamera()
        }
        return
      }

      if (code === KeyCode.PAGE_UP) {
        if (activeCamera instanceof ArcRotateCamera) {
          activeCamera.angularSensibilityX = activeCamera.angularSensibilityY -= (activeCamera.angularSensibilityX > TP_MOUSE_MAX_SENSIBILITY && 50 || 0)
        } else if (activeCamera instanceof UniversalCamera) {
          activeCamera.angularSensibility -= (activeCamera.angularSensibility > FP_MOUSE_MAX_SENSIBILITY && 100 || 0)
          console.log(activeCamera.angularSensibility)
        }
        return
      }

      if (code === KeyCode.PAGE_DOWN) {
        if (activeCamera instanceof ArcRotateCamera) {
          activeCamera.angularSensibilityX = activeCamera.angularSensibilityY += (activeCamera.angularSensibilityX < TP_MOUSE_MIN_SENSIBILITY && 50 || 0)
        } else if (activeCamera instanceof UniversalCamera) {
          activeCamera.angularSensibility += (activeCamera.angularSensibility < FP_MOUSE_MIN_SENSIBILITY && 100 || 0)
          console.log(activeCamera.angularSensibility)
        }
        return
      }

    })

    window.addEventListener('keyup', ({ code }) => {

      delete this.keyState[code]

    })
  }

  initPointerObserver() {
    const scene = Main.getScene()
    scene.onPointerObservable.add((e) => {
      const { type, event } = e
      if (type === PointerEventTypes.POINTERDOWN) {
        if (event.button === MouseButton.LEFT) {
          this.isLMDown = true
        } else if (event.button === MouseButton.RIGHT) {
          this.isRMDown = true
        }
      } else if (type === PointerEventTypes.POINTERUP) {
        if (event.button === MouseButton.LEFT) {
          this.isLMDown = false
        } else if (event.button === MouseButton.RIGHT) {
          this.isRMDown = false
        }
      }
    }, PointerEventTypes.POINTERDOWN | PointerEventTypes.POINTERUP)
  }

  static getMouseState() {
    return [
      this.instance.isLMDown,
      this.instance.isRMDown
    ]
  }

  static getKeyState() {
    return this.instance.keyState
  }

  static clearKeyState() {
    for (const key of Object.keys(this.instance.keyState)) {
      delete this.instance.keyState[key]
    }
    this.instance.isLMDown = this.instance.isRMDown = false
  }
}

export default InputManager
