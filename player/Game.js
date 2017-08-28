const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'J', 'H', 'I', 'J'];
const [HIT, MISS, SUNK, DUPLICATED] = ['HIT', 'MISS', 'SUNK', 'DUPLICATED'];
const [EMPTY_SPOT, SHIP_SPOT, MISS_SPOT, SUNK_SHIP] = [' ', '🛳️', '🎯', '💀'];
const [RANDOM_PHASE, MISS_PHASE, HIT_PHASE] = ['random', 'miss', 'hit'];
const GRID_SIZE = 10;

class Game {
  constructor() {
    this.game_phase = '';
    this.lastHit = [-1, -1];
    this.target = [0, 0];
    this.grid = new Array();
    for (let i = 0; i < GRID_SIZE; i++) {
      const add = new Array();
      for (let j = 0; j < GRID_SIZE; j++) add.push(EMPTY_SPOT);
      this.grid.push(add);
    }
    this.phase(RANDOM_PHASE);
  }

  phase(str) {
    if (str !== undefined && typeof str !== 'string') {
      throw new Error('Game phase should be string.');
    }
    if (str) this.game_phase = str;

    return this.game_phase || '';
  }

  item(i, j, val) {
    if (i < 0 || i > (GRID_SIZE - 1) || j < 0 || j > (GRID_SIZE - 1)) return false;
    if (this.grid[i] === undefined || this.grid[i][j] === undefined) return false;
    if (val !== undefined) this.grid[i][j] = val;

    return this.grid[i][j];
  }

  randomNumber() {
    return Math.floor(Math.random() * GRID_SIZE);
  }

  prepareHit() {
    let temp_target = this.target;
    this.lastHit = this.target;
    this.phase(HIT_PHASE);
    this.item(this.target[0], this.target[1], SHIP_SPOT);
    this.prepareAttack();

    return { target: this.target, temp_target, phase: this.phase() };
  }

  prepareMiss() {
    let temp_target = this.target;
    this.phase(MISS_PHASE);
    this.item(this.target[0], this.target[1], MISS_SPOT);
    this.prepareAttack();

    return { target: this.target, temp_target, phase: this.phase() };
  }

  prepareSunk () {
    let temp_target = this.target;
    this.lastHit = [-1, -1];
    this.phase(RANDOM_PHASE);
    this.markAround(this.target);
    this.prepareAttack();

    return { target: this.target, temp_target, phase: this.phase() };
  }

  prepareDuplicated () {
    let temp_target = this.target;
    this.phase(RANDOM_PHASE);
    this.item(this.target[0], this.target[1], MISS_SPOT);
    this.prepareAttack();

    return { target: this.target, temp_target, phase: this.phase() };
  }

  // TODO: optimize algorythm.
  pickRandom () {
    const a = this.randomNumber();
    const b = this.randomNumber();
    if (this.item(a,b) === EMPTY_SPOT) {
      return [a, b];
    }
    return this.pickRandom();
  }

  prepareAttack () {
    switch (this.phase()) {
      case RANDOM_PHASE:
        this.target = this.pickRandom();
        break;
      
      case MISS_PHASE:
      case HIT_PHASE:
        if (this.lastHit[0] === -1) {
          this.target = this.pickRandom();
          break;
        }
        let firing_spot = this.getShipSpots();
        if (!firing_spot) throw new Error('No firing spots found around');
        this.target = firing_spot;
        break;
      
      default:
        throw new Error('Wrong game phase');
    }
    return {target : this.target};
  }

  searchEmpty(starting, axe, modif) {
    let pointer = starting.slice();
    while (true) {
      pointer[axe] += modif;
      if (this.item(pointer[0], pointer[1]) === false) break;
      if (this.item(pointer[0], pointer[1]) === EMPTY_SPOT) return pointer;
    }
    return new Array();
  }

  getShipSpots() {
    const hits = new Array();
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (this.item(i,j) === SHIP_SPOT) {
          hits.push([i, j]);
        }
      }
    }
    if (!hits.length) return false; // falsy

    if (hits.length === 1) {
      const x = hits[0][0];
      const y = hits[0][1];
      if (this.item(x, y - 1) === EMPTY_SPOT) return [x, y - 1];
      if (this.item(x + 1, y) === EMPTY_SPOT) return [x + 1, y];
      if (this.item(x, y + 1) === EMPTY_SPOT) return [x, y + 1];
      if (this.item(x - 1, y) === EMPTY_SPOT) return [x - 1, y];
    }

    if (hits.length > 1) {
      let available = new Array();
      if (hits[0][0] === hits[1][0]) {
        available.push(this.searchEmpty(hits[0], 1, -1));
        available.push(this.searchEmpty(hits[hits.length - 1], 1, 1));
      } else {
        available.push(this.searchEmpty(hits[0], 0, -1));
        available.push(this.searchEmpty(hits[hits.length - 1], 0, 1));
      }
      available = available.filter((item) => item.length);
      return available.length ? available[0] : false;
    }
  }

  markAround(target) {
    this.item(target[0], target[1], SUNK_SHIP);
    for (let i = -1; i < 2; i++) {
      for (let j = -1; j < 2; j++) {
        const x = target[0] + i;
        const y = target[1] + j;
        const tempTarget = this.item(x, y);
        if (tempTarget !== false) {
          if (tempTarget === EMPTY_SPOT) {
            this.item(x, y, MISS_SPOT);
          }
          if (tempTarget === SHIP_SPOT) {
            this.markAround([x, y]);
          }
        }
      }
    }
  }

  getAim() {
    if (this.target  === undefined || this.target[0] === undefined || this.target[0] === -1) {
      this.prepareMiss();
    }

    return LETTERS[this.target[0]] + (this.target[1] + 1);
  }

  attack() {
    return this.getAim();
  }

  attackResult (result) {
    if (result === HIT) this.prepareHit();
    if (result === MISS) this.prepareMiss();
    if (result === SUNK) this.prepareSunk();
    if (result === DUPLICATED) this.prepareDuplicated();
  };
}

module.exports = Game;
