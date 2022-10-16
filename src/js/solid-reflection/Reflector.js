import * as THREE from 'three'

class Reflector extends THREE.Mesh {
	constructor(geometry, options = {}) {
		super(geometry)
		
		this.type = 'Reflector'
		
		const scope = this
		
		const color = options.color !== undefined ? new THREE.Color(options.color) : new THREE.Color(0x7f7f7f)
		const textureWidth = options.textureWidth || 512
		const textureHeight = options.textureHeight || 512
		const clipBias = options.clipBias || 0
		const shader = options.shader || Reflector.ReflectorShader
		
		//
		
		const reflectorPlane = new THREE.Plane()
		const normal = new THREE.Vector3()
		const reflectorWorldPosition = new THREE.Vector3()
		const cameraWorldPosition = new THREE.Vector3()
		const rotationMatrix = new THREE.Matrix4()
		const lookAtPosition = new THREE.Vector3(0, 0, -1)
		const clipPlane = new THREE.Vector4()
		var viewport = new THREE.Vector4()
		
		const view = new THREE.Vector3()
		const target = new THREE.Vector3()
		const q = new THREE.Vector4()
		
		const textureMatrix = new THREE.Matrix4()
		const virtualCamera = new THREE.PerspectiveCamera()
		
		const parameters = {
			minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter,
			format: THREE.RGBFormat,
			stencilBuffer: false,
		}
		
		var renderTarget = new THREE.WebGLRenderTarget(textureWidth, textureHeight, parameters)
		
		renderTarget.depthBuffer = true
		renderTarget.depthTexture = new THREE.DepthTexture()
		renderTarget.depthTexture.type = THREE.UnsignedShortType
		
		if (!THREE.MathUtils.isPowerOfTwo(textureWidth) || !THREE.MathUtils.isPowerOfTwo(textureHeight)) {
			renderTarget.texture.generateMipmaps = false
		}
		
		var material = new THREE.ShaderMaterial({
			uniforms: THREE.UniformsUtils.clone(shader.uniforms),
			fragmentShader: shader.fragmentShader,
			vertexShader: shader.vertexShader,
			transparent: true,
		})
		
		material.uniforms['tDiffuse'].value = renderTarget.texture
		material.uniforms['color'].value = color
		material.uniforms['textureMatrix'].value = textureMatrix
		material.uniforms['tDepth'].value = renderTarget.depthTexture
		
		this.material = material
		
		this.onBeforeRender = function (renderer, scene, camera) {
			reflectorWorldPosition.setFromMatrixPosition(scope.matrixWorld)
			cameraWorldPosition.setFromMatrixPosition(camera.matrixWorld)
			
			rotationMatrix.extractRotation(scope.matrixWorld)
			
			normal.set(0, 0, 1)
			normal.applyMatrix4(rotationMatrix)
			
			view.subVectors(reflectorWorldPosition, cameraWorldPosition)
			
			// Avoid rendering when reflector is facing away
			
			if (view.dot(normal) > 0) return
			
			view.reflect(normal).negate()
			view.add(reflectorWorldPosition)
			
			rotationMatrix.extractRotation(camera.matrixWorld)
			
			lookAtPosition.set(0, 0, -1)
			lookAtPosition.applyMatrix4(rotationMatrix)
			lookAtPosition.add(cameraWorldPosition)
			
			target.subVectors(reflectorWorldPosition, lookAtPosition)
			target.reflect(normal).negate()
			target.add(reflectorWorldPosition)
			
			virtualCamera.position.copy(view)
			virtualCamera.up.set(0, 1, 0)
			virtualCamera.up.applyMatrix4(rotationMatrix)
			virtualCamera.up.reflect(normal)
			virtualCamera.lookAt(target)
			
			virtualCamera.far = camera.far // Used in WebGLBackground
			
			virtualCamera.updateMatrixWorld()
			virtualCamera.projectionMatrix.copy(camera.projectionMatrix)
			
			this.material.uniforms.cameraNear.value = camera.near
			this.material.uniforms.cameraFar.value = camera.far
			
			// Update the texture matrix
			textureMatrix.set(0.5, 0.0, 0.0, 0.5, 0.0, 0.5, 0.0, 0.5, 0.0, 0.0, 0.5, 0.5, 0.0, 0.0, 0.0, 1.0)
			textureMatrix.multiply(virtualCamera.projectionMatrix)
			textureMatrix.multiply(virtualCamera.matrixWorldInverse)
			textureMatrix.multiply(scope.matrixWorld)
			
			// Now update projection matrix with new clip plane, implementing code from: http://www.terathon.com/code/oblique.html
			// Paper explaining this technique: http://www.terathon.com/lengyel/Lengyel-Oblique.pdf
			reflectorPlane.setFromNormalAndCoplanarPoint(normal, reflectorWorldPosition)
			reflectorPlane.applyMatrix4(virtualCamera.matrixWorldInverse)
			
			clipPlane.set(reflectorPlane.normal.x, reflectorPlane.normal.y, reflectorPlane.normal.z, reflectorPlane.constant)
			
			var projectionMatrix = virtualCamera.projectionMatrix
			
			q.x = (Math.sign(clipPlane.x) + projectionMatrix.elements[8]) / projectionMatrix.elements[0]
			q.y = (Math.sign(clipPlane.y) + projectionMatrix.elements[9]) / projectionMatrix.elements[5]
			q.z = -1.0
			q.w = (1.0 + projectionMatrix.elements[10]) / projectionMatrix.elements[14]
			
			// Calculate the scaled plane vector
			clipPlane.multiplyScalar(2.0 / clipPlane.dot(q))
			
			// Replacing the third row of the projection matrix
			projectionMatrix.elements[2] = clipPlane.x
			projectionMatrix.elements[6] = clipPlane.y
			projectionMatrix.elements[10] = clipPlane.z + 1.0 - clipBias
			projectionMatrix.elements[14] = clipPlane.w
			
			// Render
			
			renderTarget.texture.encoding = renderer.outputEncoding
			
			scope.visible = false
			
			var currentRenderTarget = renderer.getRenderTarget()
			
			var currentXrEnabled = renderer.xr.enabled
			var currentShadowAutoUpdate = renderer.shadowMap.autoUpdate
			
			renderer.xr.enabled = false // Avoid camera modification
			renderer.shadowMap.autoUpdate = false // Avoid re-computing shadows
			
			renderer.setRenderTarget(renderTarget)
			
			renderer.state.buffers.depth.setMask(true) // make sure the depth buffer is writable so it can be properly cleared, see #18897
			
			if (renderer.autoClear === false) renderer.clear()
			renderer.render(scene, virtualCamera)
			
			renderer.xr.enabled = currentXrEnabled
			renderer.shadowMap.autoUpdate = currentShadowAutoUpdate
			
			renderer.setRenderTarget(currentRenderTarget)
			// Restore viewport
			
			var bounds = camera.bounds
			
			if (bounds !== undefined) {
				var size = renderer.getSize()
				var pixelRatio = renderer.getPixelRatio()
				
				viewport.x = bounds.x * size.width * pixelRatio
				viewport.y = bounds.y * size.height * pixelRatio
				viewport.z = bounds.z * size.width * pixelRatio
				viewport.w = bounds.w * size.height * pixelRatio
				
				renderer.state.viewport(viewport)
			}
			
			scope.visible = true
		}
		
		this.getRenderTarget = function () {
			return renderTarget
		}
	}
}
Reflector.ReflectorShader = {
	uniforms: {
		color: {
			type: 'c',
			value: null,
		},
		tDiffuse: {
			type: 't',
			value: null,
		},
		tDepth: {
			type: 't',
			value: null,
		},
		textureMatrix: {
			type: 'm4',
			value: null,
		},
		cameraNear: {
			type: 'f',
			value: 0,
		},
		cameraFar: {
			type: 'f',
			value: 0,
		},
	},
	
	vertexShader: [
		'uniform mat4 textureMatrix;',
		'varying vec4 vUv;',
		
		'void main() {',
		
		'	vUv = textureMatrix * vec4( position, 1.0 );',
		
		'	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
		
		'}',
	].join('\n'),
	
	fragmentShader: [
		'#include <packing>',
		'uniform vec3 color;',
		'uniform sampler2D tDiffuse;',
		'uniform sampler2D tDepth;',
		'uniform float cameraNear;',
		'uniform float cameraFar;',
		'varying vec4 vUv;',
		
		'float blendOverlay( float base, float blend ) {',
		
		'	return( base < 0.5 ? ( 2.0 * base * blend ) : ( 1.0 - 2.0 * ( 1.0 - base ) * ( 1.0 - blend ) ) );',
		
		'}',
		
		'vec3 blendOverlay( vec3 base, vec3 blend ) {',
		
		'	return vec3( blendOverlay( base.r, blend.r ), blendOverlay( base.g, blend.g ), blendOverlay( base.b, blend.b ) );',
		
		'}',
		
		'float readDepth( sampler2D depthSampler, vec4 coord ) {',
		
		'	float fragCoordZ = texture2DProj( depthSampler, coord ).x;',
		'	float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );',
		'	return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );',
		
		'}',
		
		'void main() {',
		
		'	vec4 base = texture2DProj( tDiffuse, vUv );',
		' float depth = readDepth( tDepth, vUv );',
		'	gl_FragColor = vec4( color, 0.5 - ( depth * 10000.0 ) );',
		
		'}',
	].join('\n'),
}

export { Reflector }
