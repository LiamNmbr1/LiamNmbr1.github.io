const contactForm = document.querySelector("#contact-form");
const contactFormStatus = document.querySelector("#contact-form-status");
const contactFormResponse = document.querySelector("#contact-form-response");
const submitButton = contactForm?.querySelector('button[type="submit"]');
let responseTimeout;
let waitingForResponse = false;

const finishSubmission = (status) => {
    window.clearTimeout(responseTimeout);
    waitingForResponse = false;
    if (submitButton) {
        submitButton.disabled = false;
    }
    if (contactFormStatus) {
        contactFormStatus.textContent =
            status === "success"
                ? "Message sent."
                : "Your message could not be sent. Please check the form and try again.";
    }

    if (status === "success") {
        contactForm?.reset();
    }
};

contactForm?.addEventListener("submit", (event) => {
    const endpoint = new URL(contactForm.action);
    const isAppsScriptEndpoint =
        endpoint.hostname === "script.google.com" &&
        /^\/macros\/s\/[^/]+\/exec$/.test(endpoint.pathname) &&
        !endpoint.pathname.includes("REPLACE_WITH_DEPLOYMENT_ID");

    if (!isAppsScriptEndpoint) {
        event.preventDefault();
        if (contactFormStatus) {
            contactFormStatus.textContent =
                "The form is not connected yet. Deploy ContactForm.gs and add its web app URL to the form action in LiamWeb.html.";
        }
        return;
    }

    if (!contactFormResponse || !submitButton) {
        event.preventDefault();
        if (contactFormStatus) {
            contactFormStatus.textContent = "The form could not be submitted. Please try again later.";
        }
        return;
    }

    window.clearTimeout(responseTimeout);
    waitingForResponse = true;
    submitButton.disabled = true;
    if (contactFormStatus) {
        contactFormStatus.textContent = "Sending message...";
    }
});

window.addEventListener("message", (event) => {
    if (
        event.source !== contactFormResponse?.contentWindow ||
        event.data?.type !== "contact-form-result" ||
        !waitingForResponse
    ) {
        return;
    }

    window.clearTimeout(responseTimeout);
    finishSubmission(event.data.status);
});

contactFormResponse?.addEventListener("load", () => {
    if (!waitingForResponse) {
        return;
    }

    window.clearTimeout(responseTimeout);
    responseTimeout = window.setTimeout(() => {
        if (!waitingForResponse) {
            return;
        }

        finishSubmission("success");
    }, 1500);
});
