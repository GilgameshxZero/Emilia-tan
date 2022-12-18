# GNU make (gmake) & nmake shared makefile.
# Conditional logic implemented with differing end-of-line comment syntax.
# To enable multithreaded compilation, nmake compiles all files together with
# /MP, while gmake compiles separately with -jN.

# Targets:
# laminate (default).

# Default target defined before any "fake" targets.
__default: _default

# ------------------------------------------------------------------------------
ifdef MAKEDIR: # gmake: false; nmake: unused target
!ifdef MAKEDIR # gmake: not seen; nmake: true
# ------------------------------------------------------------------------------

# nmake specific commands.

# Real targets.
_default: laminate-all
laminate:
	@<<laminate.bat
@ECHO OFF
sed -E -i -z -e "s/<head>.*<body class=\"vscode-body vscode-light\">\s*(.*)\s*<\/body>/<head><meta charset=\"utf-8\"\/><\/head><body><template>\n\1<\/template><\/body>/g" %SOURCE%
sed -E -i -z -e "s/(.*)\s*<script async src=\"https:\/\/cdn.jsdelivr.net\/npm\/katex-copytex@latest\/dist\/katex-copytex.min.js\"><\/script>(.*)/\1\2/g" %SOURCE%
<<NOKEEP
laminate-all:
	@<<laminate-all.bat
@ECHO OFF
FOR %%F IN (..\snapshots\*.html) DO (
	nmake laminate SOURCE=%%F
)
<<NOKEEP

# ------------------------------------------------------------------------------
!else
else
# ------------------------------------------------------------------------------

# GNU make (gmake) specific commands.

# Ensure files with the same name as fake targets do not trigger.
.PHONY: __default _default laminate
_default: laminate-all
laminate:
	@sed -E -i -z -e "s/<head>.*<body class=\"vscode-body vscode-light\">\s*(.*)\s*<\/body>/<head><meta charset=\"utf-8\"\/><\/head><body><template>\n\1<\/template><\/body>/g" $(SOURCE)
	@sed -E -i -z -e "s/(.*)\s*<script async src=\"https:\/\/cdn.jsdelivr.net\/npm\/katex-copytex@latest\/dist\/katex-copytex.min.js\"><\/script>(.*)/\1\2/g" $(SOURCE)
laminate-all:
	@for f in ../snapshots/*.html; do\
		make laminate SOURCE=$$f;\
	done

# ------------------------------------------------------------------------------
endif    # gmake: close condition; nmake: not seen
!endif : # gmake: unused target; nmake close conditional
# ------------------------------------------------------------------------------
