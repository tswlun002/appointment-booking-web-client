//====================================== LOGIN PAGE DEFAULT DATA ========================================================
export const BranchLocatorScreenResources = {
    backgroundImage: '/branches/branch-wrapper.webp',
    instructionMessage: `Hi, welcome back to `,
    password: {
        label: "Password",
        id: "password",
    },
    email: {
        label: "Email",
        id: "email",
        value:"",
    },
    forgotPasswordLink: {
        label: "Forgot your password?",
        path: "/password/forgot"
    },
    loginButton:{
        label:"Login",
        disabled:false,
    },
    registerLink: {
        label: "Don’t have an account?",
        linkLabel: "Register",
        path: "/register"
    }

}