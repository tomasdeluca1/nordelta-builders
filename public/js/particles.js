/**
 * Nordelta Builders - Particles Effect
 * Optional advanced particles or hover interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    const heroVisual = document.querySelector('.hero-visual');
    const orbs = document.querySelectorAll('.orb');

    if (heroVisual && orbs.length > 0) {
        // Simple subtle parallax effect on the hero orbs based on mouse movement
        document.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 20; // max shift 20px
            const y = (e.clientY / window.innerHeight - 0.5) * 20;

            orbs.forEach((orb, index) => {
                const factor = (index + 1) * 0.8;
                orb.style.transform = `translate(calc(-50% + ${x * factor}px), calc(-50% + ${y * factor}px))`;
            });
        });
    }
});
