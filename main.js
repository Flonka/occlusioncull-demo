require([
	'goo/shapes/Box',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/math/Vector3',
	'goo/entities/GooRunner',
	'goo/entities/EntityUtils',
	'goo/renderer/light/DirectionalLight',
	'goo/renderer/Camera',
	'goo/scripts/Scripts',
	'goo/entities/components/ScriptComponent'
], function (
	Box,
	Material,
	ShaderLib,
	Vector3,
	GooRunner,
	EntityUtils,
	DirectionalLight,
	Camera,
	Scripts,
	ScriptComponent
	) {

	'use strict';

	var options = {
		logo: {
			position: 'bottomright',
			color: '#FFF'
		},
		manuallyStartGameLoop: true,
		showStats: true
	};
	var goo = new GooRunner(options);
	goo.renderer.domElement.id = 'goo';
	document.body.appendChild(goo.renderer.domElement);

	var world = goo.world;

	var boxMesh = new Box();
	var material = new Material(ShaderLib.simpleLit);
	var box1 = world.createEntity(boxMesh, material);

	box1.addToWorld();

	var sun = world.createEntity(new DirectionalLight(new Vector3(1, 1, 1)), [0, 100, 0]);
	sun.setRotation([-45, 45, 0]);
	sun.addToWorld();

	var camera = new Camera();
	camera.lookAt(Vector3.ZERO, Vector3.UNIT_Y);
	var camEntity = world.createEntity(camera, [0, 3, 10]);

	var script = Scripts.create('OrbitNPanControlScript');

	// camera control set up
	var scriptComponent = new ScriptComponent();
	scriptComponent.scripts.push(script);
	camEntity.setComponent(scriptComponent);

	camEntity.addToWorld();

	goo.startGameLoop();
});