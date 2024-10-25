'use server'

import { sql } from "@vercel/postgres"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  data: z.string(),
})

const CreateInvoice = FormSchema.omit({ id: true, data: true })

export async function createInvoice(formData: FormData) {
  const { amount, customerId, status } = CreateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status')
  })

  const amountInCentes = amount * 100

  const date = new Date().toISOString().split('T')[0]

  await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES  (${customerId}, ${amountInCentes}, ${status}, ${date})
  `

  revalidatePath('/dashboard/invoices') // faz limpar o cache do lado do cliente do caminho do link 
  redirect('/dashboard/invoices') // redireciona após limpar o cache da página.

}
