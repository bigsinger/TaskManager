@echo off
REM TaskManager 快速启动脚本
REM 用于快速配置和启动 TaskManager 项目

echo ========================================
echo TaskManager 快速启动脚本
echo ========================================
echo.

REM 检查是否在项目根目录
if not exist "src\backend" (
    echo 错误：请在项目根目录运行此脚本
    echo.
    pause
    exit /b 1
)

echo [1/6] 检查环境变量文件...
if not exist "src\backend\.env" (
    echo .env 文件不存在，正在创建...
    copy "src\backend\.env.example" "src\backend\.env"
    echo .env 文件已创建
) else (
    echo .env 文件已存在
)
echo.

echo [2/6] 安装前端依赖...
cd src\frontend
call npm install
if %errorlevel% neq 0 (
    echo 错误：前端依赖安装失败
    pause
    exit /b 1
)
cd ..\..
echo 前端依赖安装完成
echo.

echo [3/6] 安装后端依赖...
cd src\backend
call npm install
if %errorlevel% neq 0 (
    echo 错误：后端依赖安装失败
    pause
    exit /b 1
)
cd ..\..
echo 后端依赖安装完成
echo.

echo [4/6] 初始化数据库...
cd src\backend
call npx prisma generate
if %errorlevel% neq 0 (
    echo 错误：Prisma Client 生成失败
    pause
    exit /b 1
)
cd ..\..
echo 数据库初始化完成
echo.

echo [5/6] 启动后端服务...
echo 正在启动后端服务（端口 3000）...
start "TaskManager Backend" cmd /k "cd src\backend && npx ts-node src/server.ts"
timeout /t 3 /nobreak >nul
echo 后端服务已启动
echo.

echo [6/6] 启动前端服务...
echo 正在启动前端服务（端口 3001）...
start "TaskManager Frontend" cmd /k "cd src\frontend && npx http-server -p 3001"
timeout /t 3 /nobreak >nul
echo 前端服务已启动
echo.

echo ========================================
echo 启动完成！
echo ========================================
echo.
echo 访问地址：
echo   前端：http://localhost:3001
echo   后端：http://localhost:3000
echo.
echo 注意：
echo   - 后端服务窗口和前端服务窗口会保持打开
echo   - 关闭窗口将停止对应的服务
echo   - 如需停止所有服务，请关闭两个窗口
echo.
echo 按任意键退出...
pause >nul
