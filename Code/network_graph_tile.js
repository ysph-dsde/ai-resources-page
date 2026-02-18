/**
 * This script handles the functionality for the dynamic network graph that builds
 * when hovering over the tiles. Each tile contains a canvas where nodes and edges
 * are drawn, creating an animated network effect.
 * 
 * Used on the filter/search page.
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

// Function to initialize the network graph with visual aesthetics
function initializeTileGraph(tile) {
  const canvas = tile.querySelector('.network-canvas');
  if (!canvas) {
    console.error(`Canvas not found for tile with title '${tile.getAttribute('data-title')}'.`);
    return;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error(`Unable to get canvas context for tile with title '${tile.getAttribute('data-title')}'.`);
    return;
  }

  const dpr = window.devicePixelRatio || 1;

  let animationFrameId;
  const nodes = [];
  const numNodes = 13;
  const maxDistance = 150;
  const baseNodeSize = 10; // Increased for visual impact
  const basePathWidth = 5; // Increased for visual impact
  const borderWidth = 1;
  const borderColor = "#F0F0F0";
  const speedMultiplier = 0.2;
  const tileColor = tile.getAttribute('data-color') || getComputedStyle(document.documentElement).getPropertyValue('--dsde-blue');
  const perspectiveDepth = 100; // Static perspective depth
  const minNodeSize = 6; // Increased for visual impact
  const backgroundColor = tile.getAttribute('data-color') || getComputedStyle(document.documentElement).getPropertyValue('--dsde-purple');

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
  }

  function createNodes() {
    nodes.length = 0;
    for (let i = 0; i < numNodes; i++) {
      nodes.push({
        x: Math.random() * canvas.width / dpr,
        y: Math.random() * canvas.height / dpr,
        z: Math.random() * perspectiveDepth,
        vx: (Math.random() - 0.5) * speedMultiplier,
        vy: (Math.random() - 0.5) * speedMultiplier,
        vz: (Math.random() - 0.5) * speedMultiplier
      });
    }
  }

  function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width / dpr, canvas.height / dpr);
    gradient.addColorStop(0, backgroundColor + "60"); // Lighter
    gradient.addColorStop(1, backgroundColor + "00"); // Transparent
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);
  }

  function getNodeSize(z) {
    return minNodeSize + ((baseNodeSize - minNodeSize) * (z / perspectiveDepth));
  }

  function drawNodesAndEdges() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    drawBackground();

    // Draw nodes and edges
    nodes.forEach((node, index) => {
      node.x = Math.max(0, Math.min(canvas.width / dpr, node.x));
      node.y = Math.max(0, Math.min(canvas.height / dpr, node.y));
      node.z = Math.max(0, Math.min(perspectiveDepth, node.z));

      const nodeSize = getNodeSize(node.z);

      ctx.beginPath();
      ctx.arc(node.x, node.y, nodeSize, 0, Math.PI * 2);
      ctx.fillStyle = tileColor;
      ctx.globalAlpha = 0.5; // Translucent nodes
      ctx.fill();
      ctx.lineWidth = borderWidth;
      ctx.strokeStyle = borderColor;
      ctx.stroke();
      ctx.globalAlpha = 1;

      for (let j = index + 1; j < nodes.length; j++) {
        const otherNode = nodes[j];
        const distance = Math.sqrt(
          (node.x - otherNode.x) ** 2 +
          (node.y - otherNode.y) ** 2 +
          (node.z - otherNode.z) ** 2
        );
        if (distance < maxDistance) {
          const opacity = (1 - distance / maxDistance) * 0.3;
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(otherNode.x, otherNode.y);
          ctx.lineWidth = basePathWidth * (node.z / perspectiveDepth);
          ctx.strokeStyle = `rgba(${parseInt(tileColor.slice(1, 3), 16)}, ${parseInt(tileColor.slice(3, 5), 16)}, ${parseInt(tileColor.slice(5, 7), 16)}, ${opacity})`;
          ctx.stroke();
        }
      }
    });
  }

  function updateNodes() {
    nodes.forEach(node => {
      node.x += node.vx;
      node.y += node.vy;
      node.z += node.vz;
      if (node.x < 0 || node.x > canvas.width / dpr) node.vx *= -1;
      if (node.y < 0 || node.y > canvas.height / dpr) node.vy *= -1;
      if (node.z < 0 || node.z > perspectiveDepth) node.vz *= -1;
    });
  }

  function animate() {
    drawNodesAndEdges();
    updateNodes();
    animationFrameId = requestAnimationFrame(animate);
  }

  resizeCanvas();
  createNodes();
  drawBackground();
  drawNodesAndEdges();

  tile.addEventListener('mouseover', () => {
    if (!animationFrameId) {
      animate();
    }
  });

  tile.addEventListener('mouseleave', () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
      drawNodesAndEdges();
    }
  });

  window.addEventListener('resize', () => {
    resizeCanvas();
    drawBackground();
    drawNodesAndEdges();
  });
}

function initializeVisibleTiles() {
  document.querySelectorAll('.tile:not(.hidden)').forEach((tile) => {
    initializeTileGraph(tile);
  });
}

window.addEventListener('load', function () {
  initializeVisibleTiles();

  const showMoreBtn = document.getElementById('showMoreBtn');
  if (showMoreBtn) {
    showMoreBtn.addEventListener('click', function () {
      const hiddenTiles = document.querySelectorAll('.tile.hidden');
      Array.from(hiddenTiles).slice(0, 3).forEach((tile) => {
        tile.classList.remove('hidden');
        tile.style.display = 'block';
        initializeTileGraph(tile);
      });
    });
  }

  document.querySelectorAll('.filter-button').forEach((button) => {
    button.addEventListener('click', filterTiles);
  });
});

function filterTiles() {
  const selectedCategories1 = Array.from(categoryFilter1.querySelectorAll('input[name="category1"]:checked')).map(input => decodeURIComponent(input.value));
  const selectedCategories2 = Array.from(categoryFilter2.querySelectorAll('input[name="category2"]:checked')).map(input => decodeURIComponent(input.value));
  const selectedCategories3 = Array.from(categoryFilter3.querySelectorAll('input[name="category3"]:checked')).map(input => decodeURIComponent(input.value));
  const selectedCategories4 = Array.from(categoryFilter4.querySelectorAll('input[name="category4"]:checked')).map(input => decodeURIComponent(input.value));

  let visibleTileCount = 0;

  sortedTiles.forEach(function(tile) {
    const categories1 = (tile.getAttribute('data-categories1') || '').split(' ').map(cat => decodeURIComponent(cat));
    const categories2 = (tile.getAttribute('data-categories2') || '').split(' ').map(cat => decodeURIComponent(cat));
    const categories3 = (tile.getAttribute('data-categories3') || '').split(' ').map(cat => decodeURIComponent(cat));
    const categories4 = (tile.getAttribute('data-categories4') || '').split(' ').map(cat => decodeURIComponent(cat));
    const isNotApplicable = tile.getAttribute('data-not-applicable') === 'true';

    const matchesCategory1 = selectedCategories1.length === 0 || selectedCategories1.some(cat => categories1.includes(cat));
    const matchesCategory2 = selectedCategories2.length === 0 || selectedCategories2.some(cat => categories2.includes(cat));
    const matchesCategory3 = selectedCategories3.length === 0 || selectedCategories3.some(cat => categories3.includes(cat));

    let matchesCategory4 = true;
    if (selectedCategories4.length > 0 && !isNotApplicable) {
      matchesCategory4 = selectedCategories4.some(cat => categories4.includes(cat));
    }

    if (matchesCategory1 && matchesCategory2 && matchesCategory3 && matchesCategory4) {
      tile.classList.add('filtered');
      if (visibleTileCount < initialLoadCount) {
        tile.classList.remove('hidden');
        tile.style.display = 'block'; // Ensure display is set to block
        initializeTileGraph(tile); // Initialize the graph when visible
        visibleTileCount++;
      } else {
        tile.classList.add('hidden');
        tile.style.display = 'none'; // Hide others
      }
    } else {
      tile.classList.remove('filtered');
      tile.classList.add('hidden');
      tile.style.display = 'none'; // Ensure matched against the filter
    }
  });

  updateLineCounts();

  if (sortedTiles.filter(tile => tile.classList.contains('hidden')).length === 0) {
    showMoreBtn.style.display = 'none';
  } else {
    showMoreBtn.style.display = 'block';
  }
} 