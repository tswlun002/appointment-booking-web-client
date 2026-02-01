import {type RouteConfig, index, route, layout, type RouteConfigEntry} from "@react-router/dev/routes";


const authLayoutPages: RouteConfigEntry[] = [

    index("pages/auth/login.tsx"),
    // route("branches/:branchId/slots", "pages/branch-slots.tsx"),
    route("register", "pages/auth/register.tsx"),
    route("register/email-verification", "pages/auth/email-verification.tsx"),
    // route("login/password", "pages/auth/forgot-password.tsx"),
    // route("login/password/reset", "pages/auth/reset-password.tsx")
    // layout("layouts/appointment-layout.tsx", [
    //     route("appointments", "pages/appointment/appointments.tsx"),
    //     route("appointments/create", "pages/appointment/create-appointment.tsx"),
    //     route("appointments/:appointmentId", "pages/appointment/appointment.tsx"),
    //
    // ])
]

const securedLayoutPages: RouteConfigEntry[] = [
    //layout("layout/branch-layout.tsx", [
        route("branches","pages/branch/branches.tsx"),
    //]),
    // layout("layouts/appointment-layout.tsx", [
    //     route("appointments", "pages/appointment/appointments.tsx"),
    //     route("appointments/create", "pages/appointment/create-appointment.tsx"),
    //     route("appointments/:appointmentId", "pages/appointment/appointment.tsx"),
    //
    // ])
]

export default [
    layout("layouts/auth-layout.tsx", authLayoutPages),
    layout("layouts/secure-layout.tsx", securedLayoutPages),
    route("*", "pages/page-not-found.tsx")
] satisfies RouteConfig;