define([
	'goo/shapes/Box',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/math/Vector3',
	'goo/renderer/light/DirectionalLight',
	'goo/renderer/Camera',
	'goo/scripts/Scripts',
	'goo/entities/components/ScriptComponent',

	'goo/occlusionpack/OccludeeComponent',
	'goo/occlusionpack/OccluderComponent'

], function(
	Box,
	Material,
	ShaderLib,
	Vector3,
	DirectionalLight,
	Camera,
	Scripts,
	ScriptComponent,

	OccludeeComponent,
	OccluderComponent
) {

'use strict'

/**
* @param world (goo.world)
* 
*/

function DemoWorld(world) {

	var boxSize = 12
	var boxMesh = new Box(boxSize, boxSize * 2, boxSize);
	var material = new Material(ShaderLib.simpleLit);
	material.wireframe = false;

	var rows = 20;
	var cols = rows;
	var offset = boxSize * 2.3;
	for (var x = 0; x < rows; x++) {
		for (var z = 0; z < cols; z++) {
			var box = world.createEntity(boxMesh, material, [x * offset, 0, z * offset]);
			var boxMeshData = box.meshDataComponent.meshData;
			box.setComponent(new OccludeeComponent(boxMeshData, true));
			box.setComponent(new OccluderComponent(boxMeshData));
			box.addToWorld();
		}
	}

	var sun = world.createEntity(new DirectionalLight(new Vector3(1, 1, 1)), [0, 100, 0]);
	sun.setRotation([-45, 45, 0]);
	sun.addToWorld();

	var camera = new Camera(90, 1, 0.1, 1000);
	camera.lookAt(Vector3.ZERO, Vector3.UNIT_Y);
	var camEntity = world.createEntity(camera, [0, 0, 10]);
	var scriptComponent = new ScriptComponent();
	console.debug("Available scripts: ", Scripts.allScripts());
	scriptComponent.scripts.push(Scripts.create('MouseLookScript'));
	scriptComponent.scripts.push(Scripts.create('WASD', {'walkSpeed': 50}));
	camEntity.setComponent(scriptComponent);
	camEntity.addToWorld();

	this.camera = camera;
	this.material = material;

};

return DemoWorld;

});