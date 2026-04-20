import {
  Color3, CreateGround, PhysicsAggregate, PhysicsShapeType, StandardMaterial,
  Texture
} from '@babylonjs/core'
import { Path } from '../config/option'
import { BumpLevel, SpecularPower } from '../config'
import Main from '../core/Main'
import Player from '../entities/Player'
import LightManager from './LightManager'

class WorldScene {

  private static instance: WorldScene

  constructor() {
    WorldScene.instance = this
    this.createGround()
    this.createShadowGenerator()
    new Player()
  }

  createGround() {
    const scene = Main.getScene()

    const ground = CreateGround('Ground', { width: 200, height: 200, subdivisions: 2 }, scene)

    const material = new StandardMaterial('GroundMaterial', scene)
    material.specularColor = new Color3(0.3, 0.3, 0.3)
    material.specularPower = SpecularPower.NORMAL

    const texture = new Texture(Path.Texture + 'ground-diffuse.jpg', scene)
    const bumpTexture = new Texture(Path.Texture + 'ground-normal.jpg', scene)
    bumpTexture.level = BumpLevel.WEAK

    texture.uScale = texture.vScale = bumpTexture.uScale = bumpTexture.vScale = 40

    material.diffuseTexture = texture
    material.bumpTexture = bumpTexture

    ground.material = material
    ground.receiveShadows = true
    ground.checkCollisions = true
    new PhysicsAggregate(ground, PhysicsShapeType.BOX, { mass: 0 }, scene)
  }


  createShadowGenerator() {
    const light = LightManager.getDirectionalLight()

    // BUG!!!
    // const shadowGenerator = new ShadowGenerator(1024, light)

  }
}

export default WorldScene