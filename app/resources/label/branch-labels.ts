//====================================== LOGIN PAGE DEFAULT DATA ========================================================
export const BranchLocatorScreenResources = {
    backgroundImage: "/branches/branch-wrapper.webp",
    heading : "Find a branch",
    subheading :"Search by location or enable GPS to find branches near you",
    enableLocation: {
        label: "Use my location",
        latitude:{id:"latitude"},
        longitude:{id:"longitude"}
    },
    distanceFilter: {
        label: "Filter Radius",
        id: "maxDistanceKm",
    },
    searchText: {
        label: "Search for a branch name,area,city,province",
        id: "searchText",
    },
    branchesList:{
        label:"Nearby branches",
    },
    loadMoreButton: {
        label: "Load more branches",
        loadingLabel: "Loading...",
    },
}
export const BranchItemResources = {
    branchItemHeader:{
        label:"Trading hours",
    },
    bookAppointmentButton:{
        label:"Book Appointment",
        id:"bookAppointmentButton",
    },
    viewMoreButton:{
      id:"viewedBranch",
    }
}