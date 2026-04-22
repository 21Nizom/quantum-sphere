// ОСНОВНЫЕ НАСТРОЙКИ (THREE.js)
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true }); // Гладкие края

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio); // Для четкости на POCO
document.body.appendChild(renderer.domElement);

// ЗАГРУЗЧИК ТЕКСТУР (Это магия реализма)
const textureLoader = new THREE.TextureLoader();

// Текстуры для Земли (берем из открытых источников НАСА)
const earthTexture = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg');
const earthNormalMap = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg');
const earthSpecularMap = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg');

// Текстура для Луны
const moonTexture = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg');

// 1. СОЗДАЕМ ЗЕМЛЮ (Геометрия + Материал)
const earthGeometry = new THREE.SphereGeometry(2, 64, 64); // Гладкая сфера
const earthMaterial = new THREE.MeshPhongMaterial({
    map: earthTexture,            // Основная фото-текстура
    normalMap: earthNormalMap,    // Рельеф (горы, низины)
    specularMap: earthSpecularMap,// Блик воды (океаны блестят)
    shininess: 10,                 // Сила блика
    transparent: true              // Для атмосферы
});
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earth);

// 2. СОЗДАЕМ ЛУНУ
const moonGeometry = new THREE.SphereGeometry(0.5, 32, 32); // Маленькая сфера
const moonMaterial = new THREE.MeshPhongMaterial({
    map: moonTexture,             // Текстура Луны
    shininess: 0                   // Матовая
});
const moon = new THREE.Mesh(moonGeometry, moonMaterial);
scene.add(moon);

// 3. СВЕТ (Без него будет темно)
const ambientLight = new THREE.AmbientLight(0x111111); // Слабый фоновый свет
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5); // "Солнце"
directionalLight.position.set(5, 3, 5); // Светит сбоку
scene.add(directionalLight);

// 4. КОСМОС (Звезды на фоне)
const starsGeometry = new THREE.BufferGeometry();
const starsCount = 5000;
const starsPositions = new Float32Array(starsCount * 3);

for(let i=0; i<starsCount * 3; i++) {
    starsPositions[i] = (Math.random() - 0.5) * 100;
}

starsGeometry.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3));
const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
const starField = new THREE.Points(starsGeometry, starsMaterial);
scene.add(starField);

camera.position.z = 7; // Отдаляем камеру

// 5. УПРАВЛЕНИЕ И АНИМАЦИЯ
let time = 0;
let userRotationX = 0;
let targetRotationX = 0;
let isInteracting = false;

function animate() {
    requestAnimationFrame(animate);
    
    time += 0.005; // Время для орбиты

    // Плавное автоматическое вращение
    earth.rotation.y += 0.002;
    moon.rotation.y += 0.01;

    // Реакция на палец (как у сферы)
    if (!isInteracting) {
        targetRotationX += 0.001; // Медленный дрейф
    }
    userRotationX += (targetRotationX - userRotationX) * 0.1;
    scene.rotation.y = userRotationX; // Поворачиваем всю сцену

    // Орбита Луны
    moon.position.x = Math.cos(time) * 4.5;
    moon.position.z = Math.sin(time) * 4.5;
    moon.position.y = Math.sin(time * 0.5) * 0.5; // Наклон орбиты

    renderer.render(scene, camera);
}

// УПРАВЛЕНИЕ: Мышка и Палец (для POCO)
const move = (e) => {
    isInteracting = true;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    targetRotationX = (x / window.innerWidth) * Math.PI * 4;
    
    clearTimeout(window.moveTimeout);
    window.moveTimeout = setTimeout(() => isInteracting = false, 1500); // Возврат к авто-режиму
};

window.addEventListener('mousemove', move);
window.addEventListener('touchmove', move); // Самое важное для телефона

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
