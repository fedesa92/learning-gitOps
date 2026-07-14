const statusChip = document.getElementById("backend-status");
const statusLabel = document.getElementById("backend-status-label");
const statusMessage = document.getElementById("backend-status-message");

const checkIntervalMs = 3000;
const requestTimeoutMs = 2000;

function displayStatus(status, label, message) {
    statusChip.className = `status status--${status}`;
    statusLabel.textContent = label;
    statusMessage.textContent = message;
}

async function checkBackendHealth() {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), requestTimeoutMs);

    try {
        const response = await fetch(`/actuator/health?_=${Date.now()}`, {
            cache: "no-store",
            signal: controller.signal
        });
        const health = response.ok ? await response.json() : null;

        if (health?.status === "UP") {
            displayStatus(
                "online",
                "Running",
                "The BookStore backend is running and ready to accept API requests."
            );
        } else {
            displayStatus(
                "offline",
                "Unavailable",
                "The BookStore backend is not available. API requests cannot be processed."
            );
        }
    } catch (error) {
        displayStatus(
            "offline",
            "Unavailable",
            "The BookStore backend is not available. API requests cannot be processed."
        );
    } finally {
        window.clearTimeout(timeout);
    }
}

checkBackendHealth();
window.setInterval(checkBackendHealth, checkIntervalMs);
