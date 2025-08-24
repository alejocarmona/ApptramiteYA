

export const PAYMENT_MODE = "mock";

export const usePaymentMock = () => {
    return PAYMENT_MODE === 'mock';
};

export const fallbackToMockOnHealthFail = () => {
    if (process.env.NODE_ENV === 'production') {
        return false;
    }
    return process.env.NEXT_PUBLIC_PAYMENT_FALLBACK_TO_MOCK === "true";
}
