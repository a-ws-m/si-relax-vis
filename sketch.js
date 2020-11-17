const scaleFactor = 400;  // The scale factor by which to multiply fractional coordinates
const sphereSize = 40;

let originalPosTable;
let relaxedPosTable;

let originalPVectors;
let newPVectors;
let dispVectors;
let testCrystal;

let latticePoints;
let superCellPoints;

let c;

let drawOrigin = true;

let maxMag;
let minMag;

function preload() {
  originalPosTable = loadTable("data/original_pos.csv", "csv");
  relaxedPosTable = loadTable("data/relaxed_pos.csv", "csv");
}

function setup() {
  // put setup code here
  c = createCanvas(windowWidth, windowHeight, WEBGL);
  perspective(PI / 5);

  originalPVectors = getVectors(originalPosTable);
  newPVectors = getVectors(relaxedPosTable);

  originalPVectors = originalPVectors.map(convertCrysToCart);
  newPVectors = newPVectors.map(convertCrysToCart);

  dispVectors = calcDisplacementVectors();

  const mags = dispVectors.map(vec => vec.mag());
  maxMag = Math.max.apply(Math, mags);
  minMag = Math.min.apply(Math, mags);

  superCellPoints = [createVector(0, 0, 0)];  // Just a single cell
  superCellPoints.push(createVector(1, 0, 0)); // Required
  superCellPoints.push(createVector(0, 0, -1)); // Required
  superCellPoints.push(createVector(0, -1, 0)); // Needed for period!
  superCellPoints.push(createVector(1, -1, -1)); // Also needed!
  superCellPoints.push(createVector(0, -1, -1)); // To surround our favourite vacancy
  superCellPoints.push(createVector(1, -1, 0)); // To surround our second favourite vacancy

  superCellPoints = superCellPoints.map(convertVector);

  latticePoints = [createVector(0, 0, 0)];
  latticePoints.push(createVector(0.5, 0.5, 0), createVector(0.5, 0, 0.5), createVector(0, 0.5, 0.5));
  latticePoints = latticePoints.map(convertVector);


  testCrystal = [createVector(0, 0, 0), createVector(0.5, 0.5, 0.5)];
  testLattice = [createVector(0, 0, 0)];

  testCrystal = testCrystal.map(convertVector);
  testLattice = testLattice.map(convertVector);
}

function convertCrysToCart(vector) {
  const fccVecs = [createVector(-0.5, 0, 0.5), createVector(0, 0.5, 0.5), createVector(-0.5, 0.5, 0)];
  const vecArray = vector.array();
  let cartVector = createVector(0, 0, 0);
  for (let i = 0; i < fccVecs.length; i++) {
    cartVector.add(p5.Vector.mult(fccVecs[i], vecArray[i]));
  }
  return convertVector(cartVector);
}

function getVectors(table) {
  // Convert a table with three-vectors as rows to an array of p5 vectors
  let vectors = [];
  for (const row of table.getRows()) {
    let rowVector = createVector(float(row.get(0)), float(row.get(1)), float(row.get(2)));
    vectors.push(rowVector);
  }
  return vectors;
}

function calcDisplacementVectors() {
  // Calculate the displacement vectors for each atom
  let displacements = [];
  for (let i = 0; i < originalPVectors.length; i++) {
    let disp = p5.Vector.sub(newPVectors[i], originalPVectors[i]);
    displacements.push(disp);
  }
  return displacements;
}

function drawOriginalLocsWithOrigin() {
  // Draw the original locations of the atoms
  let originalsPlusOrigin = originalPVectors.slice();
  // Add the origin as well
  originalsPlusOrigin.push(createVector(0, 0, 0));
  originalsPlusOrigin = originalsPlusOrigin.map(convertVector);
  drawEveryAtom(originalsPlusOrigin);
}


function drawOriginalLocs() {
  // Draw the original locations of the atoms
  drawEveryAtom(originalPVectors);
}

function drawNewLocs() {
  // Draw the relaxed locations of the atoms
  drawEveryAtom(newPVectors);
}

function drawAtomsFromPoint(latticePoint, atomCoords) {
  // Draw the atoms at the specified coordinates, relative to the given lattice point
  push();
  translate(latticePoint.x, latticePoint.y, latticePoint.z);
  for (const vector of atomCoords) {
    push();
    translate(vector.x, vector.y, vector.z);
    sphere(sphereSize);
    pop();
  }
  pop();
}

function drawDispVectors() {
  // Draw lines between original and new locations of atoms
  for (const superP of superCellPoints) {
    push();
    translate(superP.x, superP.y, superP.z);
    for (const latticeP of latticePoints) {
      push();
      translate(latticeP.x, latticeP.y, latticeP.z);
      for (let i = 0; i < originalPVectors.length; i++) {
        const orig = originalPVectors[i];
        const newP = newPVectors[i];
        line(orig.x, orig.y, orig.z, newP.x, newP.y, newP.z);
      }
      pop();
    }
    pop();
  }
}

function getColourMag(disp) {
  // Get a colour depending on the magnitude of the displacement
  const colVal = map(disp.mag(), minMag, maxMag, 0, 255);
  const c = color(colVal, 0, 255 - colVal);
  return c
}

function drawScaledDispVectors(dispScale) {
  // Draw lines between original and new locations of atoms
  for (const superP of superCellPoints) {
    push();
    translate(superP.x, superP.y, superP.z);
    for (const latticeP of latticePoints) {
      push();
      translate(latticeP.x, latticeP.y, latticeP.z);
      for (let i = 0; i < originalPVectors.length; i++) {
        const orig = originalPVectors[i];
        let newP = p5.Vector.add(orig, dispVectors[i]);
        newP.mult(dispScale);

        stroke(getColourMag(dispVectors[i]));
        line(orig.x, orig.y, orig.z, newP.x, newP.y, newP.z);

        noStroke();
        ambientMaterial(0, 0, 255);
        fill(0, 0, 255);
        push();
        translate(orig.x, orig.y, orig.z);
        sphere(10);
        pop();

        ambientMaterial(255, 0, 0);
        fill(255, 0, 0);
        push();
        translate(newP.x, newP.y, newP.z);
        sphere(10);
        pop();
      }
      pop();
    }
    pop();
  }
}

function drawEveryAtom(pVectors) {
  // Draw an atom at every coordinate, for every supercell and every lattice point
  for (const superP of superCellPoints) {
    push();
    translate(superP.x, superP.y, superP.z);
    for (const latticeP of latticePoints) {
      drawAtomsFromPoint(latticeP, pVectors);
    }
    pop();
  }
}

function convertVector(vector) {
  // Convert a vector using the scalingFactor and inverted z-axis
  const invert = createVector(1, 1, -1);
  let converted = p5.Vector.mult(vector, scaleFactor);
  converted.mult(invert);
  return converted;
}

function drawTestLattice(coords, lattice) {
  // Draw the test crystal
  noStroke();
  ambientMaterial(255);
  fill(255);
  for (const superP of superCellPoints) {
    push();
    translate(superP.x, superP.y, superP.z);
    for (const latticeP of lattice) {
      drawAtomsFromPoint(latticeP, coords);
    }
    pop();
  }
}

function drawUnitCell() {
  let cellParams = createVector(1, 1, 1);
  cellParams = convertVector(cellParams);
  noFill();
  stroke(255);
  push();
  translate(cellParams.x / 2, cellParams.y / 2, cellParams.z / 2);
  box(cellParams.x, cellParams.y, cellParams.z);
  pop();
}

function drawSubUnitCell() {
  let cellParams = createVector(0.5, 0.5, 0.5);
  cellParams = convertVector(cellParams);
  noFill();
  stroke(0, 255, 0);
  push();
  translate(cellParams.x / 2, cellParams.y / 2, cellParams.z / 2);
  box(cellParams.x, cellParams.y, cellParams.z);
  pop();
}

function drawVacancyAtOrigin() {
  noStroke();
  ambientMaterial(255);
  fill(255, 200);
  for (const superP of superCellPoints) {
    push();
    translate(superP.x, superP.y, superP.z);
    for (let latticeP of latticePoints) {
      push();
      translate(latticeP.x, latticeP.y, latticeP.z);
      sphere(10);
      pop();
    }
    pop();
  }
}

function draw() {
  // put drawing code here
  background(0);

  ambientLight(60, 60, 60);
  pointLight(255, 255, 255, 0, 0, 0);
  orbitControl();
  // if (drawOrigin) {
  //   ambientMaterial(255);
  //   fill(255);
  //   drawOriginalLocs();
  // }
  // else {
  //   ambientMaterial(255, 0, 0);
  //   fill(255, 0, 0);
  //   drawNewLocs();
  // }

  drawScaledDispVectors(1.2);
  drawVacancyAtOrigin();
  drawSubUnitCell();

  // drawTestLattice(testCrystal, testLattice);
  // drawUnitCell();
}

function keyPressed() {
  if (keyCode == ENTER) {
    saveCanvas(c);
  }
  else if (keyCode == CONTROL) {
    drawOrigin = !drawOrigin;
  }
}