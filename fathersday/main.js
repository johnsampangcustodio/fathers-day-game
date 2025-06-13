// --- Scene Elements ---
const scenes = {
    one: document.getElementById("scene-one"),
    two: document.getElementById("scene-two"),
    three: document.getElementById("scene-three"),
    four: document.getElementById("scene-four"),
  };
  
  // --- Utility: Show one scene, hide others ---
  function showScene(sceneKey) {
    Object.entries(scenes).forEach(([key, scene]) => {
      if (key === sceneKey) {
        scene.style.display = "flex";
        // Delay adding .active slightly for transition
        setTimeout(() => scene.classList.add("active"), 10);
      } else {
        scene.classList.remove("active");
        // Wait for fade-out before hiding
        setTimeout(() => {
          scene.style.display = "none";
        }, 300);
      }
    });
  }
  
  // --- Scene Navigation Handlers ---
  
  // Main Menu
  document.getElementById("play-button").addEventListener("click", () => {
    showScene("two");
    startGame(); // Placeholder for game start logic
  });
  
  document.getElementById("extra-button").addEventListener("click", () => {
    showScene("four");
  });
  
  // Game Over Return
  document.getElementById("return-button-1").addEventListener("click", () => {
    showScene("one");
  });
  
  // Extra Note Return
  document.getElementById("return-button-2").addEventListener("click", () => {
    showScene("one");
  });
  
  // Replay
  document.getElementById("replay-button").addEventListener("click", () => {
    showScene("two");
    startGame(); // Restart game logic
  });
  
  // --- Placeholder Game Control Functions ---
  
  function startGame() {
    console.log("Game started");
    // Here you will initialize or reset your game loop
  }
  
  function endGame(finalScore) {
    cancelAnimationFrame(animationId);
    document.getElementById("final-score").textContent = `Score: ${finalScore}`;
    showScene("three");
  }
  
  
  // --- Game Variables ---
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

let animationId;
let score = 0;
let player;
let obstacles = [];
let frame = 0;

// --- Game Object Templates ---
class Player {
    constructor() {
      this.baseX = canvas.width / 2;
      this.x = this.baseX;
      this.y = canvas.height - 100;
      this.width = 20;
      this.height = 30;
  
      this.bobPhase = 0; // for idle bobbing animation
      this.speed = 5;
    }
  
    draw() {
      const bobOffset = Math.sin(this.bobPhase) * 2;
  
      ctx.save();
      ctx.translate(this.x, this.y + bobOffset);
  
      // Head
      ctx.beginPath();
      ctx.arc(0, -20, 12, 0, Math.PI * 2); // Large head above body
      ctx.fillStyle = "#000";
      ctx.fill();
  
      // Body
      ctx.fillRect(-5, -10, 10, 20); // narrow body
  
      // Arms
      ctx.fillRect(-10, -10, 5, 10); // left arm
      ctx.fillRect(5, -10, 5, 10);   // right arm
  
      // Legs
      ctx.fillRect(-6, 10, 5, 8);    // left leg
      ctx.fillRect(1, 10, 5, 8);     // right leg
  
      ctx.restore();
  
      this.bobPhase += 0.1; // advance animation phase
    }
  
    move(dir) {
      if (dir === "left" && this.x - this.speed - 12 > 0) this.x -= this.speed;
      if (dir === "right" && this.x + this.speed + 12 < canvas.width) this.x += this.speed;
    }
  }
  

  class Obstacle {
    constructor() {
      this.types = ["fish", "coral"];
      this.type = this.types[Math.floor(Math.random() * this.types.length)];
  
      this.width = this.type === "fish" ? 40 : 30;
      this.height = this.type === "fish" ? 20 : 40;
  
      this.x = Math.random() * (canvas.width - this.width);
      this.y = canvas.height + this.height; // spawn below screen
  
      this.speed = 2 + Math.random() * 2;
      this.color = getRandomColor();
    }
  
    update() {
      this.y -= this.speed;
      this.draw();
    }
  
    draw() {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
      
        // Fish shape
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(-this.width / 2, 0);               // start at left
        ctx.quadraticCurveTo(0, -this.height / 2, this.width / 2, 0);  // top curve
        ctx.quadraticCurveTo(0, this.height / 2, -this.width / 2, 0);  // bottom curve
        ctx.fill();
      
        // Tail (triangle)
        ctx.beginPath();
        ctx.moveTo(-this.width / 2, 0);
        ctx.lineTo(-this.width / 2 - 8, -6);
        ctx.lineTo(-this.width / 2 - 8, 6);
        ctx.closePath();
        ctx.fill();
      
        ctx.restore();
      }
  }

// --- Utility ---
function getRandomColor() {
    const palette = [
      "#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF", "#F72585", "#3A86FF",
      "#FF9F1C", "#8338EC", "#06D6A0", "#FF595E"
    ];
    return palette[Math.floor(Math.random() * palette.length)];
  }

function updateScore() {
  const scoreEl = document.getElementById("score-display");
  scoreEl.textContent = `Score: ${score}`;

  // Animate bump
  scoreEl.style.transform = "scale(1.3)";
  setTimeout(() => {
    scoreEl.style.transform = "scale(1)";
  }, 100);
}

// --- Game Functions ---
function startGame() {
    cancelAnimationFrame(animationId); // kill old loop just in case
    score = 0;
    frame = 0;
    isGameOver = false;
    obstacles = [];
    player = new Player();
    updateScore();
    animate();
  }
  

let isGameOver = false;

function animate() {
  if (isGameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);



  player.draw();

  // Spawn logic
  if (frame % Math.floor(60 + Math.random() * 40) === 0) {
    obstacles.push(new Obstacle());
  }

  // Update obstacles
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i];
    obs.update();

    const collides =
      player.x - 12 < obs.x + obs.width &&
      player.x + 12 > obs.x &&
      player.y - 20 < obs.y + obs.height &&
      player.y + 20 > obs.y;

    if (collides && !isGameOver) {
      isGameOver = true;
      flashAndEndGame(score);
      return;
    }

    // Off-screen (dodged)
    if (obs.y + obs.height < 0) {
      score++;
      updateScore();
      obstacles.splice(i, 1);
    }
  }

  frame++;
  if (frame % 30 === 0) {
    for (let i = 0; i < 2; i++) {
      ctx.beginPath();
      const bx = Math.random() * canvas.width;
      const by = Math.random() * canvas.height;
      const r = Math.random() * 2 + 1;
      ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
      ctx.arc(bx, by, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  animationId = requestAnimationFrame(animate);
}

// --- Input Handling ---
document.addEventListener("keydown", (e) => {
  if (!player) return;
  if (e.key === "ArrowLeft" || e.key === "a") player.move("left");
  if (e.key === "ArrowRight" || e.key === "d") player.move("right");
});

document.getElementById("left-btn").addEventListener("touchstart", () => {
    if (player) player.move("left");
  });
  
  document.getElementById("right-btn").addEventListener("touchstart", () => {
    if (player) player.move("right");
  });
  

function flashAndEndGame(finalScore) {
    const flash = document.createElement("div");
    flash.style.position = "absolute";
    flash.style.top = 0;
    flash.style.left = 0;
    flash.style.width = "100%";
    flash.style.height = "100%";
    flash.style.backgroundColor = "white";
    flash.style.opacity = "0.8";
    flash.style.zIndex = 1000;
    flash.style.transition = "opacity 0.3s ease";
  
    document.body.appendChild(flash);
  
    setTimeout(() => {
      flash.style.opacity = "0";
    }, 100);
  
    setTimeout(() => {
      document.body.removeChild(flash);
      endGame(finalScore);
    }, 300);
  }
  