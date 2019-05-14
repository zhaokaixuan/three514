function init() {
    var stats = initStats();
    var scene = new THREE.Scene();

    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.x = -30;
    camera.position.y = 40;
    camera.position.z = 30;
    camera.lookAt(scene.position);

    var renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(new THREE.Color(0xEEEEEE, 1.0));
    renderer.setSize(window.innerWidth, window.innerHeight);

    //add subtle ambient lighting
    var ambientLight = new THREE.AmbientLight(0x0c0c0c);
    scene.add(ambientLight);

    //add spotlight for the shadows
    var pointLight = new THREE.PointLight(0xffffff);
    pointLight.position.set(-40, 60, -10);
    scene.add(pointLight);

    var axes = new THREE.AxisHelper(20);
    scene.add(axes);


    //create the ground plane
    var planeGeometry = new THREE.PlaneGeometry(60, 40, 1, 1);
    var planeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
    var plane = new THREE.Mesh(planeGeometry, planeMaterial);

    plane.rotation.x = -0.5 * Math.PI;
    plane.position.x = 0;
    plane.position.y = 0;
    plane.position.z = 0;

    scene.add(plane);

    //create a cube
    var cubeGeometry = new THREE.BoxGeometry(4, 4, 4);
    var cubeMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
    var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

    cube.position.x = -4;
    cube.position.y = 3;
    cube.position.z = 0;

    scene.add(cube);




    //add the output of the renderer to the html element
    document.getElementById('WebGL-output').appendChild(renderer.domElement);

    

    function render() {
        stats.update();
        cube.visible = controls.visible;
        cube.rotation.x = controls.rotationX;
        cube.rotation.y = controls.rotationY;
        cube.rotation.z = controls.rotationZ;
        cube.scale.set(controls.scaleX, controls.scaleY, controls.scaleZ);

        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }

    function initStats() {
        var stats = new Stats();
        stats.setMode(0); //0:fps,1:ms
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0px';
        stats.domElement.style.top = '0px';
        document.getElementById('Stats-output').appendChild(stats.domElement);
        return stats;
    }


    //call the render function
    var step = 0;
    var controls = new function () {
        this.scaleX = 1;
        this.scaleY = 1;
        this.scaleZ = 1;

        this.positionX = 0;
        this.positionY = 0;
        this.positionZ = 0;

        this.rotationX = 0;
        this.rotationY = 0;
        this.rotationZ = 0;

        this.visible = true;

        this.exportScene = function () {
            var exporter = new THREE.SceneExporter();
            var sceneJson = JSON.stringify(exporter.parse(scene));
            localStorage.setItem('scene', sceneJson);
        };
        this.clearScene = function () {
            scene = new THREE.Scene();
        };
        this.importScene = function () {
            var json = localStorage.getItem('scene');
            var sceneLoader = new THREE.SceneLoader();
            sceneLoader.parse(JSON.parse(json), function (e) {
                scene = e.scene;
            }, '.');
        }
    }
    var gui = new dat.GUI();
    gui.add(controls, "exportScene");
    gui.add(controls, "clearScene");
    gui.add(controls, "importScene");
    guiScale = gui.addFolder('scale');
    guiScale.add(controls, 'scaleX', 0, 5);
    guiScale.add(controls, 'scaleY', 0, 5);
    guiScale.add(controls, 'scaleZ', 0, 5);

    guiPosition = gui.addFolder('position');
    var contX = guiPosition.add(controls, 'positionX', -10, 10);
    var contY = guiPosition.add(controls, 'positionY', -4, 20);
    var contZ = guiPosition.add(controls, 'positionZ', -10, 10);

    contX.listen();
    contX.onChange(function (value) {
        cube.position.x = controls.positionX;
    });

    contY.listen();
    contY.onChange(function (value) {
        cube.position.y = controls.positionY;
    });

    contZ.listen();
    contZ.onChange(function (value) {
        cube.position.z = controls.positionZ;
    });

    guiRotation = gui.addFolder('rotation');
    guiRotation.add(controls, 'rotationX', -4, 4);
    guiRotation.add(controls, 'rotationY', -4, 4);
    guiRotation.add(controls, 'rotationZ', -4, 4);

    gui.add(controls, 'visible');


    render();

    //场景对浏览器的自适应
    window.addEventListener('resize',onResize,false);
    function onResize(){
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight);
    }

    //选中图形
    document.addEventListener('mousedown', onDocumentMouseDown, false);
    function onDocumentMouseDown(event) {

        var vector = new THREE.Vector3(( event.clientX / window.innerWidth ) * 2 - 1, -( event.clientY / window.innerHeight ) * 2 + 1, 0.5);
        vector = vector.unproject(camera);

        var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());

        var intersects = raycaster.intersectObjects([cube]);

        if (intersects.length > 0) {

            console.log(intersects[0]);

            intersects[0].object.material.transparent = true;
            intersects[0].object.material.opacity = 0.5;
        }
    }


}
window.onload = init()