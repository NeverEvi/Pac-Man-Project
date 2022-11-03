const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
const scoreEl = document.querySelector('#scoreEl')
const hudEl = document.querySelector('#hud')



canvas.width = 440;
canvas.height = 550;


  


class Boundary {
  static width = 40;static height = 40
  constructor({ position, image }) {
    this.position = position;
    this.width = 40;
    this.height = 40;
    this.image = image

  }
  draw() {
    c.drawImage(this.image, this.position.x, this.position.y)
  }
}

class Player {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = 15;
    this.radians = 0.75
    this.openRate = 0.12
    this.rotation = 0
    this.speed = 4
  }

  draw() {
    c.save()
    c.translate(this.position.x, this.position.y)
    c.rotate(this.rotation)
    c.translate(-this.position.x, -this.position.y)
    c.beginPath()
    c.arc(
      this.position.x, 
      this.position.y, 
      this.radius, this.radians, 
      Math.PI * 2 - this.radians
      )
    c.lineTo(this.position.x, this.position.y)
    c.fillStyle = 'yellow'
    c.fill()
    c.closePath()
    c.restore()
  }
  update() {
    this.draw()
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y

    if (this.radians < 0 || this.radians > 0.75) this.openRate 
      = -this.openRate
      this.radians += this.openRate

    
  }
}

class Ghost {
  static speed = 2
  constructor({ position, velocity, color = 'red', name = ""}) {
    this.position = position;
    this.velocity = velocity;
    this.radius = 15;
    this.color = color
    this.prevCollisions = []
    this.speed = 2
    this.scared = false
    this.name = name
  }

  draw() {
    c.beginPath()
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 1.6)
    c.fillStyle = this.scared ? 'blue' : this.color
    c.fill()
    c.closePath()

  }
  update() {
    this.draw()
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y
  }
}

class Pellet {
  constructor({ position }) {
    this.position = position;
    this.radius = 3;
  }
  draw() {
    c.beginPath()
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
    c.fillStyle = 'white'
    c.fill()
    c.closePath()
  }
}
class PowerUp {
  constructor({ position }) {
    this.position = position;
    this.radius = 8;
  }
  draw() {
    c.beginPath()
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
    c.fillStyle = 'white'
    c.fill()
    c.closePath()
  }
}

const pellets = []
const boundaries = []
const powerUps = []
const ghosts = [
  new Ghost({
    position: {
      x: (Boundary.width * 1) + Boundary.width/2,
      y: (Boundary.height * 1) + Boundary.height/2
    },
    velocity: {
      x: Ghost.speed,
      y: 0
    },
    name: "Blinky"
  }),
  new Ghost({
    position: {
      x: (Boundary.width * 8) + Boundary.width/2,
      y: (Boundary.height * 1) + Boundary.height/2
    },
    velocity: {
      x: Ghost.speed,
      y: 0
    },
    color: '#33dcf2',
    name: "Inky"
  }),
  new Ghost({
    position: {
      x: (Boundary.width * 8) + Boundary.width/2,
      y: (Boundary.height * 11) + Boundary.height/2
    },
    velocity: {
      x: Ghost.speed,
      y: 0
    },
    color: 'pink',
    name: "Pinky"
  }),
  new Ghost({
    position: {
      x: (Boundary.width * 1) + Boundary.width/2,
      y: (Boundary.height * 11) + Boundary.height/2
    },
    velocity: {
      x: Ghost.speed,
      y: 0
    },
    color: 'orange',
    name: "Clyde"
  }),
]

const player = new Player({
  position: {
    x: Boundary.width * 5 + Boundary.height/2,
    y: Boundary.height * 8 + Boundary.height/2
  },
  velocity: {
    x: 0,
    y: 0
  }
})
const keys = {
  w: {
    pressed: false
  },
  a: {
    pressed: false
  },
  s: {
    pressed: false
  },
  d: {
    pressed: false
  }
}
let lastKey = ''
let score = 0

const map = [
//  1    2    3    4    5    6    7    8    9    10   11
  ['1', '-', '-', '-', '-', '-', '-', '-', '-', '-', '2'], //1
  ['|', 'O', '.', '.', '.', '.', '.', '.', '.', 'O', '|'], //2
  ['|', '.', 'b', '.', 'L', '5', 'R', '.', 'b', '.', '|'], //3
  ['|', '.', '.', '.', '.', 'D', '.', '.', '.', '.', '|'], //4
  ['|', '.', 'L', 'R', '.', '.', '.', 'L', 'R', '.', '|'], //5
  ['|', '.', '.', '.', '.', 'U', '.', '.', '.', '.', '|'], //6
  ['|', '.', 'b', '.', 'L', '+', 'R', '.', 'b', '.', '|'], //7
  ['|', '.', '.', '.', '.', 'D', '.', '.', '.', '.', '|'], //8
  ['|', '.', 'L', 'R', '.', ' ', '.', 'L', 'R', '.', '|'], //9
  ['|', '.', '.', '.', '.', 'U', '.', '.', '.', '.', '|'], //10
  ['|', '.', 'b', '.', 'L', '6', 'R', '.', 'b', '.', '|'], //11
  ['|', 'O', '.', '.', '.', '.', '.', '.', '.', 'O', '|'], //12
  ['4', '-', '-', '-', '-', '-', '-', '-', '-', '-', '3']  //13
]

function createImage(src) {
  const image = new Image()
  image.src = src
  return image
}

map.forEach((row, i) => {
  row.forEach((symbol, j) => {
    switch (symbol) {
      case '-':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i
            },
            image: createImage('./image/pipeHorizontal.png')
          })
        )
        break;
      case '|':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i
            },
            image: createImage('./image/pipeVertical.png')
          })
        )
        break;
      case '1':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i
            },
            image: createImage('./image/pipeCorner1.png')
          })
        )
        break;
      case '2':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i
            },
            image: createImage('./image/pipeCorner2.png')
          })
        )
        break;
      case '3':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i
            },
            image: createImage('./image/pipeCorner3.png')
          })
        )
        break;
      case '4':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i
            },
            image: createImage('./image/pipeCorner4.png')
          })
        )
        break;
      case 'b':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i
            },
            image: createImage('./image/block.png')
          })
        )
        break;
      case 'L':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i
            },
            image: createImage('./image/capLeft.png')
          })
        )
        break;
      case 'R':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i
            },
            image: createImage('./image/capRight.png')
          })
        )
        break;
      case 'U':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i
            },
            image: createImage('./image/capTop.png')
          })
        )
        break;
      case 'D':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i
            },
            image: createImage('./image/capBottom.png')
          })
        )
        break;
      case '+':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i
            },
            image: createImage('./image/pipeCross.png')
          })
        )
        break;
      case '5':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i
            },
            image: createImage('./image/pipeConnectorBottom.png')
          })
        )
        break;
      case '6':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i
            },
            image: createImage('./image/pipeConnectorTop.png')
          })
        )
        break;
      case '.':
        pellets.push(
          new Pellet({
            position: {
              x: j * Boundary.width + Boundary.width /2,
              y: i * Boundary.height + Boundary.height /2
            },
          })
        )
        break;
      case 'O':
        powerUps.push(
          new PowerUp({
            position: {
              x: j * Boundary.width + Boundary.width /2,
              y: i * Boundary.height + Boundary.height /2
            },
          })
        )
        break;
    }
  })
})

function circleCollidesWithRectangle({
  circle,
  rectangle
}) {
  const padding = Boundary.width/2 - circle.radius - 1
  return (circle.position.y - circle.radius + circle.velocity.y <= rectangle.position.y + rectangle.height + padding
    && circle.position.x + circle.radius + circle.velocity.x >= rectangle.position.x - padding
    && circle.position.y + circle.radius + circle.velocity.y >= rectangle.position.y - padding
    && circle.position.x - circle.radius + circle.velocity.x <= rectangle.position.x + rectangle.width + padding)

}

let animationID 
function animate() {
  animationID = requestAnimationFrame(animate)
  c.clearRect(0, 0, canvas.width, canvas.height)
  
  if (keys.w.pressed && lastKey === 'w') {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i]
      if (
        circleCollidesWithRectangle({
          circle: {...player, velocity: {
            x: 0,
            y: -5
          }},
          rectangle: boundary
        })
      ) {
        player.velocity.y = 0
        break
      } else {
        player.velocity.y = -5
      }
    }
  } else if(keys.a.pressed && lastKey === 'a') {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i]
      if (
        circleCollidesWithRectangle({
          circle: {...player, velocity: {
            x: -5,
            y: 0
          }},
          rectangle: boundary
        })
      ) {
        player.velocity.x = 0
        break
      } else {
        player.velocity.x = -5
      }
    }
  } else if(keys.s.pressed && lastKey === 's') {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i]
      if (
        circleCollidesWithRectangle({
          circle: {...player, velocity: {
            x: 0,
            y: 5
          }},
          rectangle: boundary
        })
      ) {
        player.velocity.y = 0
        break
      } else {
        player.velocity.y = 5
      }
    }
  } else if(keys.d.pressed && lastKey === 'd') {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i]
      if (
        circleCollidesWithRectangle({
          circle: {...player, velocity: {
            x: 5,
            y: 0
          }},
          rectangle: boundary
        })
      ) {
        player.velocity.x = 0
        break
      } else {
        player.velocity.x = 5
      }
    }
  }
  //detect collision ghosts
  for (let i = ghosts.length - 1; 0 <= i; i--) {
    const ghost = ghosts[i]
    if (
      Math.hypot(
        ghost.position.x - player.position.x, 
        ghost.position.y - player.position.y
      ) < 
      ghost.radius + player.radius
    ) {

      if (ghost.scared) {
        ghosts.splice(i, 1)
        score += 50
        scoreEl.innerHTML = score
      } else {
        let deathSound = new Audio('Death.mp3')
        deathSound.volume = 0.3
        deathSound.play()
        cancelAnimationFrame(animationID)
        console.log("You LOSE")
        hudEl.innerHTML = "YOU LOSE, killed by "
        hudEl.innerHTML += ghost.name
        document.getElementById('newgame').style.visibility='visible'
        
      }
    }
  }

  //win
  if(pellets.length === 0) {
    console.log('You WIN')
    hudEl.innerHTML = "YOU WIN"
    document.getElementById('newgame').style.visibility='visible'
    cancelAnimationFrame(animationID)
    
  }

  //powerups
  for (let i = powerUps.length - 1; 0 <= i; i--) {
    const powerUp = powerUps[i]
    powerUp.draw()
    if (
      Math.hypot(
        powerUp.position.x - player.position.x, 
        powerUp.position.y - player.position.y
      ) < 
      powerUp.radius + player.radius
    ) {
      powerUps.splice(i, 1)
      score += 30
      scoreEl.innerHTML = score

      //debuff ghosts
      ghosts.forEach((ghost) => {  //
        ghost.scared = true

        setTimeout(() => {
          ghost.scared = false

        }, 4000)
      })
    }
  }


  for (let i = pellets.length - 1; 0 <= i; i--) {
    const pellet = pellets[i]
    pellet.draw()

    if (
      Math.hypot(
        pellet.position.x - player.position.x, 
        pellet.position.y - player.position.y
      ) < 
      pellet.radius + player.radius
    ) {
        pellets.splice(i, 1)
        //let chompSound = new Audio('Chomp.mp3')
        //chompSound.volume = 0.2
        //chompSound.play()
        score += 10
        scoreEl.innerHTML = score
    }
  }

    
  

  boundaries.forEach((boundary) => {
    boundary.draw()

    if (
      circleCollidesWithRectangle({
        circle: player,
        rectangle: boundary
      })
    ) {
      console.log("COLLISION!")
      player.velocity.x = 0
      player.velocity.y = 0
    }
  })
  player.update()

  ghosts.forEach((ghost) => {
    ghost.update()

     
    const collisions = []
    boundaries.forEach(boundary => {
      if (
        !collisions.includes('right') &&
        circleCollidesWithRectangle({
          circle: {
            ...ghost, 
            velocity: {
              x: ghost.speed,
              y: 0
            }
          },
          rectangle: boundary
        })
      ) {
        collisions.push('right')
      }
      if (
        !collisions.includes('left') &&
        circleCollidesWithRectangle({
          circle: {
            ...ghost, 
            velocity: {
              x: -ghost.speed,
              y: 0
            }
          },
          rectangle: boundary
        })
      ) {
        collisions.push('left')
      }
      if (
        !collisions.includes('down') &&
        circleCollidesWithRectangle({
          circle: {
            ...ghost, 
            velocity: {
              x: 0,
              y: ghost.speed
            }
          },
          rectangle: boundary
        })
      ) {
        collisions.push('down')
      }
      if (
        !collisions.includes('up') &&
        circleCollidesWithRectangle({
          circle: {
            ...ghost, 
            velocity: {
              x: 0,
              y: -ghost.speed
            }
          },
          rectangle: boundary
        })
      ) {
        collisions.push('up')
      }
    })
    if (collisions.length > ghost.prevCollisions.length)
      ghost.prevCollisions = collisions
    
    if (JSON.stringify(collisions) !== JSON.stringify(ghost.
      prevCollisions)) {
      if (ghost.velocity.x > 0) ghost.prevCollisions.push('right')
      else if (ghost.velocity.x < 0) ghost.prevCollisions.push('left')
      else if (ghost.velocity.y > 0) ghost.prevCollisions.push('down')
      else if (ghost.velocity.y < 0) ghost.prevCollisions.push('up')


      const pathways = ghost.prevCollisions.filter((collision 
        ) => {
        return !collisions.includes(collision)
      })
      const direction = pathways[Math.floor(Math.random() * pathways.length)]

      switch (direction) {
        case 'down':
          ghost.velocity.y=  ghost.speed
          ghost.velocity.x=  0
          break
        case 'up':
          ghost.velocity.y= -ghost.speed
          ghost.velocity.x=  0
          break
        case 'left':
          ghost.velocity.y=  0
          ghost.velocity.x= -ghost.speed
          break
        case 'right':
          ghost.velocity.y=  0
          ghost.velocity.x=  ghost.speed
          break
      }

      ghost.prevCollisions = []
    }
    //console.log(collisions)
  })

  if(player.velocity.x > 0) player.rotation = 0
  else if(player.velocity.x < 0) player.rotation = Math.PI
  else if(player.velocity.y > 0) player.rotation = Math.PI / 2
  else if(player.velocity.y < 0) player.rotation = Math.PI * 1.5
}

animate()

addEventListener('keydown', ({key}) => {
  switch (key) {
    case 'w':
      keys.w.pressed = true
      lastKey = 'w'
      break
    case 'a':
      keys.a.pressed = true
      lastKey = 'a'
      break
    case 's':
      keys.s.pressed = true
      lastKey = 's'
      break
    case 'd':
      keys.d.pressed = true
      lastKey = 'd'
      break
  }
})
addEventListener('keyup', ({key}) => {
  switch (key) {
    case 'w':
      keys.w.pressed = false
      break
    case 'a':
      keys.a.pressed = false
      break
    case 's':
      keys.s.pressed = false
      break
    case 'd':
      keys.d.pressed = false
      break
  }
})