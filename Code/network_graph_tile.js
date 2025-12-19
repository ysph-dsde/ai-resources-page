/**
 * This script handles the functionality for the dynamic network graph that builds
 * when hovering over the tiles. Each tile contains a canvas where nodes and edges
 * are drawn, creating an animated network effect.
 * 
 * It includes the following features:
 *    1. Creating nodes with random positions and velocities.
 *    2. Drawing nodes and edges on the canvas.
 *    3. Animating the network with slow movement.
 *    4. Resizing the canvas based on the tile size.
 *    5. Starting and stopping animation on hover events.
 *
 * Author: Shelby Golden, M.S.
 *   Date: December 2025
 * 
 * Note: Written with the assistance of Yale's AI, Clarity.
 */

// Wait for the DOM to load before executing the script
window.addEventListener('load', function () {
  // Initialize network graphs for initially visible tiles
  document.querySelectorAll('.tile:not(.hidden)').forEach((tile, index) => initializeTileGraph(tile, index));

  // Get the "show more" button
  const showMoreBtn = document.getElementById('showMoreBtn');

  // Event listener for the "show more" button
  showMoreBtn.addEventListener('click', function () {
    const hiddenTiles = document.querySelectorAll('.tile.hidden');
    Array.from(hiddenTiles).slice(0, 3).forEach((tile, i) => {
      tile.classList.remove('hidden');
      tile.style.display = 'block';
      initializeTileGraph(tile, i); // Initialize network graph for newly shown tiles
    });
  });
});

// Function to initialize the network graph for each tile
function initializeTileGraph(tile, index) {
  // Select the canvas element within the tile
  const canvas = tile.querySelector('.network-canvas');
  
  // If no canvas found, log an error and exit
  if (!canvas) {
    console.error(`Tile ${index + 1}: Canvas not found.`);
    return;
  }

  // Get the canvas drawing context
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error(`Tile ${index + 1}: Unable to get canvas context.`);
    return;
  }

  // Get the device pixel ratio for high-DPI screens
  const dpr = window.devicePixelRatio || 1;

  // Variable definitions
  let animationFrameId; // Store the animation frame ID
  const nodes = []; // Array to store nodes
  const numNodes = 20; // Number of nodes
  const maxDistance = 150;  // Max distance for drawing lines
  const baseNodeSize = 8; // Base size of nodes
  const basePathWidth = 3; // Base width of paths
  const borderWidth = 1;  // Width of node borders
  const borderColor = "#F0F0F0";  // Border color for nodes
  const speedMultiplier = 0.2; // Speed of node movement
  const tileColor = tile.getAttribute('data-color') || getComputedStyle(document.documentElement).getPropertyValue('--dsde-blue'); // Node color from tile attribute or default

  // Perspective depth variables
  const perspectiveDepth = canvas.height / dpr; // Depth for perspective effect
  const minNodeSize = 5; // Minimum size of nodes

  // Resize the canvas to fit the tile size and maintain aspect ratio
  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;  // Scale width based on pixel ratio
    canvas.height = rect.height * dpr;  // Scale height based on pixel ratio
    ctx.scale(dpr, dpr);  // Scale the drawing context
    canvas.style.width = `${rect.width}px`;  // Set display width
    canvas.style.height = `${rect.height}px`;  // Set display height
  }

  // Create nodes with random positions and velocities
  function createNodes() {
    nodes.length = 0;  // Clear existing nodes
    for (let i = 0; i < numNodes; i++) {
      nodes.push({
        x: Math.random() * canvas.width / dpr,
        y: Math.random() * canvas.height / dpr,
        z: Math.random() * perspectiveDepth, // Add depth
        vx: (Math.random() - 0.5) * speedMultiplier,
        vy: (Math.random() - 0.5) * speedMultiplier,
        vz: (Math.random() - 0.5) * speedMultiplier
      });
    }
  }

  // Draw the background gradient
  function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width / dpr, canvas.height / dpr);
    gradient.addColorStop(0, tileColor);
    gradient.addColorStop(1, "white");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);
  }

  // Get the size of a node based on its depth
  function getNodeSize(z) {
    return minNodeSize + ((baseNodeSize - minNodeSize) * (z / perspectiveDepth));
  }

  // Draw nodes and edges on the canvas
  function draw() {
    drawBackground();
    nodes.forEach((node, index) => {
      // Ensure nodes stay within canvas bounds
      node.x = Math.max(0, Math.min(canvas.width / dpr, node.x)); 
      node.y = Math.max(0, Math.min(canvas.height / dpr, node.y));
      node.z = Math.max(0, Math.min(perspectiveDepth, node.z));

      const nodeSize = getNodeSize(node.z); // Get node size based on depth

      // Draw node with border
      ctx.beginPath();
      ctx.arc(node.x, node.y, nodeSize, 0, Math.PI * 2);
      ctx.fillStyle = tileColor;
      ctx.fill();
      ctx.lineWidth = borderWidth;  // Node border width
      ctx.strokeStyle = borderColor;
      ctx.stroke();

      // Draw edges between nodes
      for (let j = index + 1; j < nodes.length; j++) {
        const otherNode = nodes[j];
        const distance = Math.sqrt((node.x - otherNode.x) ** 2 + (node.y - otherNode.y) ** 2 + (node.z - otherNode.z) ** 2);
        if (distance < maxDistance) {
          const opacity = 1 - distance / maxDistance;
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(otherNode.x, otherNode.y);
          ctx.lineWidth = basePathWidth * (node.z / perspectiveDepth); // Path width based on depth
          ctx.strokeStyle = `rgba(${parseInt(tileColor.slice(1, 3), 16)}, ${parseInt(tileColor.slice(3, 5), 16)}, ${parseInt(tileColor.slice(5, 7), 16)}, ${opacity})`;
          ctx.stroke();
        }
      }
    });
  }

  // Update node positions based on their velocities
  function updateNodes() {
    nodes.forEach((node) => {
      node.x += node.vx;
      node.y += node.vy;
      node.z += node.vz;
      if (node.x < 0 || node.x > canvas.width / dpr) node.vx *= -1;
      if (node.y < 0 || node.y > canvas.height / dpr) node.vy *= -1;
      if (node.z < 0 || node.z > perspectiveDepth) node.vz *= -1;
    });
  }

  // Animate the network graph
  function animate() {
    draw();
    updateNodes();
    animationFrameId = requestAnimationFrame(animate);
  }

  // Perform initial setup
  resizeCanvas();
  createNodes();
  draw();

  // Event listener for starting animation on hover
  tile.addEventListener('mouseover', () => {
    if (!animationFrameId) {
      animate(); // Start animating
    }
  });

  // Event listener for stopping animation on mouse leave
  tile.addEventListener('mouseleave', () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
      draw(); // Redraw static graph to reset movement
    }
  });

  // Event listener for resizing the canvas when the window is resized
  window.addEventListener('resize', () => {
    resizeCanvas();
    draw();
  });
}