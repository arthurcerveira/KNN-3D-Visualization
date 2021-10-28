var objectsArray = [];
var animationArray = [];
var animationCameraArray = [];

const cameras = {
  camera_1: {
    rotate_x: 0,  
    rotate_y: 0, 
    rotate_z: 0, 
    translate_x: 110,
    translate_y: 125,
    translate_z: 0,
    zoom: 40,
  },
  camera_2: {
    rotate_x: 0,  
    rotate_y: 4.8, 
    rotate_z: 0, 
    translate_x: 22,
    translate_y: 125,
    translate_z: -77,
    zoom: 40,
  },
  camera_3: {
    rotate_x: 0,  
    rotate_y: 0.95, 
    rotate_z: 0, 
    translate_x: 243,
    translate_y: 122,
    translate_z: -5,
    zoom: 15,
  }
}

var addObjConfig = {
  execute: false,
  add_object: function() {
    this.execute = true;
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
  scale_z: 1,
  remove: false,
  remove_object: function() {
    this.remove = true;
  },
};

var animationConfig = {
  object: 0,
  type: "rotate_x",
  time: 0,
  add: function() {
    animationArray.push({
      object: this.object,
      type: this.type,
      time: this.time
    })
  },
  execute: false,
  start: function() {
    this.execute = true;
  }
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

// Define gui outside of loadGUI function
const gui = new dat.GUI({name: 'Menu',
                         closeOnTop: true});
// gui.add(addObjConfig, "add_object");

const loadGUI = () => {
  try {
    // Remove folder before creating new ones
    gui.removeFolder(gui.__folders.Camera);
  } catch (err) {
    console.log(err.message)
  }

  const cameraMenu = gui.addFolder("Camera");

  cameraOption = cameraConfig.camera;

  cameraMenu.add(cameraConfig, "camera", Object.keys(cameras));

  cameraMenu.add(cameras[cameraOption], "translate_x", -250, 250, 1);
  cameraMenu.add(cameras[cameraOption], "translate_y", -250, 250, 1);
  cameraMenu.add(cameras[cameraOption], "translate_z", -250, 250, 1);
  cameraMenu.add(cameras[cameraOption], "rotate_x", 0, 6, 0.01);
  cameraMenu.add(cameras[cameraOption], "rotate_y", 0, 6, 0.01);
  cameraMenu.add(cameras[cameraOption], "rotate_z", 0, 6, 0.01);
  cameraMenu.add(cameras[cameraOption], "zoom", 15, 179, 0.1);

  try {
    cameraMenu.removeFolder(cameraMenu.__folders.Animation);
  } catch (err) {
    console.log(err.message)
  }

  const cameraAnimation = cameraMenu.addFolder("Animation");

  var options = Object.keys(cameras[cameraOption]);

  cameraAnimation.add(cameraAnimationConfig, "type", options);
  cameraAnimation.add(cameraAnimationConfig, "time", 0, 20 , 1);
  cameraAnimation.add(cameraAnimationConfig, "add");
  cameraAnimation.add(cameraAnimationConfig, "start");

  try {
    gui.removeFolder(gui.__folders.Animation);
  } catch (err) {
    console.log(err.message)
  }

  const animation = gui.addFolder("Animation");

  var options = Object.keys(defaultConfig).splice(0, 9);;
  
  // Get list of index from array objects
  var objects = [...Array(objectsArray.length).keys()];
  animation.add(animationConfig, "object", objects);
  animation.add(animationConfig, "type", options);
  animation.add(animationConfig, "time", 0, 20 , 1);
  animation.add(animationConfig, "add");
  animation.add(animationConfig, "start");

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
