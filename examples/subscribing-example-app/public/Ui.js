export function bindUi(riderConnectionInstance) {

    var queryParams = new URLSearchParams(window.location.search);

    const updateChannelButton = document.getElementById("updateChannelButton");
    const channelIdTextBox = document.getElementById("channelID");
    const animationCheckbox = document.getElementById("animation");
    const subscriberCount = document.getElementById("subscriberCount");
    
    if (!updateChannelButton || !channelIdTextBox) {
        throw new Error("Where has the UI gone? Cannot continue. Can't find ChannelID");
    }

    animationCheckbox.addEventListener("change", (cbEvent) => {
        console.log(!cbEvent.target.checked);
        cbEvent.target.parentElement.setAttribute("data-checked", !cbEvent.target.checked);
        riderConnectionInstance.shouldSnap = !cbEvent.target.checked;
    });

    channelIdTextBox.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        updateChannelButton.click();
        }
    });

    updateChannelButton.addEventListener("click", () => {
        const channelValue = channelIdTextBox.value;
        if (channelValue.length > 0) {
            riderConnectionInstance.connect(channelIdTextBox.value);
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
