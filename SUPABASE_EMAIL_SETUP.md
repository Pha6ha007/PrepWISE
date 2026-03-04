# Supabase Email Confirmation Setup

## Что уже сделано в коде:

✅ Кнопки "Start for free" ведут на `/register`
✅ После регистрации показывается сообщение "Check your email"
✅ Email redirect URL настроен на `/auth/callback`
✅ После подтверждения email пользователь идет на `/onboarding`

## Настройка в Supabase Dashboard:

### 1. Включить Email Confirmation

1. Зайдите в **Supabase Dashboard**: https://app.supabase.com
2. Выберите ваш проект **Confide**
3. Перейдите в **Authentication** → **Settings**
4. Найдите секцию **"Email Auth"**
5. Убедитесь что **"Enable email confirmations"** включено ✅

### 2. Настроить Email Templates

1. В том же разделе **Authentication** → **Email Templates**
2. Найдите **"Confirm signup"** template
3. Вы можете кастомизировать текст письма:

**Пример кастомного шаблона:**

```html
<h2>Welcome to Confide!</h2>
<p>Thanks for signing up. Please confirm your email address by clicking the link below:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your email</a></p>
<p>If you didn't create this account, you can safely ignore this email.</p>
```

### 3. Настроить Redirect URLs

1. Перейдите в **Authentication** → **URL Configuration**
2. Добавьте в **"Redirect URLs"**:
   - `http://localhost:3000/auth/callback` (для dev)
   - `https://yourproductiondomain.com/auth/callback` (для prod)

### 4. Настроить Email Provider (опционально)

По умолчанию Supabase использует свой SMTP для development.
Для production рекомендуется настроить свой SMTP:

1. **Authentication** → **Settings** → **SMTP Settings**
2. Можете использовать:
   - **Resend** (у вас уже есть RESEND_API_KEY)
   - **SendGrid**
   - **AWS SES**

**Пример настройки Resend SMTP:**
- Host: `smtp.resend.com`
- Port: `587`
- Username: `resend`
- Password: `your_resend_api_key`

## Как это работает:

1. **Пользователь регистрируется** на `/register`
2. **Supabase отправляет email** с подтверждающей ссылкой
3. **Пользователь кликает** на ссылку в email
4. **Supabase редиректит** на `/auth/callback?code=...`
5. **Callback обменивает code** на session
6. **Проверяет companion_name** пользователя:
   - Если пустой → редирект на `/onboarding`
   - Если заполнен → редирект на `/dashboard/chat`

## Тестирование:

1. Зарегистрируйте новый аккаунт на http://localhost:3000/register
2. Проверьте inbox email который указали
3. Кликните на ссылку подтверждения
4. Должны попасть на `/onboarding`

## Troubleshooting:

**Email не приходит?**
- Проверьте spam папку
- Проверьте что email confirmation включен в Supabase
- Проверьте SMTP настройки

**Ошибка после клика на ссылку?**
- Проверьте что redirect URL добавлен в Supabase
- Проверьте консоль браузера на ошибки
- Проверьте что `/auth/callback/route.ts` работает

**Пользователь попадает не на onboarding?**
- Проверьте что `companion_name` в БД пустой
- Проверьте логику в `/auth/callback/route.ts`
