@echo off
REM 安全检查脚本 (Windows 批处理版本)
REM 在提交代码前运行，确保没有敏感信息被提交

echo.
echo 🔒 开始安全检查...
echo.

set HAS_ERRORS=0
set HAS_WARNINGS=0

REM 检查 1: 确保 .env.local 被忽略
echo 📋 检查 1: 验证 .env.local 是否被 Git 忽略...
git check-ignore .env.local >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ .env.local 已被正确忽略
    echo.
) else (
    echo ❌ 错误: .env.local 没有被忽略！
    echo    请检查 .gitignore 文件
    echo.
    set HAS_ERRORS=1
)

REM 检查 2: 确保 node_modules 被忽略
echo 📋 检查 2: 验证 node_modules 是否被 Git 忽略...
git check-ignore node_modules >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ node_modules 已被正确忽略
    echo.
) else (
    echo ❌ 错误: node_modules 没有被忽略！
    echo.
    set HAS_ERRORS=1
)

REM 检查 3: 确保 dist 被忽略
echo 📋 检查 3: 验证 dist 是否被 Git 忽略...
git check-ignore dist >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ dist 已被正确忽略
    echo.
) else (
    echo ⚠️  警告: dist 没有被忽略
    echo.
    set HAS_WARNINGS=1
)

REM 检查 4: 确保 .env.example 存在
echo 📋 检查 4: 验证 .env.example 是否存在...
if exist .env.example (
    echo ✅ .env.example 文件存在
    echo.
) else (
    echo ⚠️  警告: .env.example 文件不存在
    echo    建议创建 .env.example 作为配置示例
    echo.
    set HAS_WARNINGS=1
)

REM 检查 5: 验证暂存区文件
echo 📋 检查 5: 验证暂存区文件...
git diff --cached --name-only | findstr /C:".env" >nul 2>&1
if %errorlevel% equ 0 (
    echo ❌ 错误: 暂存区包含环境变量文件！
    echo    运行: git reset HEAD .env.local
    echo.
    set HAS_ERRORS=1
) else (
    echo ✅ 暂存区没有敏感文件
    echo.
)

REM 总结
echo ==================================================
if %HAS_ERRORS% equ 1 (
    echo.
    echo ❌ 安全检查失败！请修复上述错误后再提交。
    echo.
    exit /b 1
) else if %HAS_WARNINGS% equ 1 (
    echo.
    echo ⚠️  安全检查通过，但有警告。
    echo.
    exit /b 0
) else (
    echo.
    echo ✅ 安全检查通过！可以安全提交。
    echo.
    exit /b 0
)

