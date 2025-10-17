const pages = document.querySelectorAll(".page");
const underline = document.querySelector(".underline");

function moveUnderline(p) {
    const { offsetLeft, offsetWidth } = p;

    // Make underline half the width
    const newWidth = offsetWidth / 2;

    // Center it under the text
    const newLeft = offsetLeft + (offsetWidth / 2) - (newWidth / 2);

    underline.style.width = newWidth + 'px';
    underline.style.left = newLeft + 'px';
    p.style.color = "black";
}

moveUnderline(pages[0]);

pages.forEach((p) => {
    p.addEventListener("click", () => {
        moveUnderline(p);

        for (let i = 0; i < pages.length; i++) {
            if (i != Array.from(pages).indexOf(p)) {
                pages[i].style.color = "rgb(91, 89, 89)";
            }
        }
    })
})