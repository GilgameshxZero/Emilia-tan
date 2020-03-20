set filename=%1

if not defined DevEnvDir (
    call "C:\Program Files (x86)\Microsoft Visual Studio\2019\Community\VC\Auxiliary\Build\vcvarsall.bat" x64
)

cd ..\root\src
call cl ^
/EHsc ^
/Fo"..\..\obj\\" ^
/Fe"..\scripts\%filename%.exe" ^
/Fd"..\..\obj\\" ^
/O2 ^
/Ot ^
/Ox ^
/MT ^
/MP ^
/incremental ^
..\rain\cpp\*.cpp ^
"%filename%.cpp"
cd ..\..\build
