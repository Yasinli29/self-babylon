import Main from './Main'
import InputManager from './InputManager'

class WindowEvent {
  constructor() {
    this.init()
  }

  init() {
    const engine = Main.getEngine()
    const canvas = Main.getCanvas()

    window.addEventListener('resize', () => {
      engine.resize()
    })

    canvas.addEventListener('dblclick', () => {
      canvas.requestPointerLock()
    })

    document.addEventListener('visibilitychange', () => {
      InputManager.clearKeyState()
    })

    canvas.addEventListener('blur', () => {
      InputManager.clearKeyState()
    })

  }

}

export default WindowEvent