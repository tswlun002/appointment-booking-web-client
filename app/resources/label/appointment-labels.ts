//====================================== USER APPOINTMENTS PAGE LABELS ========================================================

export const userAppointmentsScreenResources = {
    pageTitle: "Your Appointments",
    emptyState: {
        title: "No appointments yet",
        message: "Find a branch and book your first appointment",
    },
    errorState: {
        title: "Failed to load appointments",
        retryButton: "Try Again",
    },
    loadMoreButton: {
        label: "Load older appointments",
        loadingLabel: "Loading...",
    },
    mobileNav: {
        findBranch: {
            label: "Find Branch",
            ariaLabel: "Find Branch",
        },
        appointments: {
            label: "Appointments",
            ariaLabel: "View Appointments",
        },
    },
};

//====================================== APPOINTMENT CARD LABELS ========================================================

export const appointmentCardResources = {
    rescheduleButton: {
        label: "Reschedule",
        ariaLabel: (serviceType: string) => `Reschedule appointment for ${serviceType}`,
    },
    cancelButton: {
        label: "Cancel",
        ariaLabel: (serviceType: string) => `Cancel appointment for ${serviceType}`,
    },
    moreInfoButton: {
        showLabel: "More Info",
        hideLabel: "Hide Info",
    },
    branchInfo: {
        label: "Branch",
    },
    referenceLabel: "Ref:",
    processingMessage: "Your appointment is being processed...",
};

//====================================== CANCEL APPOINTMENT MODAL LABELS ========================================================

export const cancelAppointmentResources = {
    title: "Cancel Appointment?",
    confirmMessage: "Are you sure you want to cancel your appointment for",
    warningMessage: "This action cannot be undone.",
    reason: {
        label: "Reason for cancellation",
        id: "reason",
        placeholder: "Please tell us why you're cancelling...",
    },
    cancelButton: {
        label: "Yes, Cancel Appointment",
        loadingLabel: "Cancelling...",
    },
    keepButton: {
        label: "No, Keep Appointment",
    },
    closeButton: {
        ariaLabel: "Close",
    },
    successMessage: "Appointment cancelled successfully",
};

//====================================== APPOINTMENT SLOTS PAGE LABELS ========================================================

export const appointmentSlotsResources = {
    rescheduleHeader: {
        title: "Reschedule Appointment",
        currentlyScheduled: "Currently scheduled:",
        service: "Service:",
    },
    lastRescheduleWarning: "Last Reschedule — This is your final reschedule. Maximum 3 reschedules allowed per appointment.",
    selectDate(haveFutureAppointment:boolean){
       return {
           title: haveFutureAppointment? "You have a booked appointment already":"Select Date",
            titleReschedule: "Select New Date",
       }
    },
    availableTimes: {
        title: "Available Times",
    },
    legend: {
        available: "Available",
        full: "Full",
        blocked: "Blocked",
        past: "Past",
    },
    emptySlots: {
        title: "No slots available",
        message: "Please select another date or try a different branch.",
    },
};

//====================================== BOOK APPOINTMENT PAGE LABELS ========================================================

export const bookAppointmentResources = {
    pageTitle: {
        book: "Book Appointment",
        reschedule: "Reschedule Appointment",
    },
    appointmentDetails: {
        title: "Appointment Details",
        titleReschedule: "New Appointment Details",
    },
    fields: {
        date: {
            label: "Date",
        },
        time: {
            label: "Time",
        },
        serviceType: {
            label: "Service Type",
            id: "serviceType",
        },
    },
    backButton: {
        ariaLabel: "Go back",
    },
};

//====================================== BOOK APPOINTMENT MODAL LABELS ========================================================

export const bookAppointmentModalResources = {
    title: {
        book: "Confirm Booking",
        reschedule: "Confirm Reschedule",
    },
    selectedAppointment: {
        label: "Selected Appointment",
        labelReschedule: "New Appointment Time",
    },
    serviceType: {
        label: "What do you need help with?",
        labelReschedule: "Service Type",
        required: "*",
        id: "serviceType",
    },
    buttons: {
        cancel: {
            label: "Cancel",
        },
        confirm: {
            label: "Confirm Booking",
            labelReschedule: "Confirm Reschedule",
            loadingLabel: "Booking...",
            loadingLabelReschedule: "Rescheduling...",
        },
    },
    closeButton: {
        ariaLabel: "Close modal",
    },
};

//====================================== APPOINTMENT SUCCESS PAGE LABELS ========================================================

export const appointmentSuccessResources = {
    title: "Appointment Booked!",
    message: "Your appointment has been successfully scheduled.",
    referenceNumber: {
        label: "Reference Number",
    },
    details: {
        service: {
            label: "Service",
        },
        dateTime: {
            label: "Date & Time",
        },
        status: {
            label: "Status",
        },
    },
    backButton: {
        label: "Back to Appointments",
    },
};

