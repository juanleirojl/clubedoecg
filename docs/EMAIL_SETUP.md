# 📧 Configuração do Sistema de Emails

Este documento explica como configurar e gerenciar o sistema de emails do Clube do ECG.

## 🚀 Visão Geral

O sistema de emails usa:
- **Resend** - Provedor de email transacional
- **React Email** - Templates de email em React
- **Supabase** - Armazenamento de logs e configurações
- **Vercel Cron** - Agendamento de envios automáticos

---

## 📋 Passo 1: Criar Conta no Resend

1. Acesse [resend.com](https://resend.com) e crie uma conta
2. Após login, vá em **API Keys**
3. Clique em **Create API Key**
4. Copie a chave gerada (ela só aparece uma vez!)

---

## 📋 Passo 2: Configurar Domínio Próprio (Recomendado)

Para enviar emails como `noreply@clubedoecg.com.br`:

### No Resend:
1. Vá em **Domains** → **Add Domain**
2. Digite seu domínio: `clubedoecg.com.br`
3. Copie os registros DNS que aparecem

### No seu provedor de DNS (Cloudflare, Registro.br, etc.):
Adicione os seguintes registros:

| Tipo | Nome | Valor | TTL |
|------|------|-------|-----|
| TXT | @ | `v=spf1 include:_spf.resend.com ~all` | 3600 |
| CNAME | resend._domainkey | `[valor do Resend]` | 3600 |
| CNAME | [outro] | `[valor do Resend]` | 3600 |

### Verificar:
1. Volte ao Resend e clique em **Verify**
2. Aguarde até 24h para propagação DNS
3. Status ficará **Verified** ✅

---

## 📋 Passo 3: Configurar Variáveis de Ambiente

### No arquivo `.env.local`:

```env
# Resend
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=Clube do ECG <noreply@clubedoecg.com.br>

# Webhook do Resend (opcional, para tracking)
RESEND_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxx

# Cron Job Secret (para segurança)
CRON_SECRET=sua-senha-secreta-aqui
```

### No Vercel Dashboard:
1. Vá em **Settings** → **Environment Variables**
2. Adicione cada variável acima
3. Selecione **Production**, **Preview** e **Development**

---

## 📋 Passo 4: Executar Migration no Supabase

Execute o SQL no Supabase SQL Editor:

```sql
-- Arquivo: supabase/migrations/20251227_email_system.sql
-- (cole o conteúdo completo do arquivo)
```

Isso criará:
- `email_log` - Logs de todos os emails enviados
- `notification_campaigns` - Campanhas manuais
- `email_config` - Configurações globais
- Funções de verificação anti-spam

---

## 📋 Passo 5: Configurar Webhook do Resend (Opcional)

Para tracking de abertura/cliques:

1. No Resend, vá em **Webhooks**
2. Clique em **Add Webhook**
3. URL: `https://seu-dominio.com/api/emails/webhook`
4. Selecione os eventos:
   - `email.sent`
   - `email.delivered`
   - `email.opened`
   - `email.clicked`
   - `email.bounced`
   - `email.complained`
5. Copie o **Signing Secret**
6. Adicione como `RESEND_WEBHOOK_SECRET` nas variáveis de ambiente

---

## 📋 Passo 6: Deploy e Teste

1. Faça deploy no Vercel
2. Acesse `/admin/emails` para ver o painel
3. Clique em **Executar Cron** para testar manualmente

---

## 🛡️ Controles Anti-Spam

O sistema inclui várias proteções:

### Limites por Usuário:
| Tipo de Email | Frequência Máxima |
|--------------|-------------------|
| Lembrete | 1x por semana (configurável) |
| Novo Conteúdo | 1x por dia |
| Resumo Semanal | 1x por semana |
| Campanhas | Manual |

### Limites Globais:
- Limite diário de envios (padrão: 500)
- Horário permitido: 10h-18h UTC (seg-sex)
- Dias permitidos configuráveis

### Respeito às Preferências:
- Usuário pode desativar cada tipo de email
- Opção "Nunca" para lembretes
- Unsubscribe em 1 clique

---

## 📊 Painel de Administração

Acesse `/admin/emails` para:

- ✅ Ver estatísticas de envio
- ✅ Pausar/ativar todos os emails
- ✅ Ajustar limites e horários
- ✅ Ver logs de emails recentes
- ✅ Criar campanhas manuais
- ✅ Executar cron manualmente

---

## 🔧 Templates Disponíveis

| Template | Quando é usado |
|----------|----------------|
| `welcome` | Ao criar conta |
| `reminder` | Usuário inativo |
| `new_content` | Nova aula/curso |
| `weekly_summary` | Resumo semanal |

### Customizar Templates:
Os templates estão em:
```
src/lib/email/templates/
├── base-template.tsx      # Layout base
├── reminder-template.tsx  # Lembrete
├── new-content-template.tsx
├── weekly-summary-template.tsx
└── welcome-template.tsx
```

Para preview, instale:
```bash
npm install react-email -D
npx email dev
```

---

## 📅 Cron Job (Envio Automático)

O arquivo `vercel.json` configura o cron:

```json
{
  "crons": [
    {
      "path": "/api/emails/cron",
      "schedule": "0 13 * * 1-5"
    }
  ]
}
```

Isso significa:
- **13:00 UTC** (10:00 em Brasília)
- **Segunda a Sexta**
- Executa 1x por dia

### Para alterar:
Use a sintaxe cron:
- `0 13 * * *` - Todo dia às 13h UTC
- `0 13 * * 1,3,5` - Seg, Qua, Sex
- `0 */6 * * *` - A cada 6 horas

---

## ❓ FAQ

### Os emails estão indo para spam?
- Verifique se o domínio está verificado
- Configure SPF, DKIM e DMARC
- Evite palavras de spam no assunto

### Como parar todos os emails?
1. Acesse `/admin/emails`
2. Desative o switch "Emails Ativos"

### Como ver se um email foi aberto?
1. Configure o webhook do Resend
2. Veja a coluna "Status" nos logs
3. "OPENED" = foi aberto

### Limite de emails gratuito do Resend?
- 3.000 emails/mês no plano grátis
- Depois: $20/mês para 50.000

---

## 📞 Suporte

Em caso de problemas:
1. Verifique os logs no Vercel Functions
2. Verifique a tabela `email_log` no Supabase
3. Teste o endpoint `/api/emails/webhook` com GET

---

*Última atualização: Dezembro 2024*

