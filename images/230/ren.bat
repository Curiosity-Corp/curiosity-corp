cd C:\Users\MatthewHackney\Desktop\230
setlocal enabledelayedexpansion
for %%a in (apple*.jpg) do (
set f=%%a
set f=!f:^(=!
set f=!f:^)=!
ren "%%a" "!f!"
)