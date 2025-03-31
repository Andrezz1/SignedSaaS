import cron from 'node-cron'
import { enviarNotificacao } from './notificacaoService'

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

cron.schedule('1 0 * * *', async () => {
  console.log('A procurar subscricoes...')
  await enviarNotificacao().catch(console.error)
})