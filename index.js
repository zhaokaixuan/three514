function init(dom) {
    var domEle = dom;
    var domRect = domEle.getBoundingClientRect();
    var stats = initStats();
    var clock = new THREE.Clock();
    var scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000)

    var camera = new THREE.PerspectiveCamera(45, domRect.width / domRect.height, 0.1, 1000);
    camera.position.x = -30;
    camera.position.y = 50;
    camera.position.z = 20;

    camera.lookAt(new THREE.Vector3(0, 0, 0));

    var renderer = new THREE.WebGLRenderer({ preserveDrawingBuffer: true });
    renderer.setClearColor(new THREE.Color(0xEEEEEE, 1.0));
    renderer.setSize(domRect.width, domRect.height);
    renderer.shadowMapEnabled = true;
    //trackball
    var trackballControls = new THREE.TrackballControls(camera, domEle);
    trackballControls.rotateSpeed = 1.0;
    trackballControls.zoomSpeed = 1.0;
    trackballControls.panSpeed = 1.0;
    trackballControls.staticMoving = true;


    //add subtle ambient lighting
    var ambientLight = new THREE.AmbientLight(0x0c0c0c);
    scene.add(ambientLight);

    //add spotlight for the shadows
    var spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(-40, 60, -10);
    spotLight.castShadow = true;
    scene.add(spotLight);

    var axes = new THREE.AxisHelper(100);
    scene.add(axes);

    var size = 50;
    var divisions = 10;
    var gridHelper = new THREE.GridHelper(size, divisions);
    scene.add(gridHelper);



    //create a cube
    var cubeGeometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(4, 4, 4));

    var cubeMaterial = new THREE.MeshBasicMaterial({
        color: 0x7777ff,
        linewidth: 10
    });
    var cube = new THREE.LineSegments(cubeGeometry, cubeMaterial);

    cube.position.x = 0;
    cube.position.y = 2;
    cube.position.z = 0;

    //scene.add(cube);

    //create a group
    var group = new THREE.Group();
    group.add(cube);
    scene.add(group)


    //add the output of the renderer to the html element
    domEle.appendChild(renderer.domElement);



    function render() {
        stats.update();
        var delta = clock.getDelta();
        trackballControls.update(delta);
        cube.visible = controls.visible;
        cube.rotation.x = controls.rotationX;
        cube.rotation.y = controls.rotationY;
        cube.rotation.z = controls.rotationZ;
        cube.scale.set(controls.scaleX, controls.scaleY, controls.scaleZ);

        renderer.render(scene, camera);
        requestAnimationFrame(render);
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
    domEle.addEventListener('resize', onResize, false);
    function onResize() {
        camera.aspect = domRect.width / domRect.height;
        camera.updateProjectionMatrix();
        renderer.setSize(domRect.width, domRect.height);
    }

    //选中图形
    domEle.addEventListener('mousedown', onDocumentMouseDown, false);
    var INTERSECTED;
    function onDocumentMouseDown(event) {
        event.preventDefault();

        var vector = new THREE.Vector3(((event.clientX - domRect.left) / domRect.width) * 2 - 1, -((event.clientY - domRect.top) / domRect.height) * 2 + 1, 0.5);
        vector = vector.unproject(camera);

        var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
        console.log(scene.children)
        var intersects = raycaster.intersectObjects(group.children);
        console.log(intersects)
        if (intersects.length > 0) {
            if (INTERSECTED != intersects[0].object) {
                if (INTERSECTED) INTERSECTED.material.color.setHex(INTERSECTED.material.currentHex)
                INTERSECTED = intersects[0].object;
                console.log(intersects[0]);
                INTERSECTED.material.currentcolor = INTERSECTED.material.color.getHex();
                INTERSECTED.material.transparent = true;
                INTERSECTED.material.opacity = 0.5;
                INTERSECTED.material.color.setHex(0xec0404);
            }

        } else {
            if (INTERSECTED) INTERSECTED.material.color.setHex(INTERSECTED.material.currentcolor);
            INTERSECTED = null;
        }
    }

}

function init2(dom,num) {
    var domEle = dom;
    var domRect = domEle.getBoundingClientRect();
    var clock = new THREE.Clock();
    var scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000)

    var camera = new THREE.PerspectiveCamera(45, domRect.width / domRect.height, 0.1, 1000);
    switch (num) {
        case 1:
            camera.position.x = 0;
            camera.position.y = 50;
            camera.position.z = 0;
            break;
        case 2:
            camera.position.x = -50;
            camera.position.y = 0;
            camera.position.z = 0;
            break;
        case 3:
            camera.position.x = 0;
            camera.position.y = 0;
            camera.position.z = 50;
            break;
    }

    camera.lookAt(new THREE.Vector3(0, 0, 0));

    var renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(new THREE.Color(0xEEEEEE, 1.0));
    renderer.setSize(domRect.width, domRect.height);
    renderer.shadowMapEnabled = true;
    //trackball
    var orbitControls = new THREE.OrbitControls(camera, domEle);
    orbitControls.target = new THREE.Vector3(0,0,0);
    orbitControls.enableRotate = false;



    //add subtle ambient lighting
    var ambientLight = new THREE.AmbientLight(0x0c0c0c);
    scene.add(ambientLight);

    //add spotlight for the shadows
    var spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(-40, 60, -10);
    spotLight.castShadow = true;
    scene.add(spotLight);



    //create a cube
    var cubeGeometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(4, 4, 4));

    var cubeMaterial = new THREE.MeshBasicMaterial({
        color: 0x7777ff,
        linewidth: 10
    });
    var cube = new THREE.LineSegments(cubeGeometry, cubeMaterial);

    cube.position.x = 0;
    cube.position.y = 2;
    cube.position.z = 0;

    //scene.add(cube);

    //create a group
    var group = new THREE.Group();
    group.add(cube);
    scene.add(group)


    //add the output of the renderer to the html element
    domEle.appendChild(renderer.domElement);



    function render() {
        var delta = clock.getDelta();
        orbitControls.update(delta);

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    render();

    //场景对浏览器的自适应
    domEle.addEventListener('resize', onResize, false);
    function onResize() {
        camera.aspect = domRect.width / domRect.height;
        camera.updateProjectionMatrix();
        renderer.setSize(domRect.width, domRect.height);
    }

    //选中图形
    domEle.addEventListener('mousedown', onDocumentMouseDown, false);
    var INTERSECTED;
    function onDocumentMouseDown(event) {
        event.preventDefault();

        var vector = new THREE.Vector3(((event.clientX - domRect.left) / domRect.width) * 2 - 1, -((event.clientY - domRect.top) / domRect.height) * 2 + 1, 0.5);
        vector = vector.unproject(camera);

        var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
        console.log(scene.children)
        var intersects = raycaster.intersectObjects(group.children);
        console.log(intersects)
        if (intersects.length > 0) {
            if (INTERSECTED != intersects[0].object) {
                if (INTERSECTED) INTERSECTED.material.color.setHex(INTERSECTED.material.currentHex)
                INTERSECTED = intersects[0].object;
                console.log(intersects[0]);
                INTERSECTED.material.currentcolor = INTERSECTED.material.color.getHex();
                INTERSECTED.material.transparent = true;
                INTERSECTED.material.opacity = 0.5;
                INTERSECTED.material.color.setHex(0xec0404);
            }

        } else {
            if (INTERSECTED) INTERSECTED.material.color.setHex(INTERSECTED.material.currentcolor);
            INTERSECTED = null;
        }
    }

}






















init2(document.getElementById('WebGL-output-vertical'), 1)
init2(document.getElementById('WebGL-output-left'), 2)
init2(document.getElementById('WebGL-output-front'), 3)
init(document.getElementById('WebGL-output'))