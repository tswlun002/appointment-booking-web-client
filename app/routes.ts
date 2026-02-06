import { type RouteConfig, index, route, layout, type RouteConfigEntry } from "@react-router/dev/routes";

const authLayoutPages: RouteConfigEntry[] = [
    index("pages/auth/login.tsx"),
    route("register", "pages/auth/register.tsx"),
    route("register/email-verification", "pages/auth/email-verification.tsx"),
];

const securedLayoutPages: RouteConfigEntry[] = [
    route("appointments", "pages/appointment/user-appointments.tsx"),
    route("appointments/:branchId/slots", "pages/slots/appointment-slots.tsx"),
];

export default [
    layout("layouts/auth-layout.tsx", [
            ...authLayoutPages,
        layout("layouts/secure-layout.tsx", [
            ...securedLayoutPages,
        ]),

    ]),

    route("*", "pages/page-not-found.tsx")
] satisfies RouteConfig;