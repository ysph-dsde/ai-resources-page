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
* Color Variables:
*    - --dsde-blue: #00356b;
*    - --dsde-purple: #7634a6; 
*
* Author: Shelby Golden, M.S.
*   Date: September 2025
* 
* Note: Written with the assistance of Yale's AI, Clarity.
*/

// Wait for the DOM to load before executing the script
document.addEventListener("DOMContentLoaded", () => {
  // Select all elements with the class 'tile_static_page'
  document.querySelectorAll('.tile_static_page').forEach(tile => {
    // Get the canvas and its context within the tile
    const canvas = tile.querySelector('.network-canvas');
    const ctx = canvas.getContext('2d');

    // Define variables
    let animationFrameId; // Store the animation frame ID
    let nodes = []; // Array to store nodes
    const numNodes = 17; // Number of nodes
    const maxDistance = 150; // Maximum distance for drawing lines
    const baseNodeSize = 10; // Base size of nodes (increased)
    const basePathWidth = 7; // Base path width for lines (increased)
    const borderWidth = 1; // Width of node borders
    const borderColor = "#F0F0F0"; // Border color for nodes
    const speedMultiplier = 0.2; // Lower value for slower movement
    const nodeColor = getComputedStyle(document.documentElement).getPropertyValue('--dsde-purple'); // Adjusted color
    const perspectiveDepth = 100; // Depth for perspective effect
    const minNodeSize = 10; // Minimum node size (increased)
    const backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--dsde-purple'); // Background color

    /**
     * Resize the canvas based on the tile size.
     */
    function resizeCanvas() {
      canvas.width = tile.clientWidth;
      canvas.height = tile.clientHeight;
    }

    /**
     * Create nodes with random positions and velocities.
     */
    function createNodes() {
      nodes = [];
      for (let i = 0; i < numNodes; i++) {
        nodes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          z: Math.random() * perspectiveDepth, // Adding depth
          vx: (Math.random() - 0.5) * speedMultiplier,
          vy: (Math.random() - 0.5) * speedMultiplier,
          vz: (Math.random() - 0.5) * speedMultiplier
        });
      }
    }

    /**
     * Draw background gradient.
     */
    function drawBackground() {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, backgroundColor + "60"); // Lighten background color
      gradient.addColorStop(1, backgroundColor + "00"); // Fully transparent end
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    /**
     * Draw nodes and edges on the canvas.
     */
    function drawNodesAndEdges() {
      // Clear the nodes and edges, not the background
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawBackground(); // Draw the gradient background

      // Draw nodes and edges
      nodes.forEach((node, index) => {
        // Ensure nodes stay within canvas bounds
        node.x = Math.max(0, Math.min(canvas.width, node.x));
        node.y = Math.max(0, Math.min(canvas.height, node.y));
        node.z = Math.max(0, Math.min(perspectiveDepth, node.z));

        const nodeSize = minNodeSize + ((baseNodeSize - minNodeSize) * (node.z / perspectiveDepth));

        // Draw nodes with border
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeSize, 0, Math.PI * 2);
        ctx.fillStyle = nodeColor;
        ctx.globalAlpha = 0.3; // Adjust node opacity (more translucent)
        ctx.fill();
        ctx.lineWidth = borderWidth;
        ctx.strokeStyle = borderColor;
        ctx.stroke();
        ctx.globalAlpha = 1; // Reset globalAlpha

        // Draw edges between nodes
        for (let j = index + 1; j < nodes.length; j++) {
          const otherNode = nodes[j];
          const distance = Math.sqrt((node.x - otherNode.x) ** 2 + (node.y - otherNode.y) ** 2 + (node.z - otherNode.z) ** 2);
          if (distance < maxDistance) {
            const opacity = (1 - distance / maxDistance) * 0.3; // Adjust path opacity (more translucent)
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(otherNode.x, otherNode.y);
            ctx.lineWidth = basePathWidth * (node.z / perspectiveDepth);
            ctx.strokeStyle = `rgba(${parseInt(nodeColor.slice(1, 3), 16)}, ${parseInt(nodeColor.slice(3, 5), 16)}, ${parseInt(nodeColor.slice(5, 7), 16)}, ${opacity})`;
            ctx.stroke();
          }
        }
      });
    }

    /**
     * Update node positions.
     */
    function updateNodes() {
      nodes.forEach(node => {
        node.x += node.vx; // Update x position
        node.y += node.vy; // Update y position
        node.z += node.vz; // Update z position

        // Reverse direction if nodes hit the canvas edges
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
        if (node.z < 0 || node.z > perspectiveDepth) node.vz *= -1;
      });
    }

    /**
     * Animate the nodes and edges of the network graph.
     */
    function animate() {
      drawNodesAndEdges(); // Draw nodes and edges
      updateNodes(); // Update node positions
      animationFrameId = requestAnimationFrame(animate); // Request the next animation frame
    }

    /**
     * Initialize the network graph on page load.
     */
    function initialize() {
      resizeCanvas(); // Resize the canvas to match the tile size
      createNodes(); // Create nodes
      drawBackground(); // Initial background draw (only once)
      drawNodesAndEdges(); // Initial draw of nodes and edges
    }

    // Initialize the graph on page load
    initialize();

    /**
     * Event listener for mouseover event to start animation.
     */
    tile.addEventListener('mouseover', () => {
      if (!animationFrameId) {
        animate(); // Start animation
      }
    });

    /**
     * Event listener for mouseleave event to stop animation.
     */
    tile.addEventListener('mouseleave', () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId); // Stop animation
        animationFrameId = null;
        drawNodesAndEdges(); // Ensure the graph is redrawn statically
      }
    });

    /**
     * Event listener for window resize event to redraw background and nodes.
     */
    window.addEventListener('resize', () => {
      resizeCanvas();
      drawBackground(); // Redraw the gradient background (only once)
      drawNodesAndEdges(); // Redraw the static graph after resizing
    });
  });
});