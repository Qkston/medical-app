# Medical App - Terraform Infrastructure

Цей Terraform проект створює необхідну AWS інфраструктуру для Medical App, включаючи S3 сервіси та майбутні компоненти.

## 📁 Структура проекту

```
terraform/
├── main.tf                     # Основна конфігурація Terraform
├── variables.tf                # Змінні
├── outputs.tf                  # Вихідні значення
├── s3.tf                      # Конфігурація S3 бакетів
├── environments/              # Конфігурації середовищ
│   ├── dev.tfvars            # Development
│   ├── staging.tfvars        # Staging
│   └── prod.tfvars           # Production
├── modules/                   # Terraform модулі
│   └── s3/                   # S3 модуль
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
├── scripts/                   # Скрипти для деплойменту
│   ├── deploy.sh             # Linux/macOS скрипт
│   └── deploy.bat            # Windows скрипт
└── README.md                 # Цей файл
```

## 🚀 Getting Started - Швидкий старт

Цей розділ допоможе вам швидко почати роботу з Terraform для вашого Medical App проекту.

### ✅ Перед початком

#### 1. Встановіть Terraform

**Windows (Chocolatey):**
```bash
choco install terraform
```

**Windows (Manual):**
1. Завантажте з https://www.terraform.io/downloads.html
2. Розпакуйте в папку (наприклад, `C:\terraform`)
3. Додайте шлях до PATH

**macOS:**
```bash
brew install terraform
```

**Ubuntu/Debian:**
```bash
curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo apt-key add -
sudo apt-add-repository "deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs) main"
sudo apt-get update && sudo apt-get install terraform
```

**Перевірка установки:**
```bash
terraform version
```

#### 2. Налаштуйте AWS CLI

```bash
aws configure
```

Введіть ваші AWS credentials:
- AWS Access Key ID
- AWS Secret Access Key  
- Default region (наприклад, `us-east-1`)
- Default output format (`json`)

**Перевірка:**
```bash
aws sts get-caller-identity
```

#### 3. Необхідні AWS права
Переконайтеся, що у вас є права для створення S3 buckets, CloudFront distributions

### 🏃‍♂️ Швидкий старт

#### Варіант 1: Автоматичний (Рекомендовано для Windows)

1. Відкрийте Command Prompt як Administrator
2. Перейдіть в папку terraform:
   ```bash
   cd terraform
   ```
3. Запустіть quick-start скрипт:
   ```bash
   quick-start.bat
   ```

#### Варіант 2: Ручний

1. **Створіть конфігурацію для dev середовища:**
   ```bash
   cd terraform
   
   # Windows
   copy environments\dev.tfvars.example environments\dev.tfvars
   
   # Linux/macOS
   cp environments/dev.tfvars.example environments/dev.tfvars
   ```

2. **Відредагуйте `environments/dev.tfvars`** з вашими налаштуваннями:
   ```hcl
   environment = "dev"
   aws_region  = "us-east-1"  # ваш регіон
   
   # Додайте URL вашого фронтенду
   allowed_cors_origins = [
     "http://localhost:3000",
     "https://localhost:3000"
   ]
   ```

3. **Ініціалізація Terraform:**
   ```bash
   # Windows
   scripts\deploy.bat dev init
   
   # Linux/macOS
   chmod +x scripts/deploy.sh
   ./scripts/deploy.sh dev init
   ```

4. **Планування змін:**
   ```bash
   # Windows
   scripts\deploy.bat dev plan
   
   # Linux/macOS
   ./scripts/deploy.sh dev plan
   ```

5. **Застосування змін:**
   ```bash
   # Windows
   scripts\deploy.bat dev apply
   
   # Linux/macOS
   ./scripts/deploy.sh dev apply
   ```

### 📦 Що буде створено

Після успішного `apply` будуть створені:

1. **3 S3 Buckets:**
   - `medical-app-dev-medical-files-XXXXXXXX` - для медичних файлів
   - `medical-app-dev-static-assets-XXXXXXXX` - для статичних ресурсів
   - `medical-app-dev-backup-XXXXXXXX` - для резервних копій

2. **Налаштування безпеки:**
   - Encryption на всіх buckets
   - CORS конфігурація
   - Versioning

## 🎯 Використання

### Доступні команди

| Команда | Опис |
|---------|------|
| `init` | Ініціалізація Terraform |
| `plan` | Планування змін |
| `apply` | Застосування змін |
| `destroy` | Знищення ресурсів |

### Середовища

| Середовище | Файл конфігурації | Опис |
|------------|-------------------|------|
| `dev` | `environments/dev.tfvars` | Розробка |
| `staging` | `environments/staging.tfvars` | Тестування |
| `prod` | `environments/prod.tfvars` | Продакшн |

### 🔧 Корисні команди

```bash
# Перегляд поточного стану
terraform show

# Перегляд виходів
terraform output

# Перегляд планів без застосування
scripts\deploy.bat dev plan    # Windows
./scripts/deploy.sh dev plan   # Linux/macOS

# Повне видалення ресурсів
scripts\deploy.bat dev destroy    # Windows
./scripts/deploy.sh dev destroy   # Linux/macOS
```

## 📦 Створені ресурси

### S3 Buckets

1. **Medical Files Bucket** - для зберігання медичних файлів пацієнтів
   - Encryption: AES256
   - Versioning: Enabled
   - Public Access: Blocked
   - CORS: Configured for frontend

2. **Static Assets Bucket** - для frontend ресурсів
   - Encryption: AES256
   - Versioning: Enabled
   - Public Access: Allowed (для статичних файлів)
   - CORS: Configured
   - CloudFront: Enabled в production

3. **Backup Bucket** - для резервних копій
   - Encryption: AES256
   - Versioning: Always enabled
   - Lifecycle: Automatic archiving (30d → IA, 90d → Glacier, 365d → Deep Archive)
   - Public Access: Blocked

### CloudFront (тільки в production)

- Distribution для static assets bucket
- HTTPS redirect
- Global edge locations
- Origin Access Control (OAC)

## ⚙️ Конфігурація

### Змінні середовищ

Основні змінні, які можна налаштувати в `environments/*.tfvars`:

```hcl
# Основні налаштування
environment = "dev"
aws_region  = "us-east-1"

# S3 конфігурація
s3_versioning_enabled = true
s3_encryption_enabled = true
s3_force_destroy      = true  # тільки для dev

# CORS налаштування
allowed_cors_origins = [
  "http://localhost:3000",
  "https://localhost:3000"
]
```

### Кастомізація CORS Origins

Для додавання нових доменів, оновіть `allowed_cors_origins` у відповідному файлі середовища:

```hcl
allowed_cors_origins = [
  "https://yourdomain.com",
  "https://app.yourdomain.com"
]
```

## 🔐 Безпека

### Рекомендації

1. **Ніколи не commitьте `.tfvars` файли** з чутливими даними
2. **Використовуйте AWS IAM ролі** для Terraform
3. **Увімкніть MFA** для AWS аккаунту
4. **Регулярно переглядайте** права доступу

### State File

- State file зберігається локально
- Для продакшн рекомендується використовувати remote backend (S3 + DynamoDB)
- Розкоментуйте секцію `backend` в `main.tf` для remote state

```hcl
backend "s3" {
  bucket = "your-terraform-state-bucket"
  key    = "medical-app/terraform.tfstate"
  region = "us-east-1"
}
```

## 🔄 Lifecycle Management

### Development

```bash
# Швидкий цикл розробки
scripts\deploy.bat dev plan
scripts\deploy.bat dev apply

# Очищення після тестування
scripts\deploy.bat dev destroy
```

### Production

```bash
# Завжди плануйте перед застосуванням
scripts\deploy.bat prod plan

# Перевірте план уважно, потім застосуйте
scripts\deploy.bat prod apply
```

## 📊 Outputs

Після успішного apply ви отримаєте:

```
Outputs:

aws_account_id = "123456789012"
aws_region = "us-east-1"
medical_files_bucket_name = "medical-app-dev-medical-files-abc12345"
medical_files_bucket_arn = "arn:aws:s3:::medical-app-dev-medical-files-abc12345"
static_assets_bucket_name = "medical-app-dev-static-assets-abc12345"
backup_bucket_name = "medical-app-dev-backup-abc12345"
static_assets_cloudfront_url = "https://d123456789.cloudfront.net" (prod only)
```

## 🛠 Troubleshooting

### ❓ Якщо щось пішло не так

#### Помилка "bucket already exists"
- Bucket names мають бути унікальними глобально
- Змініть `bucket_prefix` або зачекайте кілька хвилин (bucket names кешуються)

#### Помилка "Access Denied"
- Перевірте AWS credentials: `aws sts get-caller-identity`
- Переконайтеся, що у вас є права для створення S3 buckets
- Перевірте права IAM користувача

#### Terraform не знаходиться
- Перевірте, що terraform додано до PATH
- Перезапустіть Command Prompt

#### Помилка "Invalid region"
- Перевірте правильність регіону в `.tfvars` файлах

### Логи та діагностика

```bash
# Увімкнути debug логи
export TF_LOG=DEBUG

# Перевірити Terraform версію
terraform version

# Перевірити AWS credentials
aws sts get-caller-identity
```

## 🎯 Наступні кроки

1. **Інтеграція з фронтендом:** використовуйте bucket names з terraform output у вашому React додатку

2. **Налаштування CI/CD:** додайте Terraform команди в ваш deployment pipeline

3. **Додаткові середовища:** створіть staging та prod середовища за тим же принципом

## 🔮 Майбутні розширення

Плануються додаткові модулі:

- [ ] **Lambda Functions** - для Amplify функцій
- [ ] **API Gateway** - для REST API
- [ ] **DynamoDB** - для імпорту існуючих таблиць
- [ ] **Cognito** - для аутентифікації
- [ ] **CloudWatch** - для моніторингу
- [ ] **Route53** - для DNS управління

## 📝 Contributing

1. Створіть feature branch
2. Додайте зміни до відповідного модуля
3. Протестуйте на dev середовищі
4. Створіть Pull Request

## 📞 Підтримка

Для питань та підтримки:
- Створіть issue в репозиторії
- Перевірте [Terraform документацію](https://www.terraform.io/docs)
- Перевірте [AWS Provider документацію](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)

---

**Важливо**: Завжди тестуйте зміни на dev середовищі перед застосуванням в production!

**Готово!** Ваша AWS інфраструктура тепер керується через Terraform! 🎉 