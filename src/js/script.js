const fieldnames = ["age", "year_operation", "nodes"]

function createObject(point, bufferInfo, VAO) {
  let pointClass = point.status;
  let u_colorMult = [0, 0, 0, 1]

  u_colorMult[pointClass] = 1;

  const cubeUniforms = {
    u_colorMult: u_colorMult,
    u_matrix: m4.identity(),
  };

  let pointConfig = {...defaultConfig};
  pointConfig.translate_x = point.age * 2;
  pointConfig.translate_y = point.year_operation * 2;
  pointConfig.translate_z = point.nodes * 2;

  pointConfig.scale_x = 0.05;
  pointConfig.scale_y = 0.05;
  pointConfig.scale_z = 0.05;

  objectsArray.push({
    bufferInfo: {...bufferInfo[pointClass]},
    vertexArray: VAO[pointClass],
    config: {...pointConfig},
    uniforms: {...cubeUniforms}
  })
}

function KNN(point, K) {
  let neighbors = [];

  data.forEach((neighbor, index) => {
    let distance = 0;

    fieldnames.forEach((feature) => {
      // Euclidean distance
      distance += (point[feature] - neighbor[feature]) ** 2
    });

    let distance_sqrt = Math.sqrt(distance);

    neighbors.push({
      index: index,
      distance: distance_sqrt,
      status: neighbor.status
    });
  })

  // Sort array by distance
  neighbors.sort((a, b) => a.distance - b.distance);

  // console.log(neighbors)

  nearest_neighbors = {
    "1": 0,
    "2": 0
  };

  for (let index = 0; index < K; index++) {
    let pointClass = neighbors[index].status;

    nearest_neighbors[pointClass] += 1;
  }

  // Return class with highest lenght
  if (nearest_neighbors["1"] >= nearest_neighbors["2"])
    return 1
  else return 2
}

function main() {
  // [Arthur] Initialize then for animation frame rate
  var then = 0;

  const { gl, meshProgramInfo } = initializeWorld();

  const cubeBufferInfo = flattenedPrimitives.createCubeBufferInfo(gl, 20);
  const sphereBufferInfo = flattenedPrimitives.createSphereBufferInfo(gl, 10, 12, 6);

  const cubeVAO = twgl.createVAOFromBufferInfo(
    gl,
    meshProgramInfo,
    cubeBufferInfo,
  );
  const sphereVAO = twgl.createVAOFromBufferInfo(
    gl,
    meshProgramInfo,
    sphereBufferInfo,
  );

  // Array starts with null as classes are the index 1 and 2
  const bufferInfo = [null, cubeBufferInfo, sphereBufferInfo];
  const VAO = [null, cubeVAO, sphereVAO];

  function computeMatrix(viewProjectionMatrix, translation, rotation, scale) {
    var matrix = m4.translate(
      viewProjectionMatrix,
      translation[0],
      translation[1],
      translation[2],
    );
    // [Arthur] Add scaling and other rotation possiblities
    matrix = m4.scale(matrix, 
                      scale[0],
                      scale[1],
                      scale[2]);

    matrix = m4.xRotate(matrix, rotation[0]);
    matrix = m4.yRotate(matrix, rotation[1]);
    matrix = m4.zRotate(matrix, rotation[2]);

    return matrix;
  }

  loadGUI();

  // [Arthur] Create objects based on available data
  objectsArray = [];
  data.forEach(
    point => createObject(point, bufferInfo, VAO)
  )

  var previousCamera = "camera_1";
  
  function render(now) {
    //  [Arthur] Create new object if necessary
    if (addObjConfig.execute) {
      const cubeUniforms = {
        u_colorMult: [1, 0.5, 0.5, 1],
        u_matrix: m4.identity(),
      };
    
      objectsArray.push({
        bufferInfo: {...cubeBufferInfo},
        vertexArray: cubeVAO,
        config: {...defaultConfig},
        uniforms: {...cubeUniforms}
      })

      addObjConfig.execute = false;
      
      // [Arthur] Update GUI with new object
      loadGUI();
    }

    //  [Arthur] Remove objects from array if necessary
    for (var index = objectsArray.length - 1; index >= 0 ; index--) {
      var obj = objectsArray[index];

      if (obj.config.remove) { 
        objectsArray.splice(index, 1);
        index--;
        
        // [Arthur] Update GUI without removed object
        loadGUI();
      }
    }

    // [Arthur] Convert the time to seconds
    now *= 0.001;

    // [Arthur] Make animation independent from user machine
    var deltaTime = now - then;

    // [Arthur] Switch camera
    if (previousCamera !== cameraConfig.camera) {
      previousCamera = cameraConfig.camera;

      // [Arthur] Restart GUI to switch cameras
      loadGUI();
    }
    var cameraCFG = cameras[cameraConfig.camera];

    // [Arthur] Setup camera animation
    if (cameraAnimationConfig.execute && animationCameraArray.length > 0) {
      cameraCFG[animationCameraArray[0].type] += deltaTime * 10;

      animationCameraArray[0].time -= deltaTime;

      // [Arthur] Remove animation from camera array when time gets to 0
      if (animationCameraArray[0].time <= 0) {
        animationCameraArray.shift();
        if (animationCameraArray.lenght === 0) cameraAnimationConfig.execute = false;
      }
    }

    twgl.resizeCanvasToDisplaySize(gl.canvas);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    
    // [Arthur] Get zoom from camera configuration
    var cameraZoom = cameraCFG.zoom;

    var projectionMatrix = m4.perspective(degToRad(cameraZoom), aspect, 1, 2000);

    // Compute the camera's matrix using look at.
    var cameraPosition = [0, 0, 100];
    var target = [0, 0, 0];
    var up = [0, 1, 0];
    var cameraMatrix = m4.lookAt(cameraPosition, target, up);

    // [Arthur] Get position from camera configuration

    // [Arthur] Bezier curve
    if (cameraCFG.activate){
      var t = cameraCFG.t;
      // [Arthur] Get points
      var A = [cameraCFG.P1_x, cameraCFG.P1_y, cameraCFG.P1_z];
      var B = [cameraCFG.P2_x, cameraCFG.P2_y, cameraCFG.P2_z];
      var C = [cameraCFG.P3_x, cameraCFG.P3_y, cameraCFG.P3_z];
      var D = [cameraCFG.P4_x, cameraCFG.P4_y, cameraCFG.P4_z];
      var s = 1 - t; 
      
      // [Arthur] Interpolate points
      var AB = [A[0]*s + B[0]*t, A[1]*s + B[1]*t, A[2]*s + B[2]*t];
      var BC = [B[0]*s + C[0]*t, B[1]*s + C[1]*t, B[2]*s + C[2]*t];
      var CD = [C[0]*s + D[0]*t, C[1]*s + D[1]*t, C[2]*s + D[2]*t];

      // [Arthur] Interpolate interpolated points
      var ABC = [AB[0]*s + BC[0]*t, AB[1]*s + BC[1]*t, AB[2]*s + BC[2]*t];
      var BCD = [BC[0]*s + CD[0]*t, BC[1]*s + CD[1]*t, BC[2]*s + CD[2]*t];

      var cameraTranslate = [ABC[0]*s + BCD[0]*t,
                             ABC[1]*s + BCD[1]*t,
                             ABC[2]*s + BCD[2]*t];

    } else { // Normal translation
      var cameraTranslate = [cameraCFG.translate_x,
                             cameraCFG.translate_y,
                             cameraCFG.translate_z];
    }

    var cameraRotate = [cameraCFG.rotate_x,
                        cameraCFG.rotate_y,
                        cameraCFG.rotate_z];

    cameraMatrix = computeMatrix(cameraMatrix, 
                                 cameraTranslate, 
                                 cameraRotate, 
                                 [1, 1, 1]);

    // Make a view matrix from the camera matrix.
    var viewMatrix = m4.inverse(cameraMatrix);

    var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

    //  [Arthur] Iterate the array and draw the objects
    objectsArray.forEach((obj, index) => {
      gl.useProgram(meshProgramInfo.program);

      // Setup all the needed attributes.
      gl.bindVertexArray(obj.vertexArray); 

      // [Arthur] Setup animation
      if (animationConfig.execute &&
         (animationArray.length > 0) && 
         (parseInt(animationArray[0].object) === index)) {
        obj.config[animationArray[0].type] += deltaTime;

        animationArray[0].time -= deltaTime;

        // [Arthur] Remove animation from array when time gets to 0
        if (animationArray[0].time <= 0) {
          animationArray.shift();
          if (animationArray.length == 0) animationConfig.execute = false;
        }
      }

      // [Arthur] Setup object properties

      // [Arthur] Bezier curve
      if (obj.config.activate){
        var t = obj.config.t;
        // [Arthur] Get points
        var A = [obj.config.P1_x, obj.config.P1_y, obj.config.P1_z];
        var B = [obj.config.P2_x, obj.config.P2_y, obj.config.P2_z];
        var C = [obj.config.P3_x, obj.config.P3_y, obj.config.P3_z];
        var D = [obj.config.P4_x, obj.config.P4_y, obj.config.P4_z];
        var s = 1 - t; 
        
        // [Arthur] Interpolate points
        var AB = [A[0]*s + B[0]*t, A[1]*s + B[1]*t, A[2]*s + B[2]*t];
        var BC = [B[0]*s + C[0]*t, B[1]*s + C[1]*t, B[2]*s + C[2]*t];
        var CD = [C[0]*s + D[0]*t, C[1]*s + D[1]*t, C[2]*s + D[2]*t];

        // [Arthur] Interpolate interpolated points
        var ABC = [AB[0]*s + BC[0]*t, AB[1]*s + BC[1]*t, AB[2]*s + BC[2]*t];
        var BCD = [BC[0]*s + CD[0]*t, BC[1]*s + CD[1]*t, BC[2]*s + CD[2]*t];

        var translation = [ABC[0]*s + BCD[0]*t,
                           ABC[1]*s + BCD[1]*t,
                           ABC[2]*s + BCD[2]*t];

      } else { // Normal translation
        var translation = [obj.config.translate_x,
                           obj.config.translate_y,
                           obj.config.translate_z];
      }
      var scale = [obj.config.scale_x,
                   obj.config.scale_y,
                   obj.config.scale_z];

      var rotation = [obj.config.rotate_x,
                      obj.config.rotate_y,
                      obj.config.rotate_z,];

      obj.uniforms.u_matrix = computeMatrix(
        viewProjectionMatrix,
        translation,
        rotation,
        scale
      );

      // Set the uniforms we just computed
      twgl.setUniforms(meshProgramInfo, obj.uniforms);

      twgl.drawBufferInfo(gl, obj.bufferInfo);
    })
    
    // [Arthur] Remember the current time for the next frame.
    then = now;

	  requestAnimationFrame(render);
  }
    
  requestAnimationFrame(render);
}

main();
