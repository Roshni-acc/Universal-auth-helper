export const getApiBaseUrl = (): string => {
  if (typeof window !== "undefined") {
    const origin = window.location.origin;
    if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
      return "";
    }
  }
  // Fallback to production Render backend if required
  return "";
};
