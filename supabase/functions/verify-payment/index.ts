// Deploy with the Supabase CLI. Keep RAZORPAY_KEY_SECRET / CASHFREE_SECRET
// in Edge Function secrets — never in Vite env vars.
//
// Deno.serve(async (req) => {
//   const { payment_id, gateway_payment_id, signature } = await req.json()
//   // verify signature with the gateway secret
//   const { data, error } = await supabase.rpc('mark_payment_success', {
//     p_payment_id: payment_id,
//     p_gateway_payment_id: gateway_payment_id,
//     p_signature: signature,
//   })
//   if (error) return new Response(error.message, { status: 400 })
//   return Response.json(data)
// })

export {}
