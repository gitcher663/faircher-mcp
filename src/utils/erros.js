export function formatError(err) {
  return {
    error: true,
    message: err.message || "Internal error"
  };
}
