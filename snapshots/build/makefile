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
_default: laminate
# Prepare HTML essays for viewing with emilia.
laminate:
	@<<laminate.bat
@ECHO OFF
FOR %%F IN (..\*.html) DO (
	sed -E -i -z -e "s/<head>.*<body class=\"vscode-body vscode-light\">(.*)<\/body>/<head><meta charset=\"utf-8\"\/><\/head><body><template>\1<\/template><\/body>/g" %%F
)
<<NOKEEP

# ------------------------------------------------------------------------------
!else
else
# ------------------------------------------------------------------------------

# GNU make (gmake) specific commands.

# Ensure files with the same name as fake targets do not trigger.
.PHONY: __default _default laminate
_default: laminate
laminate:
	@for f in ../*.html; do\
		sed -E -i -z -e "s/<head>.*<body class=\"vscode-body vscode-light\">(.*)<\/body>/<head><meta charset=\"utf-8\"\/><\/head><body><template>\1<\/template><\/body>/g" $$f;\
	done

# ------------------------------------------------------------------------------
endif    # gmake: close condition; nmake: not seen
!endif : # gmake: unused target; nmake close conditional
# ------------------------------------------------------------------------------
