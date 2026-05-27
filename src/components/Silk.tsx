import { useEffect, useRef } from 'react'

type SilkProps = {
  speed?: number
  scale?: number
  color?: string
  noiseIntensity?: number
  rotation?: number
  className?: string
}

const DEFAULT_COLOR = '#7B7481'

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '')
  const value =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => char + char)
          .join('')
      : normalized

  const int = Number.parseInt(value, 16)

  if (Number.isNaN(int) || value.length !== 6) {
    return { r: 123, g: 116, b: 129 }
  }

  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  }
}

export default function Silk({
  speed = 5,
  scale = 1,
  color = DEFAULT_COLOR,
  noiseIntensity = 1.5,
  rotation = 0,
  className = '',
}: SilkProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const context = canvas.getContext('2d')
    if (!context) {
      return
    }

    const parent = canvas.parentElement
    if (!parent) {
      return
    }

    let animationFrame = 0
    let width = 0
    let height = 0
    const pixelRatio = clamp(window.devicePixelRatio || 1, 1, 2)
    const baseColor = hexToRgb(color)

    const resize = () => {
      width = parent.clientWidth
      height = parent.clientHeight
      canvas.width = Math.max(1, Math.floor(width * pixelRatio))
      canvas.height = Math.max(1, Math.floor(height * pixelRatio))
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    }

    const draw = (time: number) => {
      const t = (time / 1000) * speed * 0.18
      const lineGap = Math.max(14, 22 / scale)
      const pointGap = Math.max(14, 18 / scale)
      const amplitude = 34 * scale

      context.clearRect(0, 0, width, height)
      context.save()
      context.translate(width / 2, height / 2)
      context.rotate((rotation * Math.PI) / 180)
      context.translate(-width / 2, -height / 2)

      const background = context.createLinearGradient(0, 0, width, height)
      background.addColorStop(0, 'rgba(8, 10, 14, 0.96)')
      background.addColorStop(0.5, 'rgba(13, 16, 24, 0.94)')
      background.addColorStop(1, 'rgba(6, 8, 12, 0.98)')
      context.fillStyle = background
      context.fillRect(0, 0, width, height)

      const ambient = context.createLinearGradient(0, 0, width, height)
      ambient.addColorStop(0, `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, 0.38)`)
      ambient.addColorStop(0.5, `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, 0.18)`)
      ambient.addColorStop(1, 'rgba(255, 255, 255, 0)')
      context.fillStyle = ambient
      context.fillRect(0, 0, width, height)

      for (let y = -lineGap * 2; y <= height + lineGap * 2; y += lineGap) {
        const alpha = 0.28 + ((Math.sin(y * 0.014 + t) + 1) / 2) * 0.24
        context.beginPath()
        context.shadowBlur = 18
        context.shadowColor = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, 0.28)`

        for (let x = -pointGap * 2; x <= width + pointGap * 2; x += pointGap) {
          const drift = Math.sin(x * 0.008 * scale + t * 1.2 + y * 0.013) * amplitude
          const fold = Math.cos(y * 0.018 * scale - t * 0.9 + x * 0.01) * amplitude * 0.65
          const shimmer =
            Math.sin((x + y) * 0.022 + t * 2.1) *
            Math.cos((x - y) * 0.017 - t * 1.7) *
            amplitude *
            0.24 *
            noiseIntensity
          const offsetY = drift + fold + shimmer
          const drawX = x
          const drawY = y + offsetY

          if (x === -pointGap * 2) {
            context.moveTo(drawX, drawY)
          } else {
            context.lineTo(drawX, drawY)
          }
        }

        context.strokeStyle = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${alpha})`
        context.lineWidth = 2
        context.stroke()
      }

      context.shadowBlur = 0

      const glow = context.createRadialGradient(width * 0.7, height * 0.25, 10, width * 0.7, height * 0.25, width * 0.56)
      glow.addColorStop(0, `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, 0.42)`)
      glow.addColorStop(0.45, `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, 0.18)`)
      glow.addColorStop(1, 'rgba(255, 255, 255, 0)')
      context.fillStyle = glow
      context.fillRect(0, 0, width, height)

      const secondaryGlow = context.createRadialGradient(width * 0.22, height * 0.72, 20, width * 0.22, height * 0.72, width * 0.42)
      secondaryGlow.addColorStop(0, `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, 0.28)`)
      secondaryGlow.addColorStop(0.5, `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, 0.12)`)
      secondaryGlow.addColorStop(1, 'rgba(255, 255, 255, 0)')
      context.fillStyle = secondaryGlow
      context.fillRect(0, 0, width, height)

      context.restore()
      animationFrame = window.requestAnimationFrame(draw)
    }

    resize()
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(parent)
    animationFrame = window.requestAnimationFrame(draw)

    return () => {
      window.cancelAnimationFrame(animationFrame)
      resizeObserver.disconnect()
    }
  }, [color, noiseIntensity, rotation, scale, speed])

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />
}
