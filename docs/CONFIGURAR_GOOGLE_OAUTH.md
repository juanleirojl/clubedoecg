# 🔐 Como Configurar Login com Google

## Passo 1: Criar projeto no Google Cloud Console

1. Acesse: https://console.cloud.google.com/
2. Clique em **Selecionar projeto** → **Novo projeto**
3. Nome: `Clube do ECG`
4. Clique em **Criar**

## Passo 2: Configurar a tela de consentimento OAuth

1. No menu lateral, vá em **APIs e Serviços** → **Tela de consentimento OAuth**
2. Escolha **Externo** e clique em **Criar**
3. Preencha:
   - **Nome do app**: Clube do ECG
   - **Email de suporte**: seu email
   - **Logo do app**: (opcional, pode adicionar depois)
   - **Domínio autorizado**: clubedoecg.com.br (ou deixe vazio por enquanto)
   - **Email do desenvolvedor**: seu email
4. Clique em **Salvar e continuar**
5. Em **Escopos**, clique em **Adicionar ou remover escopos**
   - Adicione: `email` e `profile`
6. Clique em **Salvar e continuar** até finalizar

## Passo 3: Criar credenciais OAuth

1. No menu lateral, vá em **APIs e Serviços** → **Credenciais**
2. Clique em **+ Criar Credenciais** → **ID do cliente OAuth**
3. Tipo de aplicativo: **Aplicativo da Web**
4. Nome: `Clube do ECG Web`
5. **Origens JavaScript autorizadas**:
   - `http://localhost:3000` (desenvolvimento)
   - `https://clubedoecg.vercel.app` (produção - depois que publicar)
6. **URIs de redirecionamento autorizados**:
   - `https://jgcolkkztqimtvdpuvxy.supabase.co/auth/v1/callback` ← **IMPORTANTE!**
7. Clique em **Criar**

## Passo 4: Copiar as credenciais

Após criar, você verá:
- **ID do cliente**: algo como `123456789-abcdefg.apps.googleusercontent.com`
- **Chave secreta do cliente**: algo como `GOCSPX-xxxxxxxxxxxxx`

**Guarde essas informações!**

## Passo 5: Configurar no Supabase

1. Acesse: https://supabase.com/dashboard/project/jgcolkkztqimtvdpuvxy/auth/providers
2. Encontre **Google** na lista e clique
3. Clique em **Enable Sign in with Google**
4. Cole:
   - **Client IDs**: Cole o ID do cliente
   - **Client Secret**: Cole a chave secreta
5. Clique em **Save**

## ✅ Pronto!

Agora o login com Google está funcionando!

---

## Informações do seu projeto Supabase:

- **Callback URL**: `https://jgcolkkztqimtvdpuvxy.supabase.co/auth/v1/callback`
- **Dashboard**: https://supabase.com/dashboard/project/jgcolkkztqimtvdpuvxy/auth/providers

## Troubleshooting

### Erro "redirect_uri_mismatch"
Verifique se a URI de redirecionamento está **exatamente** igual no Google Cloud Console.

### Erro "access_blocked: This app is not yet verified"
O app está em modo de teste. Para produção, você precisa verificar o app no Google.

### Para adicionar usuários de teste (enquanto em desenvolvimento)
1. Vá em **APIs e Serviços** → **Tela de consentimento OAuth**
2. Role até **Usuários de teste**
3. Adicione os emails que podem testar o login



