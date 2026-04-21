import { DirectionalLight, Vector3 } from '@babylonjs/core'
import Main from './Main'

class LightManager {
  private static instance: LightManager

  directionalLight: DirectionalLight

  constructor() {
    LightManager.instance = this
    this.directionalLight = this.createDirectionalLight()

  }
  createDirectionalLight() {
    const scene = Main.getScene()
    const directionalLight = new DirectionalLight('DirectionalLight', new Vector3(1, -2, 1), scene)
    directionalLight.position = new Vector3(-200, 200, -200)
    directionalLight.intensity = 1
    return directionalLight
  }

  static getDirectionalLight() {
    return this.instance.directionalLight
  }
}


export default LightManager