/**
* This script handles the functionality for the dynamic circuit graphs
* that is drawn on section headers. Each tile contains a canvas where nodes
* are connected by horizontal and oblique lines at kinks. These are generated 
* randomly at each page load.
* 
* It includes the following features:
*    1. Creating nodes with random positions.
*    2. Drawing nodes and edges with kinks on the canvas.
*    3. Generating circuits with random kinks and lengths.
*    4. Resizing the canvas based on the tile size.
*    5. Redrawing the network on window resize events.
* 
* Color Variables:
*    - nodeColor: #FFD700;
*    - backgroundColor: transparent;
*
* Author: Shelby Golden, M.S.
*   Date: February 2026
* 
* Note: Written with the assistance of Yale's AI, Clarity.
*/

// Wait for the DOM to load before executing the script
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('.table_type_header').forEach(tile => {
    // Get the canvas and its context within the tile
    const canvas = tile.querySelector('.network-canvas');
    const ctx = canvas.getContext('2d');

    // Define variables
    const nodeSize = 4; // Size of nodes
    const nodeColor = "#FFD700"; // Node color
    const backgroundColor = "transparent"; // Background color
    const minCircuits = 8; // Minimum number of circuits to generate
    const maxCircuits = 15; // Maximum number of circuits to generate
    const minKinks = 1; // Minimum number of kinks per circuit
    const maxKinks = 3; // Maximum number of kinks per circuit
    const minKinkHeight = 20; // Minimum vertical deviation for kinks
    const maxKinkHeight = 100; // Maximum vertical deviation for kinks
    const minSegmentLength = 50; // Minimum length of any line segment
    const maxSegmentLength = 200; // Maximum length of any line segment

    /**
     * Resize the canvas based on the tile size.
     */
    function resizeCanvas() {
      canvas.width = tile.clientWidth;
      canvas.height = tile.clientHeight;
    }

    /**
     * Draw the canvas background.
     */
    function drawBackground() {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    /**
     * Generate a random circuit with kinks.
     */
    function generateCircuit() {
      const startNode = { x: Math.random() * canvas.width * 0.2, y: Math.random() * canvas.height };
      const endNode = { x: Math.random() * canvas.width * 0.8 + canvas.width * 0.2, y: Math.random() * canvas.height };
      const numKinks = Math.floor(Math.random() * (maxKinks - minKinks + 1)) + minKinks;

      const kinks = [];
      if (numKinks > 0) {
        let lastX = startNode.x;
        const totalLength = endNode.x - startNode.x;
        const avgSegmentLength = totalLength / (numKinks + 1);

        for (let i = 1; i <= numKinks; i++) {
          let kinkX, kinkY;
          do {
            kinkX = lastX + Math.random() * (maxSegmentLength - minSegmentLength) + minSegmentLength;
          } while (kinkX - lastX < minSegmentLength || kinkX - lastX > maxSegmentLength);
          kinkX = Math.min(kinkX, endNode.x - minSegmentLength * (numKinks - i + 1)); // Ensure there's enough room left for the remaining segments

          do {
            kinkY = startNode.y + (Math.random() - 0.5) * 2 * maxKinkHeight;
          } while (Math.abs(kinkY - startNode.y) < minKinkHeight || Math.abs(kinkY - startNode.y) > maxKinkHeight);

          kinks.push({ x: kinkX, y: kinkY });
          lastX = kinkX;
        }
      }

      return { startNode, kinks, endNode };
    }

    /**
     * Draw a circuit with given nodes and kinks.
     */
    function drawCircuit(circuit) {
      const { startNode, kinks, endNode, opacity } = circuit;

      ctx.strokeStyle = `rgba(255, 215, 0, ${opacity})`; // Adjust node color with opacity

      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(startNode.x, startNode.y);

      // Draw initial horizontal line from the start node to the first kink or end node
      const firstKink = kinks.length > 0 ? kinks[0] : endNode;
      ctx.lineTo(firstKink.x, startNode.y);

      let lastPoint = { x: firstKink.x, y: startNode.y };

      kinks.forEach(kink => {
        // Draw oblique line to kink
        ctx.lineTo(kink.x, kink.y);
        lastPoint = kink;
      });

      // Determine if the final connection to the end node is horizontal (preferred) or vertical
      const drawHorizontalEnd = Math.random() < 0.7; // 70% chance of horizontal end connection

      if (drawHorizontalEnd) {
        // Final horizontal line to the end node's x position
        ctx.lineTo(endNode.x, lastPoint.y);
        // Vertical line to the end node
        ctx.lineTo(endNode.x, endNode.y);
      } else {
        // Final vertical line to the end node's y position
        ctx.lineTo(lastPoint.x, endNode.y);
        // Horizontal line to the end node
        ctx.lineTo(endNode.x, endNode.y);
      }

      ctx.stroke();

      // Draw start node
      ctx.fillStyle = `rgba(255, 215, 0, ${opacity})`;
      ctx.beginPath();
      ctx.arc(startNode.x, startNode.y, nodeSize, 0, Math.PI * 2);
      ctx.fill();

      // Draw end node
      ctx.beginPath();
      ctx.arc(endNode.x, endNode.y, nodeSize, 0, Math.PI * 2);
      ctx.fill();
    }

    /**
     * Draw all circuits.
     */
    function drawAllCircuits() {
      const numCircuits = Math.floor(Math.random() * (maxCircuits - minCircuits + 1)) + minCircuits;

      for (let i = 0; i < numCircuits; i++) {
        const circuit = generateCircuit();
        circuit.opacity = Math.random() * 0.6 + 0.4; // Random opacity between 0.4 and 1.0
        drawCircuit(circuit);
      }
    }

    /**
     * Initialize the canvas and draw the nodes and lines.
     */
    function initialize() {
      resizeCanvas(); // Resize the canvas to match the tile size
      drawBackground(); // Draw the background
      drawAllCircuits(); // Draw all circuits
    }

    // Initialize the graph on page load
    initialize();
  });
});