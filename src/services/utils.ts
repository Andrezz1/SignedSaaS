import cron from 'node-cron'
import { enviarNotificacao } from './notificacaoService'

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

// Cron para correr a funcao enviarNotificacao todos os dias a 00:01
cron.schedule('1 0 * * *', async () => {
  console.log('A procurar subscricoes...')
  await enviarNotificacao().catch(console.error)
})

import fs from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"

export async function saveImageLocally(base64Image: string): Promise<string> {
  const buffer = Buffer.from(base64Image, "base64")
  const uploadDir = path.join(process.cwd(), "uploads")

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }

  const fileName = `${uuidv4()}.jpg`
  const filePath = path.join(uploadDir, fileName)

  fs.writeFileSync(filePath, buffer)

  return `/uploads/${fileName}`
}

// import { criarReferenciaMultibanco } from './pagamentoService';

// async function main() {
//   try {
//     const valor = 50.0
//     const id = '123456'

//     const resposta = await criarReferenciaMultibanco(valor, id)
//     console.log('Referência Multibanco criada com sucesso:')
//     console.log(`Entidade: ${resposta.entidade}`)
//     console.log(`Referência: ${resposta.referencia}`)
//     console.log(`Valor: ${resposta.valor}€`)
//   } catch (error) {
//     console.error(error)
//   }
// }

// main()


