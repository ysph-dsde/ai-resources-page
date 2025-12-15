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
      const numNodes = 20; // Number of nodes
      const maxDistance = 100; // Maximum distance for drawing lines
      const nodeSize = 3; // Size of nodes
      const speedMultiplier = 0.2; // Lower value for slower movement
      const nodeColor = getComputedStyle(document.documentElement).getPropertyValue('--dsde-blue'); // Change to '--dsde-purple' for purple version

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
                  vx: (Math.random() - 0.5) * speedMultiplier,
                  vy: (Math.random() - 0.5) * speedMultiplier
              });
          }
      }

      /**
       * Draw nodes and edges on the canvas.
       */
      function draw() {
          ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

          // Draw nodes and edges
          nodes.forEach((node, index) => {
              // Draw nodes
              ctx.beginPath();
              ctx.arc(node.x, node.y, nodeSize, 0, Math.PI * 2);
              ctx.fillStyle = nodeColor;
              ctx.fill();

              // Draw edges between nodes
              for (let j = index + 1; j < nodes.length; j++) {
                  const otherNode = nodes[j];
                  const distance = Math.sqrt((node.x - otherNode.x) ** 2 + (node.y - otherNode.y) ** 2);
                  if (distance < maxDistance) {
                      let opacity = 1 - distance / maxDistance;
                      ctx.beginPath();
                      ctx.moveTo(node.x, node.y);
                      ctx.lineTo(otherNode.x, otherNode.y);
                      // ctx.strokeStyle = `rgba(0, 53, 107, ${opacity})`; // Adjusted rgba for blue
                      ctx.strokeStyle = `rgba(118, 52, 166, ${opacity})`; // Adjusted rgba for purple
                      ctx.stroke();
                  }
              }
          });

          animationFrameId = requestAnimationFrame(draw); // Request the next animation frame
      }

      /**
       * Update node positions.
       */
      function updateNodes() {
          nodes.forEach(node => {
              node.x += node.vx; // Update x position
              node.y += node.vy; // Update y position

              // Reverse direction if nodes hit the canvas edges
              if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
              if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
          });
      }

      /**
       * Animate the network graph.
       */
      function animate() {
          draw(); // Draw nodes and edges
          updateNodes(); // Update node positions
      }

      /**
       * Event listener for mouseover event.
       */
      tile.addEventListener('mouseover', () => {
          resizeCanvas(); // Resize the canvas to match the tile size
          createNodes(); // Create nodes
          draw(); // Initial draw
          animationFrameId = setInterval(animate, 30); // Add interval for slower animation
      });

      /**
       * Event listener for mouseleave event.
       */
      tile.addEventListener('mouseleave', () => {
          clearInterval(animationFrameId); // Clear interval to stop animation
          ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
      });

      /**
       * Event listener for window resize event.
       */
      window.addEventListener('resize', resizeCanvas); // Resize the canvas when the window is resized
  });
});