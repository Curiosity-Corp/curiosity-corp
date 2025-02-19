cd C:\Users\MatthewHackney\Desktop\80
setlocal enabledelayedexpansion
for %%a in (photo*.jpg) do (
set f=%%a
set f=!f:^(=!
set f=!f:^)=!
ren "%%a" "!f!"
)