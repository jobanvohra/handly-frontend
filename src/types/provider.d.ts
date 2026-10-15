import { providerProfileFormSchema } from '@/schemas/provider.schema'
import { z } from 'zod'

export type ProviderProfileFormInput = z.infer<typeof providerProfileFormSchema>