import * as THREE from 'three'
import * as dat from 'lil-gui'
import gsap from 'gsap'
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);


// Texture
const textureLoader = new THREE.TextureLoader()
const gradientTexture = textureLoader.load('textures/gradients/3.jpg')
gradientTexture.magFilter = THREE.NearestFilter

/**
 * Debug
 */
const gui = new dat.GUI()

const parameters = {
    materialColor: '#e6eee8ff',
    sectionColors: ['#09f729ff', '#7fffd4', '#ffd700']
}

gui
    .addColor(parameters, 'materialColor')
    .onChange(() =>{
    material.color.set(parameters.materialColor)
    particlesMaterial.color.set(parameters.materialColor)
    }
)

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
* Objects
*/
/**
* Particles
*/
// Geometry

const particlesCount = 200
const positions = new Float32Array(particlesCount * 3)
for(let i = 0; i < particlesCount; i++){
    positions[i * 3 + 0] = (Math.random() - 0.5) * 10
    positions[i * 3 + 1] = Math.random()
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10
}
const particlesGeometry = new THREE.BufferGeometry()
particlesGeometry.setAttribute('position', new
THREE.BufferAttribute(positions, 3))
// Material
const particlesMaterial = new THREE.PointsMaterial({
color: parameters.materialColor,
sizeAttenuation: true,
size: 0.03
})

// Points
const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)
// Meshes
const material = new THREE.MeshToonMaterial({
    color: parameters.materialColor,
    gradientMap: gradientTexture
})

const mesh1 = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.4, 16, 60),
    material
)
const mesh2 = new THREE.Mesh(
    new THREE.ConeGeometry(1, 2, 32),
    material
)
const mesh3 = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
    material
)
scene.add(mesh1, mesh2, mesh3)

const objectsDistance = 4
mesh1.position.y = - objectsDistance * 0
mesh2.position.y = - objectsDistance * 1
mesh3.position.y = - objectsDistance * 2
mesh1.position.x = 2
mesh2.position.x = - 2
mesh3.position.x = 2

const sectionMeshes = [ mesh1, mesh2, mesh3 ]

/**
* Lights
*/
const directionalLight = new THREE.DirectionalLight('#ffffff', 1.5)
directionalLight.position.set(1, 1, 0)
scene.add(directionalLight)



/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

/**
* Scroll
*/
let scrollY = window.scrollY
let currentSection = 0
const sectionTitles = document.querySelectorAll('.title')
window.addEventListener('scroll', () =>{
    scrollY = window.scrollY
    const newSection = Math.round(scrollY / sizes.height)
    if(newSection != currentSection){
        currentSection = newSection
        //console.log('changed', currentSection)
        gsap.to(
            sectionMeshes[currentSection].rotation,{
                duration: 1.5,
                ease: 'power2.inOut',
                x: '+=6',
                y: '+=3',
                z: '+=1.5'
            }
        )

        const bgColor = new THREE.Color(parameters.sectionColors[currentSection]).lerp(
            new THREE.Color("#1e1a20"), 
            0.5 // 0 = full section color, 1 = black — adjust for brightness
        );

        gsap.to(document.body, {
            backgroundColor: `#${bgColor.getHexString()}`,
            duration: 1.5,
            ease: "power2.inOut"
        });

        gsap.to(particlesMaterial.color, {
            duration: 1.5,
            r: new THREE.Color(parameters.sectionColors[currentSection]).r,
            g: new THREE.Color(parameters.sectionColors[currentSection]).g,
            b: new THREE.Color(parameters.sectionColors[currentSection]).b
        })

        gsap.to(document.body, {
            backgroundColor: gsap.utils.interpolateColor(
                "#1e1a20", // dark base
                parameters.sectionColors[currentSection], 
                0.3 // 30% tint strength
            ),
            duration: 1.5,
            ease: "power2.inOut"
        })
        gsap.to(material, {
            duration: 1.5,
            roughness: 0.3 + Math.random() * 0.5,
            ease: "power1.inOut"
        });
        gsap.to(directionalLight, {
            intensity: 1 + Math.random() * 0.5,
            duration: 1.5,
            ease: "power1.inOut"
        });
    }
    
})

/**
* Cursor
*/
const cursor = {}
cursor.x = 0
cursor.y = 0

window.addEventListener('mousemove', (event) =>{
    cursor.x = event.clientX / sizes.width - 0.5
    cursor.y = event.clientY / sizes.height - 0.5
})

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})



/**
 * Camera
 */

// Group
const cameraGroup = new THREE.Group()
scene.add(cameraGroup)
// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height,
0.1, 100)
camera.position.z = 6
cameraGroup.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearAlpha(0)

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime
    //console.log(deltaTime)

    // Animate meshes
    for(const mesh of sectionMeshes){
        mesh.rotation.x = elapsedTime * 0.1
        mesh.rotation.y = elapsedTime * 0.12
    }
    // Animate material color pulse
    
    const baseColor = new THREE.Color(parameters.sectionColors[currentSection]); 
    const white = new THREE.Color('#ffffff');
    const pulse = (Math.sin(elapsedTime * 1.5) * 0.5 + 0.5);
    material.color.lerpColors(baseColor, white, pulse * 0.4);
    particlesMaterial.color.lerpColors(baseColor, white, pulse * 0.4);
    particles.position.y = Math.sin(elapsedTime * 0.5) * 0.2;

    //Animate titles
    document.querySelectorAll('.title').forEach(title => {
        const pulseIntensity = pulse * 0.3; // adjust 0.3–0.6 for stronger glow
        const currentColor = new THREE.Color(parameters.sectionColors[currentSection]);
        const pulseColor = currentColor.clone().lerp(new THREE.Color('#ffffff'), pulseIntensity);
        title.style.color = `#${pulseColor.getHexString()}`;
        title.style.textShadow = `0 0 ${5 + pulseIntensity * 15}px ${title.style.color}`;
    });
    // Animate camera
    camera.position.y = - scrollY / sizes.height * objectsDistance

    const parallaxX = cursor.x * 0.5
    const parallaxY = - cursor.y * 0.5
    cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 5 * deltaTime
    cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 5 * deltaTime

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()


// Animate each title
document.querySelectorAll(".title").forEach((title, index) => {
  gsap.fromTo(
    title,
    { opacity: 0, y: 100 },
    {
      opacity: 1,
      y: 0,
      duration: 1.2,
      delay: 0.3, // optional delay for smoother entry
      ease: "power3.out",
      scrollTrigger: {
        trigger: title,
        start: "top 80%", // when section enters
        end: "top 20%",   // when it’s almost out
        scrub: true,      // sync with scroll
        toggleActions: "play reverse play reverse",
      },
    }
  );
});
