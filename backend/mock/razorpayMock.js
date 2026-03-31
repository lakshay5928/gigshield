// Mock Razorpay UPI Payout — Test Mode
async function mockUpiPayout(amount, workerId) {
  await new Promise(r => setTimeout(r, 150 + Math.random() * 250)); // simulate network
  const ref = `UPI_GS_${Date.now()}_${String(workerId).slice(0, 8).toUpperCase()}`;
  console.log(`[UPI MOCK] ₹${amount} → ${workerId} | Ref: ${ref}`);
  return ref;
}

module.exports = { mockUpiPayout };
