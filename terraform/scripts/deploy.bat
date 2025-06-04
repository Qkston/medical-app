@echo off
setlocal enabledelayedexpansion

REM Deploy script for Terraform on Windows
REM Colors (limited support in Windows CMD)
set "GREEN=[92m"
set "YELLOW=[93m"
set "RED=[91m"
set "NC=[0m"

REM Check if environment parameter is provided
if "%1"=="" (
    echo %RED%[ERROR]%NC% Please provide environment ^(dev, staging, prod^)
    echo Usage: %0 ^<environment^> [action]
    echo Actions: plan, apply, destroy, init
    exit /b 1
)

set ENVIRONMENT=%1
set ACTION=%2
if "%ACTION%"=="" set ACTION=plan

REM Validate environment
if "%ENVIRONMENT%"=="dev" goto :env_valid
if "%ENVIRONMENT%"=="staging" goto :env_valid
if "%ENVIRONMENT%"=="prod" goto :env_valid
echo %RED%[ERROR]%NC% Invalid environment. Use: dev, staging, prod
exit /b 1

:env_valid
echo %GREEN%[INFO]%NC% Environment: %ENVIRONMENT%
echo %GREEN%[INFO]%NC% Action: %ACTION%

REM Validate action
if "%ACTION%"=="init" goto :action_valid
if "%ACTION%"=="plan" goto :action_valid
if "%ACTION%"=="apply" goto :action_valid
if "%ACTION%"=="destroy" goto :action_valid
echo %RED%[ERROR]%NC% Invalid action. Use: init, plan, apply, destroy
exit /b 1

:action_valid

REM Check if Terraform is installed
terraform version >nul 2>&1
if %errorlevel% neq 0 (
    echo %RED%[ERROR]%NC% Terraform is not installed
    exit /b 1
)

REM Change to terraform directory
set SCRIPT_DIR=%~dp0
set TERRAFORM_DIR=%SCRIPT_DIR%..
cd /d "%TERRAFORM_DIR%"

echo %GREEN%[INFO]%NC% Working directory: %CD%

REM Set variables file
set TFVARS_FILE=environments\%ENVIRONMENT%.tfvars

if not exist "%TFVARS_FILE%" (
    echo %RED%[ERROR]%NC% Environment file not found: %TFVARS_FILE%
    exit /b 1
)

echo %GREEN%[INFO]%NC% Using variables file: %TFVARS_FILE%

REM Execute Terraform command
if "%ACTION%"=="init" goto :tf_init
if "%ACTION%"=="plan" goto :tf_plan
if "%ACTION%"=="apply" goto :tf_apply
if "%ACTION%"=="destroy" goto :tf_destroy

:tf_init
echo %GREEN%[INFO]%NC% Initializing Terraform...
terraform init
goto :end

:tf_plan
echo %GREEN%[INFO]%NC% Planning Terraform changes...
terraform plan -var-file="%TFVARS_FILE%" -out="terraform-%ENVIRONMENT%.plan"
echo %GREEN%[INFO]%NC% Plan saved to terraform-%ENVIRONMENT%.plan
goto :end

:tf_apply
echo %YELLOW%[WARNING]%NC% Applying Terraform changes for %ENVIRONMENT% environment...
if exist "terraform-%ENVIRONMENT%.plan" (
    terraform apply "terraform-%ENVIRONMENT%.plan"
    del "terraform-%ENVIRONMENT%.plan"
    echo %GREEN%[INFO]%NC% Plan file cleaned up
) else (
    echo %YELLOW%[WARNING]%NC% No plan file found. Running apply with auto-approve...
    terraform apply -var-file="%TFVARS_FILE%" -auto-approve
)
goto :end

:tf_destroy
echo %YELLOW%[WARNING]%NC% This will DESTROY all resources in %ENVIRONMENT% environment!
set /p CONFIRM="Are you sure? Type 'yes' to continue: "
if "%CONFIRM%"=="yes" (
    terraform destroy -var-file="%TFVARS_FILE%" -auto-approve
    echo %GREEN%[INFO]%NC% Resources destroyed
) else (
    echo %GREEN%[INFO]%NC% Destroy cancelled
)
goto :end

:end
echo %GREEN%[INFO]%NC% Operation completed!
endlocal 