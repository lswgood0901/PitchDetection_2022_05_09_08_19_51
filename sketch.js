
let audioContext;
let mic;
let pitch;
let facemesh;
let video;
let predictions = [];
let systems = new Array(469);

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(width, height);
  facemesh = ml5.facemesh(video, modelReady);
  facemesh.on("predict", results => {
    predictions = results;
  });
  video.hide();
  for(let i=0; i<systems.length; i++){
    systems[i] = new ParticleSystem(createVector(width/2, 50));
  }

  audioContext = getAudioContext();
  mic = new p5.AudioIn();
  mic.start(startPitch);
}

function modelReady() {
  console.log("Model ready!");
}

function draw() {
  background(0)
  // image(video, 0, 0, width, height);
  drawKeypoints();
}

function drawKeypoints() {
  for (let i = 0; i < predictions.length; i += 1) {
    const keypoints = predictions[i].scaledMesh;

    // Draw facial keypoints.
    for (let j = 0; j < keypoints.length; j += 1) {
      const [x, y] = keypoints[j];
      systems[j].origin = createVector(x, y);
      systems[j].addParticle();
      systems[j].run();
      // fill(0, 255, 0);
      // ellipse(x, y, 5, 5);
    }
  }
}

function startPitch() {
  pitch = ml5.pitchDetection('./model/', audioContext, mic.stream, modelLoaded);
  console.log(pitch)
}

function modelLoaded() {
  select('#status').html('Model Loaded');
  getPitch();
}

function getPitch() {
  pitch.getPitch(function(err, frequency) {
    if (frequency) {
      select('#result').html(frequency);
    } else {
      select('#result').html('No pitch detected');
    }
    getPitch();
  })
}

let Particle = function(position) {
  /*
  //오른쪽으로 점들이 이동(실루엣만)
  this.acceleration = createVector(0.15, 0);
  this.velocity = createVector(random(-1, 0), random(-0.25, 0.25));
  this.position = position.copy();
  this.lifespan = 120;
  */

  //캔버스 중심에서 뻗어나가기
  this.acceleration = createVector(0, 0.0);
  this.position = position.copy();
  this.velocity = createVector((this.position.x - width/2)/100, (this.position.y - height/2)/100);
  this.lifespan = 12;

  
  //오른쪽으로 점들이 이동
  // this.acceleration = createVector(0.15, 0);
  // this.velocity = createVector(random(-1, 0), random(-0.25, 0.25));
  // this.position = position.copy();
  // this.lifespan = 120;
  
};

Particle.prototype.run = function() {
  this.update();
  this.display();
};

// 위치 업데이트를 위한 메소드
Particle.prototype.update = function(){
  this.velocity.add(this.acceleration);
  this.position.add(this.velocity);
  this.lifespan -= 2;
};

// 화면에 보이기 위한 메소드
Particle.prototype.display = function() {
  /*
  //오른쪽으로 점들이 이동(실루엣만)
  colorMode(HSB,100);
  fill(random(0,100), 100, 100, this.lifespan);
  noStroke();
  square(this.position.x, this.position.y, this.lifespan/15);
  */

  //캔버스 중심에서 뻗어나가기
  // stroke(200, this.lifespan);
  // strokeWeight(1);
  colorMode(HSB, 100)
  fill(random(0, 100), 100, 100, this.lifespan)
  noStroke()
  square(this.position.x, this.position.y, this.lifespan/15)
  // line(this.position.x, this.position.y, this.position.x + this.velocity.x, this.position.y + this.velocity.y)

  //오른쪽으로 점들이 이동
  // stroke(200, this.lifespan);
  // strokeWeight(1);
  
  // point(this.position.x, this.position.y);
  
};

Particle.prototype.isDead = function(){
  return this.lifespan < 0;
};

let ParticleSystem = function(position) {
  this.origin = position.copy();
  this.particles = [];
};

ParticleSystem.prototype.addParticle = function() {
  this.particles.push(new Particle(this.origin));
};

ParticleSystem.prototype.run = function() {
  for (let i = this.particles.length-1; i >= 0; i--) {
    let p = this.particles[i];
    p.run();
    if (p.isDead()) {
      this.particles.splice(i, 1);
    }
  }
};