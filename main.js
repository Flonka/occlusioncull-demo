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
	'goo/entities/components/ScriptComponent',
	'goo/scripts/ScriptUtils',

	'goo/occlusionpack/OcclusionPartitioner',
	'goo/occlusionpack/OccludeeComponent',
	'goo/occlusionpack/OccluderComponent'
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
	ScriptComponent,
	ScriptUtils,

	OcclusionPartitioner,
	OccludeeComponent,
	OccluderComponent
	) {

	'use strict';

	var DEBUG = true;
	var DEBUG_CANVAS_ID = 'debugcanvas'

	var occlusionPartitioner, defaultPartitioner, occlusionCullingEnabled;

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
	material.wireframe = false;

	var boxSize = 4

	for (var i = 0; i < 10; i++) {
		var box = world.createEntity(boxMesh, material, [0, 0, i * boxSize]);
		var boxMeshData = box.meshDataComponent.meshData;
		box.setComponent(new OccludeeComponent(boxMeshData, true));
		box.setComponent(new OccluderComponent(boxMeshData));
		box.addToWorld();
	}

	var sun = world.createEntity(new DirectionalLight(new Vector3(1, 1, 1)), [0, 100, 0]);
	sun.setRotation([-45, 45, 0]);
	sun.addToWorld();

	var camera = new Camera(90, 1, 0.1, 100);
	camera.lookAt(Vector3.ZERO, Vector3.UNIT_Y);
	var camEntity = world.createEntity(camera, [0, 0, 10]);
	var scriptComponent = new ScriptComponent();
	console.debug("Available scripts: ", Scripts.allScripts());
	scriptComponent.scripts.push(Scripts.create('MouseLookScript'));
	scriptComponent.scripts.push(Scripts.create('WASD'));
	camEntity.setComponent(scriptComponent);
	camEntity.addToWorld();

	setupOcclusionCulling(goo, camera);

	goo.startGameLoop();

	window.addEventListener('keydown', function(e) {

		
		if (e.keyCode === ScriptUtils._keys['z']) {
			// Toggle wireframe
			material.wireframe = !material.wireframe;
		} else if (e.keyCode === ScriptUtils._keys['c']) {
			// Switch occlusion partitioner on and off.
			if (occlusionCullingEnabled === true) {
				goo.renderSystem.partitioner = defaultPartitioner;
				occlusionCullingEnabled = false;
				console.debug('Occlusion Culling Disabled');
			} else {
				goo.renderSystem.partitioner = occlusionPartitioner;
				occlusionCullingEnabled = true;
				console.debug('Occlusion Culling Enabled');
			}
		}

	});

	/**
	* Sets up the occlusion culling, size decided from the debugcontext.
	*/
	function setupOcclusionCulling (goo, camera) {

		var SOFTWARE_BUFFER_WIDTH = 64;
		var SOFTWARE_BUFFER_HEIGHT = 32;


		// BUFFER VALUES
		// These values could maybe be read from the meshes loaded. Or just take enough...
		var maxNumberOfOccluderVertices = 104;
		var maxTrianglesPerOccluder = 32;
		var maxNumberOfOccluderIndices = 3 * maxTrianglesPerOccluder;

		var occlusionParameters = {
			'width': SOFTWARE_BUFFER_WIDTH,
			'height': SOFTWARE_BUFFER_HEIGHT,
			'camera': camera,
			'maxVertCount': maxNumberOfOccluderVertices,
			'maxIndexCount': maxNumberOfOccluderIndices
		};

		if (DEBUG === true) {

			console.debug('Debug mode enabled!');

			var debugcanvas = document.createElement('canvas');
			document.body.appendChild(debugcanvas);
			debugcanvas.id = DEBUG_CANVAS_ID;
			debugcanvas.width = SOFTWARE_BUFFER_WIDTH;
			debugcanvas.height = SOFTWARE_BUFFER_HEIGHT;
			var debugContext = debugcanvas.getContext('2d');

			occlusionParameters['debugContext'] = debugContext
		}

		occlusionPartitioner = new OcclusionPartitioner(occlusionParameters);
		defaultPartitioner = goo.renderSystem.partitioner;
		goo.renderSystem.partitioner = occlusionPartitioner;
		occlusionCullingEnabled = true;
	};

});