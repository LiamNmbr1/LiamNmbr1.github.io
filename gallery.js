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
    const videos = imageSlides
        .map((slide, index) => ({ video: slide.querySelector("video"), index }))
        .filter((entry) => entry.video);

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
        videos.forEach(({ video, index }) => {
            if (isHovered && currentIndex === index) {
                video.play().catch((error) => {
                    console.error("Unable to play project video:", error);
                });
                return;
            }

            video.pause();
            video.currentTime = 0;
        });
    };

    const openExpandedVideo = (video, slideIndex) => {
        if (!videoDialog || !expandedVideo || videoDialog.open) {
            return;
        }

        video.pause();
        expandedVideo.src = video.currentSrc || video.src;
        expandedVideo.muted = true;
        expandedVideo.setAttribute("aria-label", video.getAttribute("aria-label") || "Project video");
        resumePreviewAfterClose = () => {
            if (card.matches(":hover") && currentIndex === slideIndex) {
                isHovered = true;
                syncVideoPlayback();
            }
        };
        videoDialog.showModal();
        expandedVideo.play().catch((error) => {
            console.error("Unable to play expanded project video:", error);
        });
    };

    videos.forEach(({ video, index }) => {
        video.tabIndex = 0;
        video.setAttribute("role", "button");
        video.setAttribute("aria-haspopup", "dialog");
        video.addEventListener("click", () => openExpandedVideo(video, index));
        video.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openExpandedVideo(video, index);
            }
        });
    });

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