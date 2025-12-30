export function startLoadingAnimation(container) {
    container.innerHTML = `
        <div class="loading-state" style="padding: 50px 0;">
            <p>Consulting Gemini 3 Failure Models...</p>
            <div class="progress-track"><div class="progress-fill"></div></div>
        </div>
    `;
    setTimeout(() => {
        const fill = container.querySelector('.progress-fill');
        if (fill) fill.style.width = '100%';
    }, 100);
}

export function runSequence() {
    const rows = document.querySelectorAll('.item-flow');
    
    rows.forEach((row, i) => {
        const left = row.querySelector('.left-box');
        const arrowLine = row.querySelector('.arrow-line');
        const arrowHead = row.querySelector('.arrow-head');
        const arrowText = row.querySelector('.arrow-text');
        const right = row.querySelector('.right-box');

        const delay = i * 1400; // Time between rows

        setTimeout(() => {
            row.style.opacity = "1";
            left.classList.add('fade-up');
        }, delay);

        setTimeout(() => {
            arrowLine.classList.add('grow-line');
            arrowText.classList.add('fade-up');
            arrowHead.style.opacity = "1";
        }, delay + 500);

        setTimeout(() => {
            right.classList.add('fade-up');
        }, delay + 1000);
    });
}