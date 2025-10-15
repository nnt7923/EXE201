@echo off
echo ========================================
echo    An Gi O Dau Platform - Test Runner
echo ========================================
echo.

:menu
echo Chon loai test ban muon chay:
echo.
echo 1. Setup test environment
echo 2. Run backend tests only
echo 3. Run frontend E2E tests only  
echo 4. Run complete test suite
echo 5. Run tests with coverage
echo 6. Run tests in Docker
echo 7. Exit
echo.
set /p choice="Nhap lua chon (1-7): "

if "%choice%"=="1" goto setup
if "%choice%"=="2" goto backend
if "%choice%"=="3" goto frontend
if "%choice%"=="4" goto all
if "%choice%"=="5" goto coverage
if "%choice%"=="6" goto docker
if "%choice%"=="7" goto exit
echo Lua chon khong hop le!
goto menu

:setup
echo.
echo Setting up test environment...
call npm run test:setup
pause
goto menu

:backend
echo.
echo Running backend tests...
call npm run test:backend
pause
goto menu

:frontend
echo.
echo Running frontend E2E tests...
call npm run test:frontend
pause
goto menu

:all
echo.
echo Running complete test suite...
call npm test
pause
goto menu

:coverage
echo.
echo Running tests with coverage...
cd api
call npm run test:coverage
cd ..
pause
goto menu

:docker
echo.
echo Running tests in Docker...
call npm run test:docker
pause
goto menu

:exit
echo.
echo Goodbye!
exit