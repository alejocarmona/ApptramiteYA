
export const usePaymentMock = () => {
    // Hardcoded to true for testing purposes as requested.
    return true;
};

export const fallbackToMockOnHealthFail = () => {
    if (process.env.NODE_ENV === 'production') {
        return false;
    }
    return process.env.NEXT_PUBLIC_PAYMENT_FALLBACK_TO_MOCK === "true";
}
