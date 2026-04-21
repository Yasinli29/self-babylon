import {
  AbstractMesh,
  ArcRotateCamera,
  Axis,
  Color3,
  CreateSoundAsync,
  FlyCamera,
  ImportMeshAsync,
  KeyboardEventTypes,
  Light,
  LinesMesh,
  MeshBuilder,
  PerformanceMonitor,
  PhysicsAggregate,
  PhysicsCharacterController,
  PhysicsShapeType,
  Quaternion,
  RandomRange,
  Scene,
  Space,
  SpotLight,
  StandardMaterial,
  StaticSound,
  Tools,
  TransformNode,
  UniversalCamera,
  Vector3,
  VertexBuffer,
  type ISceneLoaderAsyncResult,
  type Nullable
} from '@babylonjs/core'
import { EntityMap, Path } from '../config/option'
import { BulletEmissiveColor, FlashLightColor, RedColor4, YellowColor4 } from '../config/color'
import { getPhysicsBodyFromNode, getYawFromXZ, rotateAroundY, throttle } from '../utils/tools'
import { BULLET_VELOCITY, DirectionVec, FLASHLIGHT_INTENSITY, GRAVITY, MOVE_SPEED, PLAYER_SELF_LAYER, ZeroVector3 } from '../config'
import { KeyCode } from '../config/keyboard'
import { PlayerAnimMap } from '../config/animation'
import Main from '../core/Main'
import InputManager from '../core/InputManager'
import Animator from '../systems/Animator'
import CameraManager from '../core/CameraManager'

const CAPSULE_HEIGHT = 1.8

class Player {

  private static instance: Player

  private laserVertex = new Float32Array(6)

  private keyDirection = Vector3.Zero()

  playerNode: TransformNode

  cameraAnchorNode: TransformNode

  laserAnchorNode: TransformNode

  lightAnchorNode: TransformNode

  flashLight: SpotLight

  laser: LinesMesh

  playerController: PhysicsCharacterController

  playerLoader!: ISceneLoaderAsyncResult

  armRoot!: AbstractMesh

  animator!: Animator<PlayerAnimMap>

  pickedPoint = Vector3.Zero()

  pickedMesh: Nullable<AbstractMesh> = null

  bulletNode = new TransformNode('BulletNode')

  constructor() {

    Player.instance = this

    const { playerNode, cameraAnchorNode, laserAnchorNode, lightAnchorNode } = this.createPlayerNode()
    this.playerNode = playerNode
    this.cameraAnchorNode = cameraAnchorNode
    this.laserAnchorNode = laserAnchorNode
    this.lightAnchorNode = lightAnchorNode

    this.flashLight = this.createLight()

    this.playerController = this.initPlayerController()

    this.laser = this.createLaser()


    this.loadModel().then(res => {
      this.playerLoader = res.playerLoader;
      [this.armRoot] = res.armLoader.meshes
      this.animator = new Animator<PlayerAnimMap>(res.playerLoader.animationGroups)
      this.registerRenderObserver()

    })

  }

  registerRenderObserver() {
    const scene = Main.getScene()

    scene.onBeforePhysicsObservable.add(() => {
      this.openFire(scene)
    })

    scene.onBeforeRenderObservable.add(() => {

      this.movePlayer(scene, scene.getEngine().getDeltaTime() / 1000)

      const { x, y, z } = this.playerController.getPosition()
      this.playerNode.position.copyFromFloats(x, y - CAPSULE_HEIGHT / 2, z)
      
      this.updateLaserVertex(scene)
    })

    scene.onKeyboardObservable.add((e) => {
      const { repeat } = (e.event as KeyboardEvent)
      if (e.event.code === KeyCode.F && !repeat) {
        this.flashLight.intensity = this.flashLight.intensity ? 0 : FLASHLIGHT_INTENSITY
      }
      if (e.event.code === KeyCode.SPACE && !repeat) {
        const support = this.playerController.checkSupport(0.01, Vector3.Up());
        this.playerController.integrate(10, support, GRAVITY)
      }
    }, KeyboardEventTypes.KEYDOWN)
  }

  initPlayerController() {
    const { x, z } = this.playerNode.position
    const controller = new PhysicsCharacterController(new Vector3(x, CAPSULE_HEIGHT / 2, z), {
      capsuleHeight: CAPSULE_HEIGHT,
      capsuleRadius: 0.18,
    }, Main.getScene())
    return controller
  }

  movePlayer(scene: Scene, deltaTime: number) {
    if (scene.activeCamera instanceof FlyCamera) return
    this.onFpCameraMovePlayer(scene.activeCamera as UniversalCamera | ArcRotateCamera, deltaTime)
  }

  onFpCameraMovePlayer(camera: UniversalCamera | ArcRotateCamera, deltaTime: number) {

    const keyState = InputManager.getKeyState()

    const { keyDirection } = this

    keyDirection.x = ~~keyState[KeyCode.D] - ~~keyState[KeyCode.A]
    keyDirection.z = ~~keyState[KeyCode.W] - ~~keyState[KeyCode.S]

    const rad = getYawFromXZ(camera.getForwardRay().direction)

    this.playerNode.rotationQuaternion = Quaternion.FromEulerAngles(0, rad, 0)

    const deltaDistance = deltaTime * MOVE_SPEED * (keyState[KeyCode.L_SHIFT] ? 2 : 1)

    if (keyDirection.length()) {
      this.playerController.moveWithCollisions(rotateAroundY(keyDirection, rad).normalizeToNew().scale(deltaDistance))
    } else {
      // TODO
    }

    const animName = (() => {
      if (keyDirection.length()) {
        if (keyDirection.equals(DirectionVec.W)) return PlayerAnimMap.RifleRun
        if (keyDirection.equals(DirectionVec.A)) return PlayerAnimMap.RifleRunLeft
        if (keyDirection.equals(DirectionVec.D)) return PlayerAnimMap.RifleRunRight
        if (keyDirection.equals(DirectionVec.S)) return PlayerAnimMap.RifleRunBackward
        if (keyDirection.equals(DirectionVec.WA)) return PlayerAnimMap.RifleRunForwardLeft
        if (keyDirection.equals(DirectionVec.WD)) return PlayerAnimMap.RifleRunForwardRight
        if (keyDirection.equals(DirectionVec.SA)) return PlayerAnimMap.RifleRunBackwardLeft
        if (keyDirection.equals(DirectionVec.SD)) return PlayerAnimMap.RifleRunBackwardRight
      }
      return PlayerAnimMap.RifleIdle
    })()
    this.animator.play(animName)
  }

  async loadModel() {
    const scene = Main.getScene()

    const [playerLoader, armLoader] = await Promise.all([
      ImportMeshAsync(Path.Player + 'player.glb', scene),
      ImportMeshAsync(Path.Player + 'arms.glb', scene),
    ])

    const [playerRoot] = playerLoader.meshes
    const [armRoot] = armLoader.meshes

    playerRoot.rotate(Axis.Z, Tools.ToRadians(180), Space.LOCAL)
    this.playerNode.addChild(playerRoot)
    playerRoot.position = Vector3.Zero()
    for (const mesh of playerLoader.meshes) {
      mesh.isPickable = false
      mesh.layerMask = PLAYER_SELF_LAYER
    }

    armRoot.parent = CameraManager.getFpCamera()
    armRoot.position = new Vector3(0, -0.35, 0)

    return {
      playerLoader,
      armLoader
    }
  }

  createLight() {
    const flashLight = new SpotLight('FlashLight', ZeroVector3, Vector3.Forward(), Tools.ToRadians(40), 15, Main.getScene())
    flashLight.intensity = FLASHLIGHT_INTENSITY
    flashLight.diffuse = FlashLightColor
    flashLight.specular = Color3.White()
    flashLight.parent = this.lightAnchorNode
    flashLight.intensityMode = Light.INTENSITYMODE_AUTOMATIC
    return flashLight
  }

  createPlayerNode() {

    const scene = Main.getScene()

    const playerNode = new TransformNode(EntityMap.PlayerNode, scene)
    playerNode.position = Vector3.Zero()

    const cameraAnchorNode = new TransformNode('CameraAnchorNode', scene)
    playerNode.addChild(cameraAnchorNode)
    cameraAnchorNode.position = new Vector3(0, 1.7, 0)

    const laserAnchorNode = new TransformNode('LaserAnchorNode', scene)
    playerNode.addChild(laserAnchorNode)
    laserAnchorNode.position = new Vector3(-0.1, 1.5, 0)

    const lightAnchorNode = new TransformNode('LightAnchorNode', scene)
    playerNode.addChild(lightAnchorNode)
    lightAnchorNode.position = new Vector3(0, 1.5, 0)

    return {
      playerNode,
      cameraAnchorNode,
      laserAnchorNode,
      lightAnchorNode
    }
  }

  createLaser() {
    const scene = Main.getScene()
    const laser = MeshBuilder.CreateLines('Laser', { points: [Vector3.Zero(), Vector3.Zero()], colors: [RedColor4, YellowColor4], updatable: true }, scene)
    // laser 会 pick 到自己
    laser.isPickable = false
    return laser
  }


  openFire = throttle((scene: Scene) => {
    const [isLMDown] = InputManager.getMouseState()
    if (!isLMDown) return
    if (CameraManager.isFlyCamera(scene.activeCamera!)) return

    const { direction } = scene.activeCamera!.getForwardRay()

    const bullet = MeshBuilder.CreateCapsule('Bullet' + Date.now(), { radius: 0.015, height: 0.1, }, scene)

    bullet.parent = this.bulletNode

    if (CameraManager.isTpCamera(scene.activeCamera!)) {
      bullet.addRotation(-scene.activeCamera.beta, getYawFromXZ(direction), 0)
    } else if (CameraManager.isFpCamera(scene.activeCamera!)) {
      bullet.addRotation(Math.PI / 2 - Math.asin(direction.y), getYawFromXZ(direction), 0)
    }

    const material = new StandardMaterial('BulletMaterial', scene)
    material.emissiveColor = BulletEmissiveColor
    bullet.material = material

    bullet.position = this.laserAnchorNode.getAbsolutePosition()

    const aggregate = new PhysicsAggregate(bullet, PhysicsShapeType.CAPSULE, { mass: 0.1 }, scene)
    aggregate.body.setGravityFactor(0)
    aggregate.body.setLinearDamping(0)

    aggregate.body.setLinearVelocity(this.pickedPoint.subtract(bullet.position).normalize().scale(BULLET_VELOCITY / 10))
    aggregate.body.setCollisionCallbackEnabled(true)

    aggregate.body.getCollisionObservable().addOnce(() => {
      aggregate.dispose()
      bullet.dispose()
    })
    setTimeout(() => {
      aggregate.dispose()
      bullet.dispose()
    }, 2000)

    // 推动命中物体
    getPhysicsBodyFromNode(this.pickedMesh)?.setLinearVelocity(direction.scale(5))

  }, 100)


  updateLaserVertex(scene: Scene) {

    if (CameraManager.isFlyCamera(scene.activeCamera!)) return

    const ray = scene.activeCamera!.getForwardRay(1000)

    const origin = this.laserAnchorNode.getAbsolutePosition()

    const hit = scene.pickWithRay(ray)!

    const end = hit.hit ? hit.pickedPoint! : origin.add(ray.direction.scale(1000))

    if (CameraManager.isTpCamera(scene.activeCamera!)) {
      // TODO
    }

    this.pickedPoint = end

    this.pickedMesh = hit.pickedMesh

    this.laserVertex[0] = origin.x
    this.laserVertex[1] = origin.y
    this.laserVertex[2] = origin.z
    this.laserVertex[3] = end.x
    this.laserVertex[4] = end.y
    this.laserVertex[5] = end.z

    this.laser.updateVerticesData(VertexBuffer.PositionKind, this.laserVertex, true)

  }

  static getPlayerNode() {
    return this.instance.playerNode
  }

  static getCameraAnchorNode() {
    return this.instance.cameraAnchorNode
  }

  static getLaserAnchorNode() {
    return this.instance.laserAnchorNode
  }
}


export default Player