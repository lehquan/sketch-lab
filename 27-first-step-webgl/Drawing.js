
function main() {
  // 1. Retrieve canvas element
  const canvas = document.getElementById('example')
  if(!canvas) {
    console.error('Failed to retrieve canvas element.')
    return false
  }

  // 2.Get the rendering context
  const ctx = canvas.getContext('2d')

  // 3.Drawing a blue rectangle
  ctx.fillStyle = 'rgba(0, 0, 255, 1.0)'      // Set color to blue
  ctx.fillRect(120, 10, 150, 150)  // Fill a rectangle with the color
}
