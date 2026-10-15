const videoDialog = document.querySelector(".video-dialog");
const expandedVideo = videoDialog?.querySelector("video");
const closeVideoButton = videoDialog?.querySelector(".video-dialog-close");
let resumePreviewAfterClose = () => {};

const closeExpandedVideo = () => {
    if (!videoDialog?.open || !expandedVideo) {
        return;
    }

    videoDialog.close();
    expandedVideo.pause();
    expandedVideo.removeAttribute("src");
    expandedVideo.load();
    resumePreviewAfterClose();
    resumePreviewAfterClose = () => {};
};

closeVideoButton?.addEventListener("click", closeExpandedVideo);
videoDialog?.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeExpandedVideo();
    }
});
videoDialog?.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeExpandedVideo();
});
videoDialog?.addEventListener("click", (event) => {
    if (event.target === videoDialog) {
        closeExpandedVideo();
    }
});

document.querySelectorAll(".project-gallery").forEach((gallery) => {
    const imageTrack = gallery.querySelector(".image-track");
    const captionTrack = gallery.querySelector(".caption-track");
    const previousButton = gallery.querySelector(".image-arrow.previous");
    const nextButton = gallery.querySelector(".image-arrow.next");
    const imageSlides = imageTrack ? [...imageTrack.children] : [];
    const captionSlides = captionTrack ? [...captionTrack.children] : [];
    const card = gallery.closest(".project-card");
    const video = imageSlides[0]?.querySelector("video");

    if (
        !imageTrack ||
        !captionTrack ||
        !card ||
        !previousButton ||
        !nextButton ||
        imageSlides.length === 0 ||
        imageSlides.length !== captionSlides.length
    ) {
        return;
    }

    let currentIndex = 0;
    let isHovered = false;

    const syncVideoPlayback = () => {
        if (!video) {
            return;
        }

        if (isHovered && currentIndex === 0) {
            video.play().catch((error) => {
                console.error("Unable to play project video:", error);
            });
            return;
        }

        video.pause();
        video.currentTime = 0;
    };

    const openExpandedVideo = () => {
        if (!video || !videoDialog || !expandedVideo || videoDialog.open) {
            return;
        }

        video.pause();
        expandedVideo.src = video.currentSrc || video.src;
        expandedVideo.muted = true;
        expandedVideo.setAttribute("aria-label", video.getAttribute("aria-label") || "Project video");
        resumePreviewAfterClose = () => {
            if (card.matches(":hover") && currentIndex === 0) {
                isHovered = true;
                syncVideoPlayback();
            }
        };
        videoDialog.showModal();
        expandedVideo.play().catch((error) => {
            console.error("Unable to play expanded project video:", error);
        });
    };

    if (video) {
        video.tabIndex = 0;
        video.setAttribute("role", "button");
        video.setAttribute("aria-haspopup", "dialog");
        video.addEventListener("click", openExpandedVideo);
        video.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openExpandedVideo();
            }
        });
    }

    const showSlide = (index) => {
        currentIndex = (index + imageSlides.length) % imageSlides.length;
        const offset = `-${currentIndex * 100}%`;

        imageTrack.style.transform = `translateX(${offset})`;
        captionTrack.style.transform = `translateX(${offset})`;

        imageSlides.forEach((slide, slideIndex) => {
            slide.setAttribute("aria-hidden", String(slideIndex !== currentIndex));
        });
        captionSlides.forEach((slide, slideIndex) => {
            slide.setAttribute("aria-hidden", String(slideIndex !== currentIndex));
        });
        syncVideoPlayback();
    };

    card.addEventListener("mouseenter", () => {
        isHovered = true;
        syncVideoPlayback();
    });
    card.addEventListener("mouseleave", () => {
        isHovered = false;
        syncVideoPlayback();
    });

    showSlide(currentIndex);

    if (imageSlides.length > 1) {
        previousButton.hidden = false;
        nextButton.hidden = false;

        previousButton.addEventListener("click", () => showSlide(currentIndex - 1));
        nextButton.addEventListener("click", () => showSlide(currentIndex + 1));
    }
});