@echo off
rem Panel selekcji kolorowanek — do klikania dwa razy w Eksploratorze.
rem
rem Dlaczego .cmd, a nie .sh: Windows nie uruchamia .sh z podwojnego klikniecia, a caly
rem sens tego pliku polega na tym, zeby nie trzeba bylo otwierac terminala i nic wpisywac.
rem
rem Okno konsoli ZOSTAJE otwarte, bo to ono trzyma serwer — zamkniecie go konczy panel.
rem Przegladarka otwiera sie sama.
cd /d "%~dp0"
title Panel selekcji kolorowanek
echo.
echo   Panel selekcji kolorowanek
echo   Zamkniecie tego okna konczy prace panelu.
echo.
node scripts/panel-selekcji.mjs %*
if errorlevel 1 (
  echo.
  echo   Panel zakonczyl sie bledem. Przeczytaj komunikat wyzej.
  pause
)
