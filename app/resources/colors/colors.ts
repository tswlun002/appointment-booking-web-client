// ===========================================
// DESIGN SYSTEM - CAPITEC BRAND COLORS & TYPOGRAPHY
// ===========================================

// Brand Colors
export const colors = {
    // Primary - Capitec Blue
    primary: '#2F70EF',
    primaryDark: '#1e313e',
    primaryLight: '#e8f0fe',

    // Accent - Capitec Red
    red: '#C83C37',
    redLight: '#fee2e2',
    redBorder: '#fecaca',

    // Neutrals
    white: '#FFFFFF',
    black: '#000000',

    // Text (using primaryDark for main text)
    textPrimary: '#1e313e',
    textSecondary: '#3a3a3a',
    textMuted: '#6b7280',
    textLight: '#9ca3af',

    // Backgrounds
    bgWhite: '#FFFFFF',
    bgLight: '#f9fafb',
    bgMuted: '#f3f4f6',

    // Borders
    borderLight: '#e5e7eb',
    borderMedium: '#d1d5db',

    // Status - Keep minimal
    success: '#16a34a',
    successLight: '#dcfce7',
    successBorder: '#bbf7d0',

    warning: '#d97706',
    warningLight: '#fef3c7',
    warningBorder: '#fde68a',
} as const;

// ===========================================
// TYPOGRAPHY STANDARDS
// ===========================================
export const typography = {
    // Headings
    h1: {
        fontSize: '2.25rem',      // 36px
        fontWeight: '700',        // bold
        lineHeight: '2.5rem',     // 40px
    },
    h2: {
        fontSize: '1.875rem',     // 30px
        fontWeight: '700',        // bold
        lineHeight: '2.25rem',    // 36px
    },
    h3: {
        fontSize: '1.5rem',       // 24px
        fontWeight: '700',        // bold
        lineHeight: '2rem',       // 32px
    },
    h4: {
        fontSize: '1.25rem',      // 20px
        fontWeight: '600',        // semibold
        lineHeight: '1.75rem',    // 28px
    },

    // Body Text
    bodyLarge: {
        fontSize: '1.125rem',     // 18px
        fontWeight: '400',        // normal
        lineHeight: '1.75rem',    // 28px
    },
    body: {
        fontSize: '1rem',         // 16px
        fontWeight: '400',        // normal
        lineHeight: '1.5rem',     // 24px
    },
    bodySmall: {
        fontSize: '0.875rem',     // 14px
        fontWeight: '400',        // normal
        lineHeight: '1.25rem',    // 20px
    },

    // Labels & Captions
    label: {
        fontSize: '0.875rem',     // 14px
        fontWeight: '500',        // medium
        lineHeight: '1.25rem',    // 20px
    },
    caption: {
        fontSize: '0.75rem',      // 12px
        fontWeight: '400',        // normal
        lineHeight: '1rem',       // 16px
    },

    // Buttons
    button: {
        fontSize: '0.875rem',     // 14px
        fontWeight: '600',        // semibold
        lineHeight: '1.25rem',    // 20px
    },
    buttonLarge: {
        fontSize: '1rem',         // 16px
        fontWeight: '600',        // semibold
        lineHeight: '1.5rem',     // 24px
    },
} as const;

// Status Styles (for badges, alerts) - Keys match AppointmentStatus enum
export const statusStyles = {
    BOOKED: {
        bg: colors.successLight,
        text: colors.success,
        border: colors.successBorder,
    },
    CANCELLED: {
        bg: colors.redLight,
        text: colors.red,
        border: colors.redBorder,
    },
    CHECKED_IN: {
        bg: colors.warningLight,
        text: colors.warning,
        border: colors.warningBorder,
    },
    IN_PROGRESS: {
        bg: colors.warningLight,
        text: colors.warning,
        border: colors.warningBorder,
    },
    COMPLETED: {
        bg: colors.primaryLight,
        text: colors.primary,
        border: colors.primary,
    },
    NO_SHOW: {
        bg: colors.bgMuted,
        text: colors.textSecondary,
        border: colors.borderMedium,
    },
    default: {
        bg: colors.bgMuted,
        text: colors.textSecondary,
        border: colors.borderMedium,
    },
} as const;

// Helper function to get status style
export const getStatusColors = (status: string) => {
    return statusStyles[status as keyof typeof statusStyles] || statusStyles.default;
};

// Legacy exports (for backwards compatibility)
export const white_background = colors.bgWhite;
export const blue_primary = colors.primary;
export const card_primary = colors.primaryDark;
