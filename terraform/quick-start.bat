@echo off
echo ========================================
echo   Medical App - Terraform Quick Start
echo ========================================
echo.

REM Check if Terraform is installed
terraform version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Terraform is not installed. Please install it first:
    echo https://www.terraform.io/downloads.html
    pause
    exit /b 1
)

REM Check if AWS CLI is configured
aws sts get-caller-identity >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] AWS CLI is not configured. Please run: aws configure
    pause
    exit /b 1
)

echo [INFO] Prerequisites check passed!
echo.

REM Check if dev.tfvars exists
if not exist "environments\dev.tfvars" (
    echo [INFO] Creating dev.tfvars from example...
    copy "environments\dev.tfvars.example" "environments\dev.tfvars"
    echo.
    echo [IMPORTANT] Please edit environments\dev.tfvars with your specific configuration!
    echo Press any key to continue after editing the file...
    pause
)

echo [INFO] Initializing Terraform...
call scripts\deploy.bat dev init
if %errorlevel% neq 0 (
    echo [ERROR] Terraform init failed!
    pause
    exit /b 1
)

echo.
echo [INFO] Planning deployment...
call scripts\deploy.bat dev plan
if %errorlevel% neq 0 (
    echo [ERROR] Terraform plan failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Ready to deploy!
echo ========================================
echo.
echo To apply the changes, run:
echo   scripts\deploy.bat dev apply
echo.
echo To destroy resources later, run:
echo   scripts\deploy.bat dev destroy
echo.
pause 