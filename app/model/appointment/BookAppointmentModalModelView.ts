import { useCallback, useEffect, useState } from "react";
import type { BookAppointmentState } from "~/domain/appointment/BookAppointment";
import type { BookAppointmentModelView } from "./BookAppointmentModelView";

/**
 * Modal-specific UI state and logic
 * Handles animations, escape key, body scroll lock
 */
export const useBookAppointmentModalModelView = (
    state: BookAppointmentState,
    model: BookAppointmentModelView
) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    const isOpen = state.userData.isModalOpen;
    const isLoading = state.isLoading;

    // Handle open/close animations
    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            // Small delay to trigger CSS transition
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setIsAnimating(true);
                });
            });
        } else {
            setIsAnimating(false);
            // Wait for animation to complete before hiding
            const timeout = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timeout);
        }
    }, [isOpen]);

    // Handle escape key
    const handleEscape = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen && !isLoading) {
                model.closeModal();
            }
        },
        [isOpen, isLoading, model]
    );

    useEffect(() => {
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [handleEscape]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    // Handle backdrop click
    const handleBackdropClick = useCallback(() => {
        if (!isLoading) {
            model.closeModal();
        }
    }, [isLoading, model]);

    return {
        isVisible,
        isAnimating,
        handleBackdropClick,
    };
};
