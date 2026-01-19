// Retry Guard Rules
export function canRetryRecharge(txn) {
  // ❌ Already final state
  if (['SUCCESS', 'FAILED', 'REFUNDED'].includes(txn.status)) {
    return false;
  }

  // ❌ Max retries exceeded
  if (txn.retryCount >= 3) {
    return false;
  }

  // ⏳ Minimum gap (2 minutes)
  const last = txn.lastRetryAt || txn.createdAt;
  const diffMs = Date.now() - new Date(last).getTime();

  if (diffMs < 2 * 60 * 1000) {
    return false;
  }

  return true;
}
