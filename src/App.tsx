import { useEffect } from 'react'
import cns from './App.module.css'
import '@babylonjs/loaders'
import '@babylonjs/inspector'
import Main from './core/Main'

export default () => {

  const init = async () => {
    const canvas = document.getElementById(cns.canvas) as HTMLCanvasElement
    new Main(canvas)
  }

  useEffect(() => {
    init()
  }, [])

  return <div className={cns.app}>
    <canvas id={cns.canvas} />
  </div>
}