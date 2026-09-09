/**
 * Payment gateway seam.
 *
 * Browser flow:
 * 1. Create a payment row with status `initiated` / `processing`.
 * 2. Open Razorpay or Cashfree checkout with the server-created order id.
 * 3. On widget success, send the payment id + signature to an Edge Function.
 * 4. The Edge Function verifies the signature with the secret key and calls
 *    public.mark_payment_success. Only that function may flip status to success.
 *
 * Never mark a payment successful from the client.
 */
export type Gateway = 'razorpay' | 'cashfree'

export interface CreateOrderInput {
  schoolId: string
  studentId: string
  amountPaise: number
  currency?: string
  gateway: Gateway
}

export async function createGatewayOrder(_input: CreateOrderInput) {
  throw new Error('Wire this to a Supabase Edge Function that holds the gateway secret.')
}

export async function confirmGatewayPayment(_payload: {
  paymentRowId: string
  gatewayPaymentId: string
  signature: string
}) {
  throw new Error('Wire this to public.mark_payment_success via an Edge Function.')
}
