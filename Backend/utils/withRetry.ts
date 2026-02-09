export async function withRetry<T>(
    fn: () => Promise<T>,
    retries = 3
): Promise<T> {
    try {
        return await fn();
    } catch (err: any) {
        if (
            retries > 0 &&
            err?.original?.code === "ER_LOCK_DEADLOCK"
        ) {
            console.log("Deadlock detected. Retrying...");
            return withRetry(fn, retries - 1);
        }
        throw err;
    }
}
