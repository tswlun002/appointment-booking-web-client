//====================================== SLOT HEADER LABELS ========================================================

export const slotHeaderResources = {
    backButton: {
        ariaLabel: "Go back to branch search",
    },
    distanceLabel: "km away",
};

//====================================== DATE BUTTON LABELS ========================================================

export const dateButtonResources = {
    fullyBooked: "Full",
    blocked: "Blocked",
};

//====================================== SLOT BUTTON LABELS ========================================================

export const slotButtonResources = {
    available: {
        ariaLabel: (time: string) => `Select time slot ${time}`,
    },
    unavailable: {
        ariaLabel: (time: string) => `Time slot ${time} is unavailable`,
    },
    past: {
        ariaLabel: (time: string) => `Time slot ${time} has passed`,
    },
};

//====================================== EMPTY SLOTS LABELS ========================================================

export const emptySlotsResources = {
    title: "No slots available",
    message: "Please select another date or try a different branch.",
};

