/**
 * Returns string name for team.
 * @return {string} for example: 'Navi'
 */
function getName() {
	return "Navi";
};

/**
 * MISS -> missed attack
 * HIT ->	hited ship but ship is not sunk yet
 * SUNK -> ship is dead
 * DUPLICATED -> once again you are attacked this coordinates
 * @param {String} result one of HIT, MISS, SUNK, DUPLICATED.
 * @return {void}
 */
function attackResult(result) {

};

/**
 * Returns coordinates in which player want attack
 * First char is Letter=(A...J) rest chars represents a number=(0...10)
 * @return {string} for example: 'B10'
 */
function attack() {
	return 'B10';
};

export {
  getName,
  attack,
  attackResult,
};
