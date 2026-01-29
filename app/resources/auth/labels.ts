
import {PasswordVisibility} from "~/utils/CompanionObjects";


//====================================== PAGE NOT FOUND  DEFAULT DATA ========================================================
export const PAGE_NOT_FOUND_MESSAGE = "Sorry, the page you're trying to access is not found 😔❌"
export const CONTACT_SUPPORT_TEAM_MESSAGE = "Please contact our supporting team if problem persist"

export const ALREADY_HAVE_ACCOUNT_LABEL = "Already have an account?"
export const LOGIN_LABEL = "Log in"
export const ANIMATION_DELAY = 4000
export const COMPANY_NAME_LABEL = "Capitec-Appointment-Booking"

//====================================== HOME PAGE DEFAULT DATA ========================================================
export const COMPANY_DATA= {
    fullname: COMPANY_NAME_LABEL,
    shortName: "Appointment-Booking",
    logo: "/capitec.svg",
    companyValues: ["Connect", "Collaborate", "Create"],
    welcomeData: [
        {
            title: `Welcome to ${COMPANY_NAME_LABEL}`,
            message: "Join, create, manage appointment with your Appointment-Booking."
        },
    ]
}
//======================================= PAGE REGISTER DEFAULT =================================================================
export const registerScreenResources = {
    companyLogo: COMPANY_DATA.logo,
    headerInstruction: "Appointment-Booking Registration",
    subHeaderInstruction: {
        icon: "/capitec.svg",
        message: "Capitec client? Please use your registered email with Capitec.",
    },
    idNumber:{
      type:"text",
      id: "idNumber",
      label: "ID/Passport Number",
    },
    isCapitecClient:{
        type:"checkbox",
        id: "isCapitecClient",
        label: "I am a Capitec client",
    },
    firstname: {
        type:"text",
        id: "firstname",
        label: "First name",
    },
    lastname: {
        type:"text",
        id: "lastname",
        label: "Last name",
    },
    email: {
        type: "email",
        label: "Email",
        id: "email",
    },

    password: {
        passwordVisibility: PasswordVisibility.TOGGLE_VISIBILITY,
        type: "password",
        label: "Password",
        id: "password"
    },
    confirmPassword: {
        passwordVisibility: PasswordVisibility.TOGGLE_VISIBILITY,
        type: "password",
        label: "Confirm password",
        id: "confirmPassword",
    },
    registerButton: {
        label: "Send verification code",
        buttonType: "submit",
        disabled:false
    },
    loginLinkButton: {
        label: "Already have an account?",
        linkLabel: " Log in",
        path: "/login",

    },
}