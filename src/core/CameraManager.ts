import { ArcRotateCamera, Camera, FlyCamera, Tools, UniversalCamera, Vector2, Vector3, type Nullable } from '@babylonjs/core'
import { EntityMap } from '../config/option'
import Main from './Main'
import Player from '../entities/Player'
import type { IFpCameraShakeState } from '../types'
import { NEAR_PLANE } from '../config'


class CameraManager {

  private static instance: CameraManager

  fpCamera: UniversalCamera

  tpCamera: ArcRotateCamera

  flyCamera: FlyCamera

  fpCameraShakeData: Nullable<IFpCameraShakeState> = null

  constructor() {
    CameraManager.instance = this
    const { fpCamera, tpCamera, flyCamera } = this.init()
    this.fpCamera = fpCamera
    this.tpCamera = tpCamera
    this.flyCamera = flyCamera
    this.activeCameraChangedObserver()
    this.registerRenderObserver()
  }

  init() {
    const cameraAnchorNode = Player.getCameraAnchorNode()
    const scene = Main.getScene()
    const tpCamera = new ArcRotateCamera(EntityMap.TpCamera, Tools.ToRadians(-90), Tools.ToRadians(90), 3.5, cameraAnchorNode.position, scene)
    tpCamera.lockedTarget = cameraAnchorNode
    tpCamera.targetScreenOffset = new Vector2(-0.3, -0.2)
    tpCamera.wheelDeltaPercentage = 0.1
    tpCamera.lowerRadiusLimit = 2
    tpCamera.upperRadiusLimit = 3.5
    tpCamera.inertia = 0
    tpCamera.checkCollisions = true
    tpCamera.minZ = NEAR_PLANE

    const flyCamera = new FlyCamera(EntityMap.FlyCamera, new Vector3(0, 5, -10), scene)
    flyCamera.speed = 0.5
    flyCamera.setTarget(Vector3.Zero())
    flyCamera.minZ = NEAR_PLANE

    const fpCamera = new UniversalCamera(EntityMap.FpCamrea, cameraAnchorNode.absolutePosition, scene)
    fpCamera.inertia = 0
    scene.activeCamera = fpCamera
    fpCamera.attachControl(true)
    fpCamera.minZ = NEAR_PLANE
    fpCamera.layerMask = 1


    return {
      fpCamera,
      tpCamera,
      flyCamera
    }
  }

  registerRenderObserver() {
    const scene = Main.getScene()
    const cameraAnchorNode = Player.getCameraAnchorNode()

    scene.onBeforeRenderObservable.add(() => {
      this.fpCamera.position.copyFrom(cameraAnchorNode.absolutePosition)
    })
  }

  activeCameraChangedObserver() {
    const scene = Main.getScene()
    scene.onActiveCameraChanged.add((scene) => {
      scene.cameras.forEach(camera => camera.detachControl())
      scene.activeCamera!.attachControl(true)
    })
  }

  static getFpCamera() {
    return this.instance.fpCamera
  }

  static getTpCamera() {
    return this.instance.tpCamera
  }

  static getFlyCamera() {
    return this.instance.flyCamera
  }

  static getFpForward() {
    return this.instance.fpCamera.getForwardRay().direction
  }

  static getTpForward() {
    return this.instance.tpCamera.getForwardRay().direction
  }

  static isFpCamera(camera: Camera): camera is UniversalCamera {
    return camera.name === EntityMap.FpCamrea
  }

  static isTpCamera(camera: Camera): camera is ArcRotateCamera {
    return camera.name === EntityMap.TpCamera
  }

  static isFlyCamera(camera: Camera): camera is FlyCamera {
    return camera.name === EntityMap.FlyCamera
  }
}

export default CameraManager