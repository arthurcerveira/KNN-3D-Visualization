var objectsArray = [];

var addedData = [];
var addedObjects = [];

var animationCameraArray = [];

var KNNConfig = {
  K: 3,
  Offset: 25,
  drawLines: false
}

var addPointConfig = {
  age: 30, 
  year_operation: 60, 
  nodes: 0,
  add: function() {
    addedData.push({
      age: this.age,
      year_operation: this.year_operation,
      nodes: this.nodes
    })
  }
}

const cameras = {
  camera_1: {
    rotate_x: 0,  
    rotate_y: 0, 
    rotate_z: 0, 
    translate_x: 1350,
    translate_y: 1550,
    translate_z: 1800,
    zoom: 40,
  },
  camera_2: {
    rotate_x: 0,  
    rotate_y: 3.8, 
    rotate_z: 0, 
    translate_x: 584,
    translate_y: 1510,
    translate_z: -300,
    zoom: 40,
  },
  camera_3: {
    rotate_x: 0,  
    rotate_y: 1.68, 
    rotate_z: 0, 
    translate_x: 2205,
    translate_y: 1568,
    translate_z: 227,
    zoom: 50,
  }
}

var defaultConfig = {
  rotate_x: degToRad(20),
  rotate_y: degToRad(20), 
  rotate_z: degToRad(20), 
  translate_x: 0,
  translate_y: 0,
  translate_z: 0,
  scale_x: 1,
  scale_y: 1,
  scale_z: 1
};

var cameraConfig = {
  camera: "camera_1",
};

var cameraAnimationConfig = {
  type: "rotate_x",
  time: 0,
  add: function() {
    animationCameraArray.push({
      type: this.type,
      time: this.time
    })
  },
  execute: false,
  start: function() {
    this.execute = true;
  }
};

var removeObjConfig = {
  objectIndex: 0,
  remove: false,
  removeObject: function() {
    this.remove = true;
  },
  select: false,
}

// Define gui outside of loadGUI function
const gui = new dat.GUI({name: 'Menu',
                         closeOnTop: true});

const loadGUI = () => {
  try {
    // Remove folder before creating new ones
    gui.removeFolder(gui.__folders.KNN);
  } catch (err) {
    console.log(err.message)
  }
  
  const KNNMenu = gui.addFolder("KNN");
  KNNMenu.add(KNNConfig, "K", 0, data.length, 1);
  KNNMenu.add(KNNConfig, "Offset", 0, 50, 0.1);
  KNNMenu.add(KNNConfig, "drawLines");

  try {
    // Remove folder before creating new ones
    gui.removeFolder(gui.__folders.Point);
  } catch (err) {
    console.log(err.message);
  }

  const pointMenu = gui.addFolder("Point");
  pointMenu.add(addPointConfig, "age", 20, 90, 1);
  pointMenu.add(addPointConfig, "year_operation", 50, 70, 1);
  pointMenu.add(addPointConfig, "nodes", 0, 50, 1);
  pointMenu.add(addPointConfig, "add");

  try {
    // Remove folder before creating new ones
    gui.removeFolder(gui.__folders.Camera);
  } catch (err) {
    console.log(err.message);
  }

  const cameraMenu = gui.addFolder("Camera");

  cameraOption = cameraConfig.camera;

  cameraMenu.add(cameraConfig, "camera", Object.keys(cameras));

  cameraMenu.add(cameras[cameraOption], "translate_x", -250, 5000, 1);
  cameraMenu.add(cameras[cameraOption], "translate_y", -250, 5000, 1);
  cameraMenu.add(cameras[cameraOption], "translate_z", -5000, 5000, 1);
  cameraMenu.add(cameras[cameraOption], "rotate_x", 0, 6, 0.01);
  cameraMenu.add(cameras[cameraOption], "rotate_y", 0, 6, 0.01);
  cameraMenu.add(cameras[cameraOption], "rotate_z", 0, 6, 0.01);
  cameraMenu.add(cameras[cameraOption], "zoom", 15, 179, 0.1);

  try {
    cameraMenu.removeFolder(cameraMenu.__folders.Animation);
  } catch (err) {
    console.log(err.message);
  }

  const cameraAnimation = cameraMenu.addFolder("Animation");

  var options = Object.keys(cameras[cameraOption]);

  cameraAnimation.add(cameraAnimationConfig, "type", options);
  cameraAnimation.add(cameraAnimationConfig, "time", 0, 20 , 1);
  cameraAnimation.add(cameraAnimationConfig, "add");
  cameraAnimation.add(cameraAnimationConfig, "start");

  try {
    gui.removeFolder(gui.__folders.Objects);
  } catch (err) {
    console.log(err.message);
  }

  const objects = gui.addFolder("Objects");

  var objectsIndex = [...Array(data.length).keys()];

  // Get list of index from array objects
  objects.add(removeObjConfig, "objectIndex", objectsIndex);
  objects.add(removeObjConfig, "removeObject");
  objects.add(removeObjConfig, "select");

  // objectsArray.forEach((obj, index) => {
  //   try {
  //     gui.removeFolder(gui.__folders["Object " + index]);
  //   } catch (err) {
  //     console.log(err.message);
  //   }

  //   const object = gui.addFolder("Object " + index);

  //   object.add(obj.config, "rotate_x", 0, 20, 0.5);
  //   object.add(obj.config, "rotate_y", 0, 20, 0.5);
  //   object.add(obj.config, "rotate_z", 0, 20, 0.5);
  //   object.add(obj.config, "translate_x", -100, 100, 1);
  //   object.add(obj.config, "translate_y", -100, 100, 1);
  //   object.add(obj.config, "translate_z", -100, 100, 1);
  //   object.add(obj.config, "scale_x", 0.1, 5, 0.1);
  //   object.add(obj.config, "scale_y", 0.1, 5, 0.1);
  //   object.add(obj.config, "scale_z", 0.1, 5, 0.1);
  //   object.add(obj.config, "remove_object");

  // // Remove the remaining objects from the menu
  // var folders = Object.keys(gui.__folders).length;
  // var expectedFolders = objectsArray.length + 1;
  // if (folders > expectedFolders) {
  //   for (var index=expectedFolders; index <= folders; index ++)
  //     try {
  //       gui.removeFolder(gui.__folders["Object " + (index - 1)]);
  //     } catch (err) {
  //       console.log(err.message)
  //     }
  // }
};
