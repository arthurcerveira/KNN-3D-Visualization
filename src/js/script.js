const fieldnames = ["age", "year_operation", "nodes"]

function createObject(point, bufferInfo, VAO, array, red = 0) {
  let pointClass = point.status;
  let u_colorMult = [0, 0, 0, 1]

  u_colorMult[pointClass] = 1;
  // Red differentiate original data from added data
  u_colorMult[0] = red;

  const cubeUniforms = {
    u_colorMult: u_colorMult,
    u_matrix: m4.identity(),
  };

  let pointConfig = { ...defaultConfig };
  pointConfig.translate_x = point.age * KNNConfig.Offset;
  pointConfig.translate_y = point.year_operation * KNNConfig.Offset;
  pointConfig.translate_z = point.nodes * KNNConfig.Offset;

  pointConfig.scale_x = 1;
  pointConfig.scale_y = 1;
  pointConfig.scale_z = 1;

  let pointObj = {
    bufferInfo: { ...bufferInfo[pointClass] },
    vertexArray: VAO[pointClass],
    config: { ...pointConfig },
    uniforms: { ...cubeUniforms }
  };

  array.push(pointObj);

  return pointObj;
}

var curva = []
var cor = []

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
    "1": [],
    "2": []
  };

  for (let index = 0; index < K; index++) {
    let pointClass = neighbors[index].status;
    let neighborIndex = neighbors[index].index;

    nearest_neighbors[pointClass].push(neighborIndex);
  }

  // Return class with highest lenght
  if (nearest_neighbors["1"].length >= nearest_neighbors["2"].length)
    return {
      status: 1,
      neighbors: nearest_neighbors[1]
    }
  else return {
    status: 2,
    neighbors: nearest_neighbors[2]
  }
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

  var previousCamera = "camera_1";

  function render(now) {
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
    var cameraTranslate = [cameraCFG.translate_x,
                            cameraCFG.translate_y,
                            cameraCFG.translate_z];

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

    gl.useProgram(meshProgramInfo.program);
    
    // [Arthur] Create objects based on available data
    objectsArray = [];
    data.forEach(
      point => createObject(point, bufferInfo, VAO, objectsArray)
    )
    
    // [Arthur] Add new objects
    addedObjects = [];
    addedData.forEach(point => {
      let prediction = KNN(point, KNNConfig.K);
      point.status = prediction.status;

      let pointObj = createObject(point, bufferInfo, VAO, addedObjects, 1);

      // [Arthur] Get object position
      let startPosition = [pointObj.config.translate_x / 50,
                           pointObj.config.translate_y / 50,
                           pointObj.config.translate_z / 50];

      // [Arthur] Draw lines to neighbors
      prediction.neighbors.forEach(index => {
        curva = [];
        cor = [];

        curva.push(startPosition[0]);
        curva.push(startPosition[1]);
        curva.push(startPosition[2]);

        cor.push(1);
        cor.push(0);
        cor.push(0);
        cor.push(1);

        let neighbor = objectsArray[index];

        let endPosition = [neighbor.config.translate_x / 50,
                           neighbor.config.translate_y / 50,
                           neighbor.config.translate_z / 50];

        curva.push(endPosition[0]);
        curva.push(endPosition[1]);
        curva.push(endPosition[2]);

        cor.push(1);
        cor.push(0);
        cor.push(0);
        cor.push(1);

        let arrays = {
          position: curva,
          color: cor
        };

        // [Arthur] Draw line from startPosition to endPosition
        var objBufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

        // Draw
        var objVAO = twgl.createVAOFromBufferInfo(
          gl,
          meshProgramInfo,
          objBufferInfo,
        );

        gl.bindVertexArray(objVAO);

        var line = {
          u_colorMult: [1, 0, 0, 1],
          u_matrix: m4.identity(),
        }

        line.u_matrix = computeMatrix(
          viewProjectionMatrix,
          [startPosition[0], startPosition[1], startPosition[2]],
          [0, 0, 0],
          [49, 49, 49]
        );

        twgl.setUniforms(meshProgramInfo, line);

        twgl.drawBufferInfo(gl, objBufferInfo, gl.LINES);
      })
    })

    // [Arthur] Remove objects from array if necessary
    if (removeObjConfig.remove) {
      var index = removeObjConfig.objectIndex;

      // [Arthur] Removes object from data
      // [Arthur] The object is removed from objectsArray in the next iteration
      data.splice(index, 1);
      loadGUI();

      removeObjConfig.remove = false;
    }

    //  [Arthur] Iterate the array and draw the objects
    objectsArray.forEach((obj, index) => {
      // Setup all the needed attributes.
      gl.bindVertexArray(obj.vertexArray);

      // [Arthur] Setup object properties
      var translation = [obj.config.translate_x,
                         obj.config.translate_y,
                         obj.config.translate_z];

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

    //  [Arthur] Iterate the array and draw the objects
    addedObjects.forEach((obj, index) => {
      // Setup all the needed attributes.
      gl.bindVertexArray(obj.vertexArray);

      // [Arthur] Setup object properties
      var translation = [obj.config.translate_x,
                         obj.config.translate_y,
                         obj.config.translate_z];

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
