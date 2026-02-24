import {useLocation, useNavigate} from "react-router";
import {useEffect} from "react";
import type {AppointmentResponse} from "~/domain/appointment/generated/model";
interface SuccessState {
    appointment?: AppointmentResponse;
}
const useAppointmentSuccessModelView = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as SuccessState | null;
    const appointment = state?.appointment;

    // Redirect if accessed directly without state
    useEffect(() => {
        if (!appointment) {
            navigate("/appointments", { replace: true });
        }
    }, [appointment, navigate]);

    const handleBackToAppointments = () => {
        navigate("/appointments", { replace: true });
    };

    return {
        appointment:appointment,
        handleBackToAppointments: handleBackToAppointments,
    }
};

export default useAppointmentSuccessModelView;