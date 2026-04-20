import {
  AbstractEngine,
  Animation,
  AnimationPropertiesOverride,
  EngineFactory,
  HavokPlugin,
  PhysicsViewer,
  PowerPreference,
  Scene,
  SnapshotRenderingHelper,
} from '@babylonjs/core'
import { GRAVITY, } from '../config'
import WindowEvent from './WindowEvent'
import CameraManager from './CameraManager'
import HavokPhysics from '@babylonjs/havok'
import InputManager from './InputManager'
import WorldScene from './WorldScene'
import LightManager from './LightManager'
import { ClearColor } from '../config/color'

class Main {

  private static instance: Main

  engine!: AbstractEngine;

  scene!: Scene;

  canvas: HTMLCanvasElement;

  physicsViewer!: PhysicsViewer;

  srHelper!: SnapshotRenderingHelper;

  constructor(canvas: HTMLCanvasElement) {

    Main.instance = this

    this.canvas = canvas

    this.init()

  }

  async init() {

    this.engine = await this.createEngine()

    this.scene = this.createScene()

    this.physicsViewer = await this.initHavok()

    this.setAnimationConfig()

    new LightManager()

    new WorldScene()

    new CameraManager()

    new InputManager()

    new WindowEvent()

    this.engine.runRenderLoop(() => {
      this.scene.render()
    })
  }

  async createEngine() {
    const engine = await EngineFactory.CreateAsync(this.canvas, {
      powerPreference: PowerPreference.HighPerformance,
      deterministicLockstep: true,
      enableAllFeatures: true,
      setMaximumLimits: true,
      swapChainFormat: 'bgra8unorm',
    })
    engine.maxFPS = 120
    return engine
  }

  setAnimationConfig() {
    Animation.AllowMatricesInterpolation = true
    const animationConfig = new AnimationPropertiesOverride()
    animationConfig.enableBlending = true
    animationConfig.blendingSpeed = 0.05
    this.scene.animationPropertiesOverride = animationConfig
  }

  createScene() {
    const scene = new Scene(this.engine)
    scene.clearColor = ClearColor
    return scene
  }

  async initHavok() {
    const havokInstance = await HavokPhysics()
    this.scene.enablePhysics(GRAVITY, new HavokPlugin(true, havokInstance))
    const physicsViewer = new PhysicsViewer(this.scene)
    return physicsViewer
  }

  static getEngine() {
    return this.instance.engine
  }

  static getScene() {
    return this.instance.scene
  }

  static getCanvas() {
    return this.instance.canvas
  }

  static getPhysicsViewer() {
    return this.instance.physicsViewer
  }
}

export default Main
