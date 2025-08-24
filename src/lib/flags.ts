
export const usePaymentMock = () => {
    // Return true if not in production and the flag is explicitly "true"
    // In production, this should always be false.
    if (process.env.NODE_ENV === 'production') {
        return false;
    }
    return process.env.NEXT_PUBLIC_USE_PAYMENT_MOCK === "true";
};

export const fallbackToMockOnHealthFail = () => {
    if (process.env.NODE_ENV === 'production') {
        return false;
    }
    return process.env.NEXT_PUBLIC_PAYMENT_FALLBACK_TO_MOCK === "true";
}
