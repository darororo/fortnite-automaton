var canvas = document.querySelector("canvas");

function resizeCanvas() {
    canvas.width = document.querySelector('.Rholder').clientWidth - 20; // Adjust width based on parent
    canvas.height = window.innerHeight * 0.5; // Adjust height as needed
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Initial resize to set the canvas size on load

console.log(canvas);
