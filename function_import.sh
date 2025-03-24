#!/bin/bash

# Скрипт для імпорту лямбда-функцій в Amplify проект

# Функція для логування
log() {
  echo -e "\033[1;34m[INFO]\033[0m $1"
}

error() {
  echo -e "\033[1;31m[ERROR]\033[0m $1"
  exit 1
}

# Перевірка наявності AWS CLI
if ! command -v aws &> /dev/null; then
    error "AWS CLI не встановлено. Будь ласка, встановіть його перед використанням цього скрипту."
fi

# Перевірка чи папка amplify існує
if [ ! -d "amplify" ]; then
    error "Папка 'amplify' не знайдена. Переконайтеся, що ви у корені Amplify проекту."
fi

# Запитуємо назву функції
read -p "Введіть назву лямбда-функції для імпорту: " FUNCTION_NAME

if [ -z "$FUNCTION_NAME" ]; then
    error "Назва функції не може бути порожньою"
fi

log "Починаємо імпорт функції '$FUNCTION_NAME'..."

# Перевірка існування функції
log "Перевірка існування функції в AWS..."
if ! aws lambda get-function --function-name $FUNCTION_NAME &> /dev/null; then
    error "Функція '$FUNCTION_NAME' не знайдена в AWS. Перевірте назву та налаштування AWS CLI."
fi

# Створення структури папок
FUNCTION_DIR="amplify/backend/function/$FUNCTION_NAME"
SRC_DIR="$FUNCTION_DIR/src"

log "Створення структури папок для функції..."
mkdir -p "$SRC_DIR"

# Запис amplify.state файлу
log "Створення amplify.state файлу..."
echo '{"IsImported":true}' > "$FUNCTION_DIR/amplify.state"

# Отримання інформації про функцію
log "Отримання інформації про функцію з AWS..."
FUNCTION_INFO=$(aws lambda get-function --function-name $FUNCTION_NAME)

# Парсинг інформації про функцію
RUNTIME=$(echo $FUNCTION_INFO | grep -o '"Runtime": "[^"]*"' | cut -d'"' -f4)
HANDLER=$(echo $FUNCTION_INFO | grep -o '"Handler": "[^"]*"' | cut -d'"' -f4)
MEMORY=$(echo $FUNCTION_INFO | grep -o '"MemorySize": [0-9]*' | awk '{print $2}')
TIMEOUT=$(echo $FUNCTION_INFO | grep -o '"Timeout": [0-9]*' | awk '{print $2}')

# Створення function-parameters.json
log "Створення function-parameters.json файлу..."
cat > "$FUNCTION_DIR/function-parameters.json" << EOF
{
  "lambdaLayers": [],
  "environmentVariables": {},
  "runtime": "$RUNTIME",
  "handler": "$HANDLER",
  "memorySize": $MEMORY,
  "timeout": $TIMEOUT
}
EOF

# Отримання URL для завантаження коду функції
log "Отримання URL коду функції..."
CODE_URL=$(aws lambda get-function --function-name $FUNCTION_NAME --query 'Code.Location' --output text)

# Завантаження та розпакування коду
log "Завантаження коду функції..."
curl -s -o /tmp/${FUNCTION_NAME}.zip "$CODE_URL"

log "Розпакування коду функції в папку src..."
unzip -q -o /tmp/${FUNCTION_NAME}.zip -d "$SRC_DIR"
rm /tmp/${FUNCTION_NAME}.zip

# Отримання змінних оточення
log "Отримання змінних оточення..."
ENV_VARS=$(aws lambda get-function-configuration --function-name $FUNCTION_NAME --query 'Environment.Variables' --output json)

if [ "$ENV_VARS" != "null" ]; then
    # Оновлення function-parameters.json зі змінними оточення
    TMP_FILE=$(mktemp)
    jq --argjson envVars "$ENV_VARS" '.environmentVariables = $envVars' "$FUNCTION_DIR/function-parameters.json" > "$TMP_FILE"
    mv "$TMP_FILE" "$FUNCTION_DIR/function-parameters.json"
    log "Додано змінні оточення до function-parameters.json"
fi

# Перевірка чи потрібна додаткова конфігурація
API_PERM=false
STORAGE_PERM=false

read -p "Чи потрібні права доступу до API Gateway? (y/n): " API_PERM_ANSWER
if [[ "$API_PERM_ANSWER" == "y" || "$API_PERM_ANSWER" == "Y" ]]; then
    API_PERM=true
    read -p "Введіть назву API: " API_NAME
    
    # Додавання прав API до function-parameters.json
    TMP_FILE=$(mktemp)
    jq --arg apiName "$API_NAME" '.permissions.api[$apiName] = ["create", "read", "update", "delete"]' "$FUNCTION_DIR/function-parameters.json" > "$TMP_FILE"
    mv "$TMP_FILE" "$FUNCTION_DIR/function-parameters.json"
    log "Додано права доступу до API '$API_NAME'"
fi

read -p "Чи потрібні права доступу до DynamoDB таблиць? (y/n): " STORAGE_PERM_ANSWER
if [[ "$STORAGE_PERM_ANSWER" == "y" || "$STORAGE_PERM_ANSWER" == "Y" ]]; then
    STORAGE_PERM=true
    read -p "Введіть назви таблиць через кому: " TABLE_NAMES
    
    IFS=',' read -ra TABLES <<< "$TABLE_NAMES"
    for TABLE in "${TABLES[@]}"; do
        TABLE=$(echo "$TABLE" | xargs)  # Видалення пробілів
        
        # Додавання прав доступу до таблиці
        TMP_FILE=$(mktemp)
        jq --arg tableName "$TABLE" '.permissions.storage[$tableName] = ["create", "read", "update", "delete"]' "$FUNCTION_DIR/function-parameters.json" > "$TMP_FILE"
        mv "$TMP_FILE" "$FUNCTION_DIR/function-parameters.json"
        log "Додано права доступу до таблиці '$TABLE'"
    done
fi

log "Імпорт функції '$FUNCTION_NAME' успішно завершено!"
log "Шлях до імпортованої функції: $FUNCTION_DIR"
