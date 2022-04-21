export function bindUi(riderConnectionInstance) {

    var queryParams = new URLSearchParams(window.location.search);

    const channelIdTextBox = document.getElementById("channelID");
    const animationCheckbox = document.getElementById("animation");
    const settingsIcon = document.getElementById("settings-icon");
    const settingsOverlay = document.getElementById("overlay");
    const settingsContainer = document.getElementById("settings-container");
    const skippedLocationCheckbox = document.getElementById('render-skipped');
    const skippedLocationSettings = document.getElementById("skipped-location-settings");
    const skippedLocationIntervalInput = document.getElementById("skipped-location-interval-input");
    const displayAccuracyCheckbox = document.getElementById("display-accuracy");
    const displayRawLocationsCheckbox = document.getElementById("display-raw");

    function openSettingsOverlay() {
      settingsOverlay.style.display = "flex";
    }

    function closeSettingsOverlay() {
      settingsOverlay.style.display= "none";
    }

    if (!channelIdTextBox) {
      throw new Error("Where has the UI gone? Cannot continue. Can't find ChannelID");
    }

    settingsContainer.addEventListener("click", evt => evt.stopPropagation());
    settingsOverlay.addEventListener("click", closeSettingsOverlay);
    settingsIcon.addEventListener("click", openSettingsOverlay);

    skippedLocationCheckbox.addEventListener('change', (cbEvent) => {
      riderConnectionInstance.setRenderSkippedLocations(cbEvent.target.checked);
      skippedLocationSettings.classList.toggle("hidden");
    });

    skippedLocationIntervalInput.addEventListener("change", (evt) => {
        const interval = Number(evt.target.value);
        if (!isNaN(interval)) riderConnectionInstance.setSkippedLocationInterval(interval);
    });

    displayAccuracyCheckbox.addEventListener('change', (cbEvent) => {
      riderConnectionInstance.setDisplayAccuracyCircle(cbEvent.target.checked);
    });

    displayRawLocationsCheckbox.addEventListener('change', (cbEvent) => {
      riderConnectionInstance.setDisplayRawLocations(cbEvent.target.checked);
    });

    animationCheckbox.addEventListener("change", (cbEvent) => {
        riderConnectionInstance.setShouldSnapToLocations(!cbEvent.target.checked);
    });

    channelIdTextBox.addEventListener("keyup", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const channelValue = channelIdTextBox.value;
            if (channelValue.length > 0) {
                riderConnectionInstance.connect(channelIdTextBox.value);
            }
        }
    });

    if (queryParams.has("channel")) {
        const channelId = queryParams.get("channel");
        channelIdTextBox.value = channelId;
        riderConnectionInstance.connect(channelId);
    }

    riderConnectionInstance.onStatusUpdate((status) => { updateDriverStatus(status); });
    updateDriverStatus(riderConnectionInstance.driverStatus);
}


function updateDriverStatus(status) {
    const driverPresent = "Driver is online";
    const noDrivers = "Driver is offline";

    const message = status ? driverPresent : noDrivers;
    subscriberCount.innerHTML = message;
}
